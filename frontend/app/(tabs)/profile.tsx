import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Share, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  ArrowDown01Icon,
  Notification03Icon,
  PencilEdit02Icon,
  Settings02Icon,
  Share08Icon,
} from "@hugeicons/core-free-icons";
import { Avatar } from "@/components/avatar";
import { AnimatedPress } from "@/components/animated-press";
import { Icon } from "@/components/icon";
import { Card, Row, Screen, Stack } from "@/components/layout";
import { Typography } from "@/components/typography";
import { useAuth } from "@/lib/auth-context";
import { getDemoUserById } from "@/lib/demo-users";
import { generateMockHabits, type HabitView } from "@/lib/habits";
import { pickPhoto } from "@/lib/mock";
import { triggerDemoNotification } from "@/lib/notifications";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import { type AppProfile, ensureProfile, supabase } from "@/lib/supabase";

const POSTS = Array.from({ length: 9 }).map((_, index) => ({
  photoIdx: index,
}));

const FALLBACK_STATS = {
  habits: 6,
  bestStreak: 21,
  friends: 42,
  circles: 3,
};

const FALLBACK_BIO =
  "Stacking small habits into something bigger. Currently chasing 100 days of morning walks.";

export default function Profile() {
  const { user, demoSession, signOut } = useAuth();
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const demoUser = user ? getDemoUserById(user.id) : undefined;
  const demoHabit = useMemo<HabitView | null>(
    () => (demoSession ? generateMockHabits()[0] ?? null : null),
    [demoSession],
  );

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      if (demoSession) {
        if (isActive) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      if (!user) {
        if (isActive) {
          setError("No signed-in user found.");
          setLoading(false);
        }
        return;
      }

      await ensureProfile(user);

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("id, display_name, handle, avatar_url, bio, created_at")
        .eq("id", user.id)
        .single();

      if (!isActive) return;

      if (profileError) {
        setError(profileError.message);
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    loadProfile().catch((loadError: unknown) => {
      if (!isActive) return;
      setError(loadError instanceof Error ? loadError.message : "Failed to load profile.");
      setLoading(false);
    });

    return () => {
      isActive = false;
    };
  }, [demoSession, user]);

  const displayName = profile?.display_name ?? demoSession?.displayName ?? demoUser?.name ?? "Presence User";
  const handle = profile?.handle ?? demoSession?.handle ?? "presence";
  const bio =
    profile?.bio ??
    demoSession?.bio ??
    FALLBACK_BIO;
  const joinedLabel = formatJoinDate(profile?.created_at ?? demoSession?.createdAt ?? null);
  const avatarLetter = displayName.slice(0, 1).toUpperCase() || "P";

  const stats = demoUser?.stats ?? FALLBACK_STATS;
  const statsList = [
    { label: "Habits", value: String(stats.habits) },
    { label: "Best streak", value: String(stats.bestStreak) },
    { label: "Friends", value: String(stats.friends) },
    { label: "Circles", value: String(stats.circles) },
  ];
  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out @${handle} on presence! https://presence.app/${handle}`,
      });
    } catch {}
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  };

  const header = (
    <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
      <AnimatedPress
        style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
        haptic="light"
      >
        <Typography
          style={{
            fontFamily: fonts.heading,
            fontSize: 20,
            lineHeight: 24,
            color: colors.fg,
          }}
        >
          @{handle}
        </Typography>
        <Icon icon={ArrowDown01Icon} size={18} color={colors.fgDim} strokeWidth={2} />
      </AnimatedPress>
      <Pressable
        disabled={signingOut}
        onPress={handleSignOut}
        style={{
          width: 44,
          height: 44,
          borderRadius: radius.pill,
          backgroundColor: colors.bgRaised,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon icon={Settings02Icon} size={20} color={colors.fg} strokeWidth={1.8} />
      </Pressable>
    </Row>
  );

  return (
    <Screen stickyHeader={header}>
      {loading ? (
        <View style={{ alignItems: "center", paddingVertical: spacing.xxxl }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <>
          <Stack gap={spacing.lg} style={{ alignItems: "center", paddingTop: spacing.sm }}>
            {demoUser?.avatar ? (
              <Image
                source={demoUser.avatar}
                style={{ width: 104, height: 104, borderRadius: radius.pill }}
                contentFit="cover"
              />
            ) : (
              <Avatar color={colors.primary} letter={avatarLetter} size={104} ring={false} />
            )}
            <Stack gap={spacing.xs} style={{ alignItems: "center" }}>
              <Typography
                style={{
                  fontFamily: fonts.heading,
                  fontSize: 30,
                  lineHeight: 36,
                  color: colors.fg,
                }}
              >
                {displayName}
              </Typography>
              <Typography variant="metaItalic">@{handle} — joined {joinedLabel}</Typography>
            </Stack>
            <Typography
              variant="lede"
              style={{ textAlign: "center", paddingHorizontal: spacing.lg }}
            >
              {bio}
            </Typography>

            <Row gap={spacing.sm} style={{ width: "100%", paddingHorizontal: spacing.sm }}>
              <AnimatedPress
                style={[profileStyles.actionBtn, profileStyles.actionBtnFilled]}
                haptic="light"
                onPress={() => router.push("/edit-profile")}
              >
                <Icon icon={PencilEdit02Icon} size={16} color={colors.onPrimary} />
                <Typography style={[profileStyles.actionBtnText, { color: colors.onPrimary }]}>
                  Edit profile
                </Typography>
              </AnimatedPress>

              <AnimatedPress
                style={[profileStyles.actionBtn, profileStyles.actionBtnOutline]}
                haptic="light"
                onPress={handleShareProfile}
              >
                <Icon icon={Share08Icon} size={16} color={colors.fg} />
                <Typography style={[profileStyles.actionBtnText, { color: colors.fg }]}>
                  Share profile
                </Typography>
              </AnimatedPress>
            </Row>
          </Stack>

          <Row style={{ justifyContent: "space-between", paddingVertical: spacing.xs }}>
            {statsList.map((stat) => (
              <View key={stat.label} style={{ alignItems: "center", flex: 1 }}>
                <Typography
                  style={{
                    fontFamily: fonts.heading,
                    fontSize: 28,
                    lineHeight: 32,
                    color: colors.fg,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="metaItalic">{stat.label}</Typography>
              </View>
            ))}
          </Row>

          <DemoNotificationButton userId={user?.id} fallbackHabit={demoHabit} />

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {POSTS.map((post, index) => (
              <View key={index} style={{ width: "31.8%" }}>
                <View
                  style={{
                    aspectRatio: 1,
                    borderRadius: radius.sm,
                    overflow: "hidden",
                    backgroundColor: colors.bgSunk,
                  }}
                >
                  <Image
                    source={pickPhoto(post.photoIdx)}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    transition={240}
                  />
                </View>
              </View>
            ))}
          </View>

          {error ? (
            <Card style={{ borderColor: colors.danger }}>
              <Typography variant="bodyMuted" color={colors.danger}>
                {error}
              </Typography>
            </Card>
          ) : null}
        </>
      )}
    </Screen>
  );
}

function DemoNotificationButton({
  userId,
  fallbackHabit,
}: {
  userId?: string;
  fallbackHabit?: HabitView | null;
}) {
  const [sent, setSent] = useState(false);

  const handlePress = async () => {
    setSent(true);
    await triggerDemoNotification(5, fallbackHabit ?? null, userId);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <AnimatedPress onPress={handlePress} haptic="medium">
      <Row
        gap={spacing.md}
        style={{
          paddingVertical: spacing.md,
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: radius.md,
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon icon={Notification03Icon} size={20} color={colors.primary} strokeWidth={1.8} />
        </View>
        <Stack gap={2} style={{ flex: 1 }}>
          <Typography
            style={{
              fontFamily: fonts.bodyBold,
              fontSize: 15,
              lineHeight: 20,
              color: colors.fg,
            }}
          >
            Send test notification
          </Typography>
          <Typography variant="metaItalic">
            {sent ? "Arriving in 5 seconds..." : "Fires a prove-it notification for your next habit"}
          </Typography>
        </Stack>
      </Row>
    </AnimatedPress>
  );
}

function formatJoinDate(createdAt?: string | null) {
  if (!createdAt) return "now";

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return "now";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

const profileStyles = StyleSheet.create({
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs + 2,
    height: 40,
    borderRadius: radius.sm,
  },
  actionBtnFilled: {
    backgroundColor: colors.fg,
  },
  actionBtnOutline: {
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
    lineHeight: 18,
  },
});
