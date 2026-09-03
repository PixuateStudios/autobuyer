import { TAB_BAR_HEIGHT } from "@/components/AppTabBar";
import { colors, fonts } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { useChat } from "@/lib/chat";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { conversations, loading, otherName } = useChat();

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20 }}>
        <View style={styles.top}>
          <Text style={styles.title}>Messages</Text>
          <TouchableOpacity style={styles.newBtn} onPress={() => router.push("/chat-new")}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.lede}>
          Chats are end-to-end encrypted on this device. Dealers never see your phone number or email in the thread.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom,
        }}
      >
        {!conversations.length ? (
          <View style={styles.empty}>
            <View style={styles.iconWrap}>
              <Ionicons name="lock-closed-outline" size={28} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>{loading ? "Loading chats…" : "No conversations yet"}</Text>
            <Text style={styles.emptyCopy}>
              When a dealer unlocks an interest, the thread appears here. You can also start a secure chat if you already have their AutoQuest email.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {conversations.map((conv, index) => (
              <TouchableOpacity
                key={conv.id}
                style={[styles.row, index < conversations.length - 1 && styles.divider]}
                onPress={() => router.push({ pathname: "/chat/[id]", params: { id: conv.id } })}
              >
                <View style={styles.avatar}>
                  <Ionicons name="storefront-outline" size={18} color={colors.primary} />
                </View>
                <View style={styles.copy}>
                  <Text style={styles.name}>{user ? otherName(conv, user.uid) : "Chat"}</Text>
                  <Text style={styles.preview} numberOfLines={1}>
                    {conv.lastPreview || "Encrypted message"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.text,
  },
  newBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#E8F1FF",
    alignItems: "center",
    justifyContent: "center",
  },
  lede: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  empty: {
    marginTop: 48,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#E8F1FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  emptyCopy: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    textAlign: "center",
  },
  list: {
    borderRadius: 18,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#F1F5F9",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F1F5F9",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#E8F1FF",
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  preview: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
});
