import { useAuth } from "@/lib/auth";
import { sendIncomingCallPush } from "@/lib/push";
import { createPeerConnection, getAudioStream, listenForRemoteAudio, RemoteAudioSink, type Peer } from "@/lib/webrtc";
import { reportError } from "@/lib/errors";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { newId } from "@/lib/buyer";
import {
  bindCallUuid,
  endNativeCall,
  hasNativeCalling,
  onNativeAnswer,
  onNativeEnd,
  setNativeCallConnected,
  setupNativeCalling,
  showNativeIncoming,
  startNativeOutgoing,
  uuidForCall,
} from "@/lib/nativeCall";
import { registerCallBackgroundTask } from "@/lib/callBackground";

export type CallDoc = {
  id: string;
  users: string[];
  callerId: string;
  calleeId: string;
  conversationId?: string;
  callerName: string;
  calleeName?: string;
  nativeUuid?: string;
  status: "ringing" | "active" | "ended" | "declined";
  offer?: { type: string; sdp?: string } | null;
  answer?: { type: string; sdp?: string } | null;
};

type CallContextValue = {
  incoming: CallDoc | null;
  activeCall: CallDoc | null;
  usesNativeUi: boolean;
  startCall: (opts: { calleeId: string; calleeName: string; conversationId: string; calleePushToken?: string }) => Promise<string>;
  answerCall: (call: CallDoc) => Promise<void>;
  declineCall: (callId: string) => Promise<void>;
  hangup: (callId: string) => Promise<void>;
};

const CallContext = createContext<CallContextValue | null>(null);

let peer: Peer | null = null;
let localStream: MediaStream | null = null;
let answeringId: string | null = null;
let appliedAnswerFor: string | null = null;
let pendingIce: unknown[] = [];

async function flushPendingIce(connection: Peer) {
  const queued = pendingIce;
  pendingIce = [];
  for (const candidate of queued) {
    try {
      await connection.addIceCandidate(candidate);
    } catch (error) {
      reportError("Adding queued ICE candidate", error, { alert: false });
    }
  }
}

async function resetMedia() {
  pendingIce = [];
  localStream?.getTracks().forEach((track) => track.stop());
  localStream = null;
  try {
    peer?.close();
  } catch {
    // already closed
  }
  peer = null;
}

export function CallProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [incoming, setIncoming] = useState<CallDoc | null>(null);
  const [activeCall, setActiveCall] = useState<CallDoc | null>(null);
  const [usesNativeUi, setUsesNativeUi] = useState(false);
  const [remoteStreamUrl, setRemoteStreamUrl] = useState<string | null>(null);
  const iceUnsub = useRef<(() => void) | null>(null);
  const callUnsub = useRef<(() => void) | null>(null);
  const incomingRef = useRef<CallDoc | null>(null);
  const activeRef = useRef<CallDoc | null>(null);
  const answerRef = useRef<(call: CallDoc) => Promise<void>>(async () => undefined);
  const declineRef = useRef<(id: string) => Promise<void>>(async () => undefined);
  const hangupRef = useRef<(id: string) => Promise<void>>(async () => undefined);
  const userRef = useRef(user);
  userRef.current = user;

  incomingRef.current = incoming;
  activeRef.current = activeCall;

  const attachIce = useCallback((callId: string, uid: string, users: string[], connection: Peer) => {
    iceUnsub.current?.();
    connection.onicecandidate = (ev) => {
      const json = ev.candidate?.toJSON?.() ?? ev.candidate;
      if (!json) return;
      addDoc(collection(db, "calls", callId, "ice"), { from: uid, users, candidate: json }).catch((error) => {
        reportError("Sharing ICE candidate", error, { alert: false });
      });
    };
    iceUnsub.current = onSnapshot(
      query(collection(db, "calls", callId, "ice"), where("users", "array-contains", uid)),
      (snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type !== "added") return;
          const data = change.doc.data();
          if (data.from === uid || !data.candidate) return;
          if (!connection.remoteDescription) {
            pendingIce.push(data.candidate);
            return;
          }
          connection.addIceCandidate(data.candidate).catch((error) => {
            reportError("Adding ICE candidate", error, { alert: false });
          });
        });
      },
      (error) => reportError("Listening for ICE candidates", error, { alert: false })
    );
  }, []);

  const watchRemote = useCallback((callId: string, role: "caller" | "callee", connection: Peer) => {
    callUnsub.current?.();
    callUnsub.current = onSnapshot(doc(db, "calls", callId), async (snap) => {
      const data = snap.data();
      if (!data) return;
      if (data.status === "ended" || data.status === "declined") {
        endNativeCall(callId);
        answeringId = null;
        appliedAnswerFor = null;
        await resetMedia();
        setActiveCall(null);
        setIncoming(null);
        setRemoteStreamUrl(null);
        return;
      }
      if (data.status === "active") {
        setNativeCallConnected(callId);
      }
      if (role === "caller" && data.answer && connection) {
        const state = connection.signalingState;
        if (appliedAnswerFor === callId || (state && state !== "have-local-offer")) {
          return;
        }
        try {
          appliedAnswerFor = callId;
          await connection.setRemoteDescription(data.answer);
          await flushPendingIce(connection);
        } catch (error) {
          appliedAnswerFor = null;
          reportError("Applying remote answer", error, { alert: false });
        }
      }
    });
  }, []);

  const goToCallScreen = useCallback((callId: string) => {
    if (hasNativeCalling()) return;
    router.push({ pathname: "/call/[id]", params: { id: callId } });
  }, []);

  useEffect(() => {
    let offAnswer = () => undefined as void;
    let offEnd = () => undefined as void;
    (async () => {
      const ok = await setupNativeCalling();
      setUsesNativeUi(ok);
      if (ok) {
        await registerCallBackgroundTask();
      }
      offAnswer = onNativeAnswer(async (callId) => {
        let call = incomingRef.current;
        if (!call || (call.id !== callId && call.nativeUuid !== callId)) {
          const snap = await getDoc(doc(db, "calls", callId));
          if (snap.exists()) {
            call = { id: snap.id, ...snap.data() } as CallDoc;
          } else if (userRef.current?.uid) {
            const list = await getDocs(
              query(collection(db, "calls"), where("users", "array-contains", userRef.current.uid))
            );
            const match = list.docs.find((item) => item.id === callId || item.data().nativeUuid === callId);
            if (!match) return;
            call = { id: match.id, ...match.data() } as CallDoc;
          } else {
            return;
          }
        }
        await answerRef.current(call);
      });
      offEnd = onNativeEnd(async (callId) => {
        const live = activeRef.current;
        const ringing = incomingRef.current;
        const isSame = (row: CallDoc | null) =>
          !!row && (row.id === callId || row.nativeUuid === callId);
        if (isSame(ringing) && ringing?.status === "ringing") {
          await declineRef.current(ringing.id);
          return;
        }
        if (isSame(live) && live) {
          await hangupRef.current(live.id);
        }
      });
    })();
    return () => {
      offAnswer();
      offEnd();
    };
  }, []);

  useEffect(() => {
    const received = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data as {
        type?: string;
        callId?: string;
        callerName?: string;
        nativeUuid?: string;
      };
      if (data?.type !== "incoming-call" || !data.callId) return;
      if (data.nativeUuid) bindCallUuid(String(data.callId), String(data.nativeUuid));
      const shown = showNativeIncoming(
        String(data.callId),
        String(data.callerName || "Dealer"),
        data.nativeUuid ? String(data.nativeUuid) : undefined
      );
      if (shown) setUsesNativeUi(true);
    });
    const tapped = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as {
        type?: string;
        callId?: string;
        callerName?: string;
        nativeUuid?: string;
      };
      if (data?.type !== "incoming-call" || !data.callId) return;
      if (data.nativeUuid) bindCallUuid(String(data.callId), String(data.nativeUuid));
      showNativeIncoming(
        String(data.callId),
        String(data.callerName || "Dealer"),
        data.nativeUuid ? String(data.nativeUuid) : undefined
      );
    });
    return () => {
      received.remove();
      tapped.remove();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setIncoming(null);
      return;
    }
    const q = query(collection(db, "calls"), where("users", "array-contains", user.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((item) => ({ id: item.id, ...item.data() }) as CallDoc);
        const mineIncoming = rows.find(
          (row) => row.calleeId === user.uid && row.status === "ringing"
        );
        const live = rows.find(
          (row) => row.users.includes(user.uid) && (row.status === "active" || row.status === "ringing")
        );
        setIncoming(mineIncoming ?? null);
        if (mineIncoming) {
          if (mineIncoming.nativeUuid) bindCallUuid(mineIncoming.id, mineIncoming.nativeUuid);
          const shown = showNativeIncoming(
            mineIncoming.id,
            mineIncoming.callerName,
            mineIncoming.nativeUuid
          );
          if (shown) setUsesNativeUi(true);
        }
        if (live && live.status === "active") {
          setActiveCall(live);
          setNativeCallConnected(live.id);
        }
      },
      (error) => reportError("Listening for calls", error)
    );
    return unsub;
  }, [user]);

  const startCall = useCallback(
    async (opts: { calleeId: string; calleeName: string; conversationId: string; calleePushToken?: string }) => {
      if (!user) throw new Error("Not signed in");
      const callId = newId();
      const nativeUuid = uuidForCall(callId);
      try {
        await setDoc(doc(db, "calls", callId), {
          users: [user.uid, opts.calleeId],
          callerId: user.uid,
          calleeId: opts.calleeId,
          conversationId: opts.conversationId,
          callerName: user.displayName || user.email || "Buyer",
          calleeName: opts.calleeName,
          nativeUuid,
          status: "ringing",
          offer: null,
          answer: null,
          createdAt: serverTimestamp(),
        });

        const native = startNativeOutgoing(callId, opts.calleeName, nativeUuid);
        setUsesNativeUi(native);
        goToCallScreen(callId);

        let callee: Record<string, string> | undefined;
        try {
          const calleeSnap = await getDoc(doc(db, "users", opts.calleeId));
          callee = calleeSnap.data() as Record<string, string> | undefined;
        } catch (error) {
          reportError("Loading callee push tokens", error, { alert: false });
        }

        const stream = await getAudioStream();
        localStream = stream;
        const connection = await createPeerConnection();
        peer = connection;
        listenForRemoteAudio(connection, setRemoteStreamUrl);
        stream.getTracks().forEach((track) => connection.addTrack(track, stream));
        attachIce(callId, user.uid, [user.uid, opts.calleeId], connection);
        const offer = await connection.createOffer({ offerToReceiveAudio: true });
        await connection.setLocalDescription(offer);
        await updateDoc(doc(db, "calls", callId), { offer: { type: offer.type, sdp: offer.sdp } });
        watchRemote(callId, "caller", connection);
        setActiveCall({
          id: callId,
          users: [user.uid, opts.calleeId],
          callerId: user.uid,
          calleeId: opts.calleeId,
          conversationId: opts.conversationId,
          callerName: user.displayName || "Buyer",
          calleeName: opts.calleeName,
          nativeUuid,
          status: "ringing",
        });
        await sendIncomingCallPush({
          token: opts.calleePushToken ?? callee?.expoPushToken,
          voipToken: callee?.voipPushToken,
          devicePushToken: callee?.devicePushToken,
          pushPlatform: callee?.pushPlatform,
          calleeId: opts.calleeId,
          callerName: user.displayName || user.email || "Buyer",
          callId,
          nativeUuid,
        });
        return callId;
      } catch (error) {
        reportError("Starting call", error);
        endNativeCall(callId);
        await resetMedia();
        throw error;
      }
    },
    [attachIce, goToCallScreen, user, watchRemote]
  );

  const answerCall = useCallback(
    async (call: CallDoc) => {
      if (!user) return;
      if (answeringId === call.id || (activeRef.current?.id === call.id && peer)) {
        return;
      }
      answeringId = call.id;
      try {
        const snap = await getDoc(doc(db, "calls", call.id));
        const data = snap.data();
        if (!data?.offer) {
          throw new Error("Call has no offer yet");
        }
        if (peer) {
          await resetMedia();
        }
        const stream = await getAudioStream();
        localStream = stream;
        const connection = await createPeerConnection();
        peer = connection;
        listenForRemoteAudio(connection, setRemoteStreamUrl);
        stream.getTracks().forEach((track) => connection.addTrack(track, stream));
        attachIce(call.id, user.uid, call.users, connection);
        await connection.setRemoteDescription(data.offer);
        await flushPendingIce(connection);
        const answer = await connection.createAnswer();
        await connection.setLocalDescription(answer);
        await updateDoc(doc(db, "calls", call.id), {
          answer: { type: answer.type, sdp: answer.sdp },
          status: "active",
        });
        watchRemote(call.id, "callee", connection);
        setIncoming(null);
        setActiveCall({ ...call, status: "active" });
        setNativeCallConnected(call.id);
        goToCallScreen(call.id);
      } catch (error) {
        answeringId = null;
        reportError("Answering call", error);
      }
    },
    [attachIce, goToCallScreen, user, watchRemote]
  );

  const declineCall = useCallback(async (callId: string) => {
    try {
      await updateDoc(doc(db, "calls", callId), { status: "declined" });
    } catch (error) {
      reportError("Declining call", error);
    }
    endNativeCall(callId);
    answeringId = null;
    setIncoming(null);
    setRemoteStreamUrl(null);
    await resetMedia();
  }, []);

  const hangup = useCallback(async (callId: string) => {
    try {
      await updateDoc(doc(db, "calls", callId), { status: "ended" });
    } catch (error) {
      reportError("Ending call", error, { alert: false });
    }
    iceUnsub.current?.();
    callUnsub.current?.();
    endNativeCall(callId);
    answeringId = null;
    appliedAnswerFor = null;
    setActiveCall(null);
    setIncoming(null);
    setRemoteStreamUrl(null);
    await resetMedia();
  }, []);

  answerRef.current = answerCall;
  declineRef.current = declineCall;
  hangupRef.current = hangup;

  const value = useMemo(
    () => ({ incoming, activeCall, usesNativeUi, startCall, answerCall, declineCall, hangup }),
    [activeCall, answerCall, declineCall, hangup, incoming, startCall, usesNativeUi]
  );

  return (
    <CallContext.Provider value={value}>
      {children}
      <RemoteAudioSink streamUrl={remoteStreamUrl} />
    </CallContext.Provider>
  );
}

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) {
    throw new Error("useCall must be used inside CallProvider");
  }
  return ctx;
}
