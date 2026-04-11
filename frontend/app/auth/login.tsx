import { useState, type ComponentProps, type ReactNode } from "react";
import { Pressable, TextInput, View } from "react-native";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { Card, Screen, Stack } from "@/components/layout";
import { Eyebrow, Typography } from "@/components/typography";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import { clearPendingSignupDraft, formatAuthEmailError, supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMagicLink = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Enter your email first.");
      return;
    }

    setLoading(true);
    setError(null);

    await clearPendingSignupDraft();

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: Linking.createURL("/auth/callback"),
      },
    });

    setLoading(false);

    if (authError) {
      setError(formatAuthEmailError(authError));
      return;
    }

    router.replace({
      pathname: "/auth/check-email",
      params: {
        email: normalizedEmail,
        mode: "login",
      },
    });
  };

  return (
    <Screen contentStyle={{ flexGrow: 1, justifyContent: "center" }}>
      <Stack gap={spacing.xl}>
        <View>
          <Eyebrow>Log in</Eyebrow>
          <Typography variant="h1" style={{ marginTop: spacing.sm }}>
            Welcome back
          </Typography>
          <Typography variant="bodyMuted" style={{ marginTop: spacing.md }}>
            We’ll send one magic link to your email and bring you straight back in.
          </Typography>
        </View>

        <Card style={{ gap: spacing.lg }}>
          <Stack gap={spacing.sm}>
            <Typography variant="label">Email</Typography>
            <AuthInput
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@presence.club"
              value={email}
            />
          </Stack>

          <AuthButton label={loading ? "Sending..." : "Send magic link"} onPress={sendMagicLink} />

          {error ? <Notice tone="danger">{error}</Notice> : null}

          <Pressable onPress={() => router.replace("/auth")}>
            <Typography variant="caption" style={{ textAlign: "center" }}>
              Back
            </Typography>
          </Pressable>
        </Card>
      </Stack>
    </Screen>
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
