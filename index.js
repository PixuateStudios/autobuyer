import { AppRegistry } from "react-native";

AppRegistry.registerHeadlessTask("RNCallKeepBackgroundMessage", () => async (data) => {
  const { setupNativeCalling, showNativeIncoming, bindCallUuid } = await import("./lib/nativeCall");
  await setupNativeCalling();
  const callId = String(data?.callId || data?.handle || "");
  const uuid = data?.callUUID || data?.uuid || data?.nativeUuid;
  const name = String(data?.name || data?.callerName || "Dealer");
  if (!callId && !uuid) return;
  if (uuid && callId) bindCallUuid(callId, String(uuid));
  showNativeIncoming(callId || String(uuid), name, uuid ? String(uuid) : undefined);
});

import "expo-router/entry";
