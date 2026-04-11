import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
import { Pressable, TextInput, View } from "react-native";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { Card, Row, Screen, Stack } from "@/components/layout";
import { Eyebrow, Typography } from "@/components/typography";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import {
  clearPendingSignupDraft,
  formatAuthEmailError,
  isValidBirthDate,
  loadPendingSignupDraft,
  normalizeUsername,
  savePendingSignupDraft,
  supabase,
} from "@/lib/supabase";

const GENDER_OPTIONS = ["Woman", "Man", "Non-binary", "Prefer not to say"];

export default function SignupScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    loadPendingSignupDraft()
      .then((draft) => {
        if (!isActive || !draft) return;

        setDisplayName(draft.displayName);
        setUsername(draft.username);
        setEmail(draft.email);
        setBirthDate(draft.birthDate);
        setGender(draft.gender);
      })
      .catch(() => {});

    return () => {
      isActive = false;
    };
  }, []);

  const sendSignupLink = async () => {
    const normalizedDisplayName = displayName.trim();
    const normalizedUsername = normalizeUsername(username);
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedBirthDate = birthDate.trim();

    if (!normalizedDisplayName || !normalizedUsername || !normalizedEmail || !normalizedBirthDate) {
      setError("Fill name, username, email, and birth date first.");
      return;
    }

    if (!isValidBirthDate(normalizedBirthDate)) {
      setError("Use a real birth date in YYYY-MM-DD format.");
      return;
    }

    setLoading(true);
    setError(null);

    await savePendingSignupDraft({
      displayName: normalizedDisplayName,
      username: normalizedUsername,
      email: normalizedEmail,
      birthDate: normalizedBirthDate,
      gender,
    });

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: Linking.createURL("/auth/callback"),
      },
    });

    setLoading(false);

    if (authError) {
      await clearPendingSignupDraft();
      setError(formatAuthEmailError(authError));
      return;
    }

    router.replace({
      pathname: "/auth/check-email",
      params: {
        email: normalizedEmail,
        mode: "signup",
      },
    });
  };

  return (
    <Screen contentStyle={{ flexGrow: 1, justifyContent: "center" }}>
      <Stack gap={spacing.xl}>
        <View>
          <Eyebrow>Create account</Eyebrow>
          <Typography variant="h1" style={{ marginTop: spacing.sm }}>
            Set up your profile
          </Typography>
          <Typography variant="bodyMuted" style={{ marginTop: spacing.md }}>
            Keep it quick. We’ll send one magic link after you fill the basics.
          </Typography>
        </View>

        <Card style={{ gap: spacing.lg }}>
          <Field label="Display name">
            <AuthInput
              onChangeText={setDisplayName}
              placeholder="Jack Nguyen"
              value={displayName}
            />
          </Field>

          <Field label="Username">
            <AuthInput
              autoCapitalize="none"
              onChangeText={(value) => setUsername(normalizeUsername(value))}
              placeholder="jackng96"
              value={username}
            />
          </Field>

          <Field label="Email">
            <AuthInput
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@presence.club"
              value={email}
            />
          </Field>

          <Field label="Birth date">
            <AuthInput
              autoCapitalize="none"
              keyboardType="numbers-and-punctuation"
              onChangeText={setBirthDate}
              placeholder="YYYY-MM-DD"
              value={birthDate}
            />
          </Field>

          <Field label="Gender">
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {GENDER_OPTIONS.map((option) => {
                const active = gender === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setGender(active ? null : option)}
                    style={{
                      borderRadius: radius.pill,
                      borderWidth: 1,
                      borderColor: active ? colors.primarySoft : colors.borderStrong,
                      backgroundColor: active ? colors.bgRaised : colors.card,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color={active ? colors.primary : colors.fgMuted}
                      style={{ fontFamily: active ? fonts.bodySemibold : fonts.body }}
                    >
                      {option}
                    </Typography>
                  </Pressable>
                );
              })}
            </View>
          </Field>

          <AuthButton label={loading ? "Sending..." : "Create account"} onPress={sendSignupLink} />

          {error ? <Notice tone="danger">{error}</Notice> : null}

          <Row style={{ justifyContent: "space-between" }}>
            <Pressable onPress={() => router.replace("/auth")}>
              <Typography variant="caption">Back</Typography>
            </Pressable>
            <Pressable onPress={() => router.replace("/auth/login")}>
              <Typography variant="caption">Already have an account?</Typography>
            </Pressable>
          </Row>
        </Card>
      </Stack>
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack gap={spacing.sm}>
      <Typography variant="label">{label}</Typography>
      {children}
    </Stack>
  );
}

function AuthInput(props: ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor={colors.fgDim}
      style={{
        minHeight: 54,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.borderStrong,
        backgroundColor: colors.bgRaised,
        color: colors.fg,
        paddingHorizontal: spacing.lg,
        fontFamily: fonts.body,
        fontSize: 16,
      }}
      {...props}
    />
  );
}

function AuthButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        minHeight: 54,
        borderRadius: radius.md,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: spacing.lg,
      }}
    >
      <Typography color={colors.onPrimary} style={{ fontFamily: fonts.bodyBold }}>
        {label}
      </Typography>
    </Pressable>
  );
}

function Notice({ children, tone }: { children: ReactNode; tone: "info" | "danger" }) {
  return (
    <View
      style={{
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: tone === "danger" ? colors.danger : colors.primarySoft,
        backgroundColor: colors.bgRaised,
        padding: spacing.md,
      }}
    >
      <Typography variant="bodyMuted" color={tone === "danger" ? colors.danger : colors.fgMuted}>
        {children}
      </Typography>
    </View>
  );
}
