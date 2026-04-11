import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Fire03Icon, Notification03Icon, Settings02Icon } from "@hugeicons/core-free-icons";
import { Avatar } from "@/components/avatar";
import { AnimatedPress } from "@/components/animated-press";
import { Icon } from "@/components/icon";
import { Card, Divider, Row, Screen, Stack } from "@/components/layout";
import { ProgressBar } from "@/components/ui-controls";
import { Typography } from "@/components/typography";
import { pickPhoto } from "@/lib/mock";
import { triggerDemoNotification } from "@/lib/notifications";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import { type AppProfile, ensureProfile, supabase } from "@/lib/supabase";
import { getDemoSession, signOutDemoUser, type DemoSession } from "@/lib/demo-auth";

const STATS = [
  { label: "Habits", value: "8" },
  { label: "Best streak", value: "47" },
  { label: "Friends", value: "124" },
  { label: "Circles", value: "6" },
];

const POSTS = Array.from({ length: 9 }).map((_, i) => ({
  photoIdx: i,
  habit: ["Morning walk", "Hydrate", "Meditate", "Read", "Run"][i % 5],
}));

export default function Profile() {
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [demoSession, setDemoSession] = useState<DemoSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      const storedDemoSession = await getDemoSession();

      if (storedDemoSession) {
        if (isActive) {
          setDemoSession(storedDemoSession);
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        if (isActive) {
          setError(userError.message);
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
  }, []);

  const displayName = demoSession?.displayName ?? profile?.display_name ?? "Presence User";
  const handle = demoSession?.handle ?? profile?.handle ?? "presence";
  const bio =
    demoSession?.bio ?? profile?.bio ?? "Your bio will show up here once profile editing lands.";
  const joinedLabel = formatJoinDate(demoSession?.createdAt ?? profile?.created_at);
  const avatarLetter = displayName.slice(0, 1).toUpperCase() || "P";

  const signOut = async () => {
    setSigningOut(true);

    if (demoSession) {
      await signOutDemoUser();
      setSigningOut(false);
      return;
    }

    const { error: signOutError } = await supabase.auth.signOut();
    setSigningOut(false);

    if (signOutError) {
      setError(signOutError.message);
    }
  };

  const header = (
    <Row style={{ justifyContent: "flex-end" }}>
      <Pressable
        disabled={signingOut}
        onPress={signOut}
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
        <Avatar color={colors.primary} letter={avatarLetter} size={104} ring={false} />
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
          <Typography variant="metaItalic">
            {loading
              ? "Loading your account..."
              : demoSession
                ? "Demo mode is on. This bypasses Supabase email auth."
                : "Signed in and ready for the rest of the app."}
          </Typography>
        </Stack>
        <Typography
          variant="lede"
          style={{ textAlign: "center", paddingHorizontal: spacing.lg }}
        >
          {bio}
        </Typography>
      </Stack>

      <Row style={{ justifyContent: "space-between", paddingVertical: spacing.md }}>
        {STATS.map((stat) => (
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
              72%
            </Typography>
          </Row>
        </Row>
        <ProgressBar color={colors.primary} progress={0.72} />
      </Stack>

      <Divider />

      <DemoNotificationButton />

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

function DemoNotificationButton() {
  const [sent, setSent] = useState(false);

  const handlePress = async () => {
    setSent(true);
    await triggerDemoNotification(5);
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
