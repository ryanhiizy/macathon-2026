import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Fire03Icon, Settings02Icon } from "@hugeicons/core-free-icons";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icon";
import { Card, Divider, Row, Screen, Stack } from "@/components/layout";
import { ProgressBar } from "@/components/ui-controls";
import { Typography } from "@/components/typography";
import { pickPhoto } from "@/lib/mock";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import { type AppProfile, ensureProfile, supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { getDemoUserById } from "@/lib/demo-users";

const POSTS = Array.from({ length: 9 }).map((_, i) => ({
  photoIdx: i,
  habit: ["Morning walk", "Hydrate", "Meditate", "Read", "Run"][i % 5],
}));

export default function Profile() {
  const { user, demoSession, signOut } = useAuth();
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const demoUser = user ? getDemoUserById(user.id) : undefined;

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      setError(null);

      if (demoSession) {
        if (isActive) {
          setProfile(null);
        }
        return;
      }

      if (!user) {
        if (isActive) {
          setError("No signed-in user found.");
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
    };

    loadProfile().catch((loadError: unknown) => {
      if (!isActive) return;
      setError(loadError instanceof Error ? loadError.message : "Failed to load profile.");
    });

    return () => {
      isActive = false;
    };
  }, [user, demoSession]);

  const displayName = profile?.display_name ?? demoUser?.name ?? "Presence User";
  const handle = profile?.handle ?? "presence";
  const bio = profile?.bio ?? "Your bio will show up here once profile editing lands.";
  const joinedLabel = formatJoinDate(profile?.created_at);
  const avatarLetter = displayName.slice(0, 1).toUpperCase() || "P";

  const stats = demoUser?.stats ?? { habits: 0, bestStreak: 0, friends: 0, circles: 0, weeklyConsistency: 0 };
  const statsList = [
    { label: "Habits", value: String(stats.habits) },
    { label: "Best streak", value: String(stats.bestStreak) },
    { label: "Friends", value: String(stats.friends) },
    { label: "Circles", value: String(stats.circles) },
  ];
  const consistencyPct = Math.round(stats.weeklyConsistency * 100);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  };

  const header = (
    <Row style={{ justifyContent: "flex-end" }}>
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
          <Typography variant="metaItalic">@{handle} · joined {joinedLabel}</Typography>
        </Stack>
        <Typography
          variant="lede"
          style={{ textAlign: "center", paddingHorizontal: spacing.lg }}
        >
          {bio}
        </Typography>
      </Stack>

      <Row style={{ justifyContent: "space-between", paddingVertical: spacing.md }}>
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

      <Divider />

      <Stack gap={spacing.sm}>
        <Row style={{ justifyContent: "space-between" }}>
          <Typography
            style={{
              fontFamily: fonts.heading,
              fontSize: 18,
              lineHeight: 22,
              color: colors.fg,
            }}
          >
            Weekly consistency
          </Typography>
          <Row gap={spacing.xs}>
            <Icon icon={Fire03Icon} size={16} color={colors.primary} />
            <Typography
              variant="caption"
              color={colors.primary}
              style={{ fontFamily: fonts.bodyBold }}
            >
              {consistencyPct}%
            </Typography>
          </Row>
        </Row>
        <ProgressBar color={colors.primary} progress={stats.weeklyConsistency} />
      </Stack>

      <Divider />

      <Stack gap={spacing.md}>
        <Typography
          style={{
            fontFamily: fonts.heading,
            fontSize: 18,
            lineHeight: 22,
            color: colors.fg,
          }}
        >
          Recent proofs
        </Typography>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {POSTS.map((post, i) => (
            <View key={i} style={{ width: "31.8%" }}>
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
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: 6,
                    backgroundColor: `${colors.black}70`,
                  }}
                >
                  <Typography
                    color={colors.bg}
                    style={{
                      fontFamily: fonts.heading,
                      fontSize: 10.5,
                      lineHeight: 13,
                    }}
                  >
                    {post.habit}
                  </Typography>
                </View>
              </View>
            </View>
          ))}
        </View>
      </Stack>

      {error ? (
        <Card style={{ borderColor: colors.danger }}>
          <Typography variant="bodyMuted" color={colors.danger}>
            {error}
          </Typography>
        </Card>
      ) : null}
    </Screen>
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
