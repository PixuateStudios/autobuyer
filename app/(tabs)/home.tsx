import { TAB_BAR_HEIGHT } from "@/components/AppTabBar";
import { colors, fonts } from "@/constants/theme";
import { interestTitle } from "@/lib/buyer";
import { useBuyer } from "@/lib/buyerProfile";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useBuyer();

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_HEIGHT + insets.bottom },
        ]}
      >
        <Text style={styles.title}>Home</Text>
        <Text style={styles.lede}>
          Dealers match you from your interests and chat in-app. Your phone number and email stay private.
        </Text>

        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.interests.length}</Text>
            <Text style={styles.statLabel}>Vehicle interests</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.preferences.length}</Text>
            <Text style={styles.statLabel}>Preferences</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Dealer matches</Text>
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Your interests</Text>
          <TouchableOpacity onPress={() => router.push("/interest-edit")}>
            <Text style={styles.link}>Add</Text>
          </TouchableOpacity>
        </View>

        {profile.interests.length ? (
          <View style={styles.cardList}>
            {profile.interests.map((interest, index) => (
              <TouchableOpacity
                key={interest.id}
                style={[styles.matchRow, index < profile.interests.length - 1 && styles.rowDivider]}
                onPress={() => router.push({ pathname: "/interest-edit", params: { id: interest.id } })}
              >
                <View style={styles.dealerMark}>
                  <Ionicons name="car-sport-outline" size={18} color={colors.primary} />
                </View>
                <View style={styles.matchCopy}>
                  <Text style={styles.matchDealer}>{interestTitle(interest)}</Text>
                  <Text style={styles.matchDetail}>
                    {[interest.yearMin && interest.yearMax ? `${interest.yearMin}-${interest.yearMax}` : null, interest.bodyStyle]
                      .filter(Boolean)
                      .join(" • ") || "Tap to add details"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <TouchableOpacity style={styles.emptyCard} onPress={() => router.push("/interest-edit")}>
            <Text style={styles.emptyTitle}>No vehicle interests yet</Text>
            <Text style={styles.emptyCopy}>Add a make and model so local dealers can find you.</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionLabel}>SELLER MATCHES</Text>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Waiting on dealers</Text>
          <Text style={styles.emptyCopy}>
            When a seller matches one of your interests, it will show up here.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.text,
  },
  lede: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  statRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    alignItems: "center",
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text,
  },
  statLabel: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "center",
  },
  sectionHead: {
    marginTop: 28,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  link: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.primary,
  },
  sectionLabel: {
    marginTop: 28,
    marginBottom: 12,
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: colors.textMuted,
  },
  cardList: {
    borderRadius: 18,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F1F5F9",
  },
  dealerMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E8F1FF",
    alignItems: "center",
    justifyContent: "center",
  },
  matchCopy: {
    flex: 1,
  },
  matchDealer: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  matchDetail: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEF0F3",
    borderStyle: "dashed",
    padding: 16,
  },
  emptyTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  emptyCopy: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
});
