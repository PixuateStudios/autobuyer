import { TAB_BAR_HEIGHT } from "@/components/AppTabBar";
import { colors, fonts } from "@/constants/theme";
import {
  formatPreference,
  INTEREST_COLORS,
  interestMeta,
  interestTitle,
  preferenceMeta,
} from "@/lib/buyer";
import { useBuyer } from "@/lib/buyerProfile";
import { useAuth } from "@/lib/auth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.72;
const CARD_GAP = 12;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { profile, loading, error } = useBuyer();
  const [interestIndex, setInterestIndex] = useState(0);

  const onInterestScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    const next = Math.round(x / (CARD_WIDTH + CARD_GAP));
    setInterestIndex(Math.min(Math.max(next, 0), Math.max(profile.interests.length - 1, 0)));
  };

  const metaLine = [profile.status, profile.location].filter(Boolean).join(" • ");

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_HEIGHT + insets.bottom },
        ]}
      >
        <View style={styles.identity}>
          <Text style={styles.name}>{profile.name || "Your profile"}</Text>
          {metaLine ? <Text style={styles.meta}>{metaLine}</Text> : null}
          <View style={styles.stats}>
            <Text style={styles.stat}>
              {profile.interests.length} interest{profile.interests.length === 1 ? "" : "s"}
            </Text>
            <Text style={styles.statDot}>•</Text>
            <Text style={styles.stat}>
              {profile.preferences.length} preference{profile.preferences.length === 1 ? "" : "s"}
            </Text>
          </View>
          {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : (
            <Text style={styles.bio}>Tell dealers who you are and what you want. Nothing here is shared as a phone number or email.</Text>
          )}
          <TouchableOpacity style={styles.editBtn} activeOpacity={0.8} onPress={() => router.push("/profile-edit")}>
            <Ionicons name="pencil" size={15} color={colors.text} />
            <Text style={styles.editLabel}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {loading ? <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.sectionHead}>
          <Text style={styles.sectionLabel}>GENERAL PREFERENCES</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => router.push("/preference-edit")}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        {profile.preferences.length ? (
          <View style={styles.chips}>
            {profile.preferences.map((pref) => {
              const meta = preferenceMeta(pref.kind);
              return (
                <TouchableOpacity
                  key={pref.id}
                  style={styles.chip}
                  onPress={() => router.push({ pathname: "/preference-edit", params: { id: pref.id } })}
                >
                  <Ionicons name={meta.icon} size={15} color={meta.color} />
                  <Text style={styles.chipLabel}>{formatPreference(pref)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <TouchableOpacity style={styles.emptyCard} onPress={() => router.push("/preference-edit")}>
            <Text style={styles.emptyTitle}>Add what you're shopping for</Text>
            <Text style={styles.emptyCopy}>Body style, budget, mileage, location, or anything else dealers should know.</Text>
          </TouchableOpacity>
        )}

        <View style={styles.interestHeader}>
          <Text style={styles.interestTitle}>Vehicle Interests</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => router.push("/interest-edit")}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {profile.interests.length ? (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + CARD_GAP}
              decelerationRate="fast"
              onMomentumScrollEnd={onInterestScroll}
              contentContainerStyle={styles.carousel}
            >
              {profile.interests.map((interest, index) => {
                const palette = INTEREST_COLORS[index % INTEREST_COLORS.length];
                const tags = [
                  ...(interest.color ? [interest.color] : []),
                  ...interest.tags,
                ].slice(0, 3);
                return (
                  <TouchableOpacity
                    key={interest.id}
                    activeOpacity={0.9}
                    onPress={() => router.push({ pathname: "/interest-edit", params: { id: interest.id } })}
                  >
                    <LinearGradient
                      colors={palette}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.interestCard}
                    >
                      <View style={styles.carIcon}>
                        <Ionicons name="car-sport" size={18} color={colors.primary} />
                      </View>
                      <Text style={styles.interestName}>{interestTitle(interest)}</Text>
                      <Text style={styles.interestMeta}>{interestMeta(interest) || "Tap to add details"}</Text>
                      {tags.length ? (
                        <View style={styles.interestTags}>
                          {tags.map((tag) => (
                            <View key={tag} style={styles.interestTag}>
                              <Text style={styles.interestTagText}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {profile.interests.length > 1 ? (
              <View style={styles.dots}>
                {profile.interests.map((interest, index) => (
                  <View
                    key={interest.id}
                    style={[styles.dot, index === interestIndex && styles.dotActive]}
                  />
                ))}
              </View>
            ) : null}
          </>
        ) : (
          <TouchableOpacity style={styles.emptyCard} onPress={() => router.push("/interest-edit")}>
            <Text style={styles.emptyTitle}>Name a vehicle you want</Text>
            <Text style={styles.emptyCopy}>Make, model, years, color, and must-haves. Dealers unlock an interest to chat.</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.signOutBtn} activeOpacity={0.8} onPress={() => logout()}>
          <Text style={styles.signOutLabel}>Sign out</Text>
        </TouchableOpacity>
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
    paddingBottom: 28,
  },
  identity: {
    paddingHorizontal: 24,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.text,
  },
  meta: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  stat: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  statDot: {
    color: colors.textMuted,
    fontSize: 13,
  },
  bio: {
    marginTop: 14,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  editBtn: {
    marginTop: 18,
    width: "100%",
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  editLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  error: {
    marginTop: 12,
    paddingHorizontal: 24,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.red,
  },
  sectionHead: {
    marginTop: 28,
    marginBottom: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: colors.textMuted,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 24,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    backgroundColor: colors.background,
  },
  chipLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  emptyCard: {
    marginHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.chipBorder,
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
  interestHeader: {
    marginTop: 28,
    marginBottom: 14,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  interestTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  carousel: {
    paddingHorizontal: 24,
    gap: CARD_GAP,
  },
  interestCard: {
    width: CARD_WIDTH,
    minHeight: 148,
    borderRadius: 20,
    padding: 18,
  },
  carIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  interestName: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: "#FFFFFF",
  },
  interestMeta: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
  },
  interestTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
  },
  interestTag: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  interestTagText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: "#FFFFFF",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  signOutBtn: {
    marginTop: 28,
    marginHorizontal: 24,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  signOutLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.textMuted,
  },
});
