import { colors, fonts } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { useCall } from "@/lib/calling";
import { db } from "@/lib/firebase";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { hangup } = useCall();
  const [status, setStatus] = useState("Connecting");
  const [peerName, setPeerName] = useState("Call");

  useEffect(() => {
    if (!id) return;
    return onSnapshot(doc(db, "calls", id), (snap) => {
      const data = snap.data();
      if (!data) return;
      const iAmCaller = data.callerId === user?.uid;
      const otherName = iAmCaller ? data.calleeName || "Dealer" : data.callerName || "Call";
      setPeerName(otherName);
      if (data.status === "ringing") setStatus(iAmCaller ? "Ringing" : "Connecting");
      if (data.status === "active") setStatus("On call");
      if (data.status === "ended" || data.status === "declined") {
        setStatus(data.status === "declined" ? "Declined" : "Ended");
        setTimeout(() => {
          if (router.canGoBack()) router.back();
        }, 600);
      }
    });
  }, [id, user?.uid]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.status}>{status}</Text>
      <Text style={styles.name}>{peerName}</Text>
      <Text style={styles.hint}>Native audio · encrypted signaling</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.hangup}
          onPress={async () => {
            if (id) await hangup(id);
            if (router.canGoBack()) router.back();
          }}
        >
          <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: "135deg" }] }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "space-between",
  },
  status: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: "#94A3B8",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 32,
    color: "#fff",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: "#64748B",
  },
  actions: {
    alignItems: "center",
    marginBottom: 20,
  },
  hangup: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.red,
    alignItems: "center",
    justifyContent: "center",
  },
});
