import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { Settings02Icon, Fire03Icon } from "@hugeicons/core-free-icons";
import { Screen, Card, Row, Stack } from "@/components/layout";
import { Typography, Eyebrow } from "@/components/typography";
import { Icon } from "@/components/icon";
import { ProgressBar } from "@/components/ui-controls";
import { colors, radius, spacing, fonts } from "@/lib/theme";
import { type AppProfile, ensureProfile, supabase } from "@/lib/supabase";
import { getDemoSession, signOutDemoUser, type DemoSession } from "@/lib/demo-auth";

const STATS = [
  { label: "Habits", value: "8" },
  { label: "Best streak", value: "47" },
  { label: "Friends", value: "124" },
  { label: "Circles", value: "6" },
];

const GRID_ACCENTS = [
  colors.orange,
  colors.cyan,
  colors.green,
  colors.purple,
  colors.blue,
  colors.magenta,
  colors.yellow,
  colors.red,
  colors.orange,
];

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

  return (
    <Screen>
      <Row style={{ justifyContent: "space-between" }}>
        <View>
          <Eyebrow>Profile</Eyebrow>
          <Typography variant="caption">
            {loading
              ? "Loading your account..."
              : demoSession
                ? "Demo mode is on. This bypasses Supabase email auth."
                : "Signed in and ready for the rest of the app."}
          </Typography>
        </View>
        <Pressable
          disabled={signingOut}
          onPress={signOut}
          style={{
            minHeight: 44,
            borderRadius: radius.pill,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: spacing.md,
            flexDirection: "row",
            gap: spacing.xs,
          }}
        >
          <Icon icon={Settings02Icon} size={22} color={colors.fg} />
          <Typography variant="caption" style={{ fontFamily: fonts.bodySemibold, color: colors.fg }}>
            {signingOut ? "Signing out..." : "Sign out"}
          </Typography>
        </Pressable>
      </Row>

      <Stack gap={spacing.md} style={{ alignItems: "center" }}>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: radius.pill,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 3,
            borderColor: colors.card,
          }}
        >
          <Typography style={{ fontFamily: fonts.heading, fontSize: 40, color: colors.onPrimary }}>
            {avatarLetter}
          </Typography>
        </View>
        <View style={{ alignItems: "center" }}>
          <Typography style={{ fontFamily: fonts.heading, fontSize: 26, color: colors.fg }}>
            {displayName}
          </Typography>
          <Typography variant="caption">@{handle} · joined {joinedLabel}</Typography>
        </View>
      </Stack>

      <Card>
        <Row style={{ justifyContent: "space-between" }}>
          {STATS.map((stat, i) => (
            <View key={i} style={{ alignItems: "center", flex: 1 }}>
              <Typography style={{ fontFamily: fonts.heading, fontSize: 22, color: colors.fg }}>
                {stat.value}
              </Typography>
              <Typography variant="caption">{stat.label}</Typography>
            </View>
          ))}
        </Row>
      </Card>

      <Card>
        <Eyebrow>Bio</Eyebrow>
        <Typography variant="bodyMuted">{bio}</Typography>
      </Card>

      <Card>
        <Row style={{ justifyContent: "space-between" }}>
          <Eyebrow>Weekly consistency</Eyebrow>
          <Row gap={spacing.xs}>
            <Icon icon={Fire03Icon} size={16} color={colors.primary} />
            <Typography variant="caption" color={colors.primary} style={{ fontFamily: fonts.bodyBold }}>
              72%
            </Typography>
          </Row>
        </Row>
        <ProgressBar color={colors.primary} progress={0.72} />
      </Card>

      <Stack gap={spacing.sm}>
        <Eyebrow>Recent proofs</Eyebrow>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {GRID_ACCENTS.map((accent, i) => (
            <View
              key={i}
              style={{
                width: "31.5%",
                aspectRatio: 1,
                borderRadius: radius.md,
                backgroundColor: colors.ui,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: radius.pill,
                  backgroundColor: accent,
                }}
              />
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
