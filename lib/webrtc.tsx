import { Platform, StyleSheet, View } from "react-native";
import type { ComponentType } from "react";

const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

type Peer = {
  addTrack: (track: MediaStreamTrack, stream: MediaStream) => void;
  addIceCandidate: (c: unknown) => Promise<void>;
  createOffer: (opts?: object) => Promise<{ type: string; sdp?: string }>;
  createAnswer: () => Promise<{ type: string; sdp?: string }>;
  setLocalDescription: (desc: unknown) => Promise<void>;
  setRemoteDescription: (desc: unknown) => Promise<void>;
  close: () => void;
  onicecandidate: ((ev: { candidate: { toJSON?: () => object } | null }) => void) | null;
  onconnectionstatechange: (() => void) | null;
  ontrack: ((ev: { streams: Array<{ toURL?: () => string }>; track: MediaStreamTrack }) => void) | null;
  connectionState?: string;
  signalingState?: string;
  remoteDescription?: unknown;
};

async function loadNative() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("react-native-webrtc/lib/commonjs/index.js") as {
    RTCPeerConnection: new (config: object) => Peer;
    mediaDevices: { getUserMedia: (c: object) => Promise<MediaStream> };
  };
  return mod;
}

export async function createPeerConnection() {
  if (Platform.OS === "web") {
    const Ctor = globalThis.RTCPeerConnection;
    return new Ctor({ iceServers }) as unknown as Peer;
  }
  const { RTCPeerConnection: NativePeer } = await loadNative();
  return new NativePeer({ iceServers });
}

export async function getAudioStream() {
  if (Platform.OS === "web") {
    return navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  }
  const { mediaDevices } = await loadNative();
  return mediaDevices.getUserMedia({ audio: true, video: false });
}

export function listenForRemoteAudio(connection: Peer, onUrl: (url: string) => void) {
  connection.ontrack = (ev) => {
    const stream = ev.streams?.[0];
    const url = stream?.toURL?.();
    if (url) onUrl(url);
    ev.track.enabled = true;
  };
}

export function RemoteAudioSink({ streamUrl }: { streamUrl: string | null }) {
  if (!streamUrl || Platform.OS === "web") return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { RTCView } = require("react-native-webrtc/lib/commonjs/index.js") as {
    RTCView: ComponentType<{ streamURL: string; style?: object }>;
  };
  return (
    <View pointerEvents="none" style={styles.sink}>
      <RTCView streamURL={streamUrl} style={styles.sink} />
    </View>
  );
}

const styles = StyleSheet.create({
  sink: {
    width: 1,
    height: 1,
    opacity: 0,
    position: "absolute",
  },
});

export type { Peer };
