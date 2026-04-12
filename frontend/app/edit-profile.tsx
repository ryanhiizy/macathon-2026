import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Camera01Icon } from "@hugeicons/core-free-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { AnimatedPress } from "@/components/animated-press";
import { Icon } from "@/components/icon";
import { Row, Stack } from "@/components/layout";
import { Typography } from "@/components/typography";
import { updateDemoProfile } from "@/lib/demo-auth";
import { useAuth } from "@/lib/auth-context";
import { getDemoUserById } from "@/lib/demo-users";
import { type AppProfile, ensureProfile, supabase, updateProfile } from "@/lib/supabase";
import { colors, fonts, radius, spacing } from "@/lib/theme";

const FALLBACK_BIO =
  "Stacking small habits into something bigger. Currently chasing 100 days of morning walks.";

export default function EditProfile() {
  const { user, demoSession } = useAuth();
  const demoUser = user ? getDemoUserById(user.id) : undefined;
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hydrateForm = useCallback(
    (nextProfile?: AppProfile | null) => {
      setProfile(nextProfile ?? null);
      setName(nextProfile?.display_name ?? demoSession?.displayName ?? demoUser?.name ?? "Presence User");
      setUsername(nextProfile?.handle ?? demoSession?.handle ?? "presence");
      setBio(nextProfile?.bio ?? demoSession?.bio ?? FALLBACK_BIO);
    },
    [demoSession, demoUser],
  );

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (demoSession) {
      hydrateForm(null);
      setLoading(false);
      return;
    }

    if (!user) {
      setError("No signed-in user found.");
      setLoading(false);
      return;
    }

    try {
      await ensureProfile(user);

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("id, display_name, handle, avatar_url, bio, created_at")
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      hydrateForm(data);
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [demoSession, hydrateForm, user]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const handleSave = async () => {
    if (saving) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (demoSession) {
        await updateDemoProfile({
          displayName: name,
          handle: username.replace(/^@+/, ""),
          bio,
        });
      } else if (user) {
        const nextProfile = await updateProfile(user.id, {
          displayName: name,
          handle: username,
          bio,
        });
        setProfile(nextProfile);
      } else {
        throw new Error("No signed-in user found.");
      }

      router.back();
    } catch (saveError: unknown) {
      const message = saveError instanceof Error ? saveError.message : "Failed to save profile.";
      setError(message);
      Alert.alert("Couldn't save profile", message);
    } finally {
      setSaving(false);
    }
  };

  const avatarLetter = (name.trim().slice(0, 1) || "P").toUpperCase();
  const avatarUrl = profile?.avatar_url ?? null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top", "bottom"]}>
      <Row
        style={{
          alignItems: "center",
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: spacing.md,
        }}
      >
        <AnimatedPress onPress={() => router.back()} style={{ width: 60 }}>
          <Typography style={{ fontFamily: fonts.body, fontSize: 16, color: colors.fg }}>
            Cancel
          </Typography>
        </AnimatedPress>
        <Typography variant="label" style={{ flex: 1, textAlign: "center" }}>
          Edit profile
        </Typography>
        <AnimatedPress
          onPress={handleSave}
          haptic="medium"
          disabled={loading || saving}
          style={{ width: 60, alignItems: "flex-end" }}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Typography
              style={{ fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.primary }}
            >
              Done
            </Typography>
          )}
        </AnimatedPress>
      </Row>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.xxxl,
            gap: spacing.xl,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ alignItems: "center", paddingTop: spacing.lg, gap: spacing.md }}>
            <View>
              {demoUser?.avatar ? (
                <Image
                  source={demoUser.avatar}
                  style={{ width: 96, height: 96, borderRadius: radius.pill }}
                  contentFit="cover"
                />
              ) : avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={{ width: 96, height: 96, borderRadius: radius.pill }}
                  contentFit="cover"
                />
              ) : (
                <Avatar color={colors.primary} letter={avatarLetter} size={96} ring={false} />
              )}
              <View style={s.cameraBadge}>
                <Icon icon={Camera01Icon} size={14} color={colors.onPrimary} />
              </View>
            </View>
            <AnimatedPress haptic="light">
              <Typography
                style={{ fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.primary }}
              >
                Change photo
              </Typography>
            </AnimatedPress>
          </View>

          <Stack gap={spacing.xl}>
            <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />
            <Field
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="username"
              prefix="@"
              autoCapitalize="none"
            />
            <Field
              label="Bio"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell people about yourself"
              multiline
              maxLength={150}
            />
          </Stack>

          {error ? <Typography style={s.errorText}>{error}</Typography> : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  maxLength,
  prefix,
  autoCapitalize,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
  maxLength?: number;
  prefix?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "url" | "email-address";
}) {
  return (
    <View style={s.fieldRow}>
      <Typography variant="label" style={{ width: 90 }}>
        {label}
      </Typography>
      <View style={s.fieldInputWrap}>
        {prefix ? (
          <Typography style={{ fontFamily: fonts.body, fontSize: 15, color: colors.fgDim }}>
            {prefix}
          </Typography>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.fgDim}
          multiline={multiline}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          style={[s.fieldInput, multiline ? { minHeight: 60, textAlignVertical: "top" } : null]}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.fg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.bg,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.danger,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
  },
  fieldInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 2,
  },
  fieldInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.fg,
    padding: 0,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
