import { colors, fonts } from "@/constants/theme";
import { useCall } from "@/lib/calling";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function IncomingCallOverlay() {
  const insets = useSafeAreaInsets();
  const { incoming, answerCall, declineCall, usesNativeUi } = useCall();

  if (!incoming || usesNativeUi) {
    return null;
  }

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 48 }]}>
      <Text style={styles.kicker}>Incoming call</Text>
      <Text style={styles.name}>{incoming.callerName}</Text>
      <Text style={styles.sub}>Audio call</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.round, styles.decline]} onPress={() => declineCall(incoming.id)}>
          <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: "135deg" }] }} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.round, styles.answer]} onPress={() => answerCall(incoming)}>
          <Ionicons name="call" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  kicker: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    letterSpacing: 1.4,
    color: "#94A3B8",
    textTransform: "uppercase",
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 32,
    color: "#fff",
    textAlign: "center",
  },
  sub: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: "#94A3B8",
  },
  actions: {
    flexDirection: "row",
    gap: 40,
  },
  round: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  decline: {
    backgroundColor: colors.red,
  },
  answer: {
    backgroundColor: colors.green,
  },
});
