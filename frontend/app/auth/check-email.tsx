import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Card, Screen, Stack } from "@/components/layout";
import { Eyebrow, Typography } from "@/components/typography";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import { clearPendingSignupDraft, formatAuthEmailError, loadPendingSignupDraft, supabase } from "@/lib/supabase";

type AuthMode = "login" | "signup";

export default function CheckEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string | string[]; mode?: string | string[] }>();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const email = useMemo(() => {
    const raw = Array.isArray(params.email) ? params.email[0] : params.email;
    return raw?.trim().toLowerCase() ?? "";
  }, [params.email]);

  const mode: AuthMode = useMemo(() => {
    const raw = Array.isArray(params.mode) ? params.mode[0] : params.mode;
    return raw === "login" ? "login" : "signup";
  }, [params.mode]);

  const resendLink = async () => {
    if (!email) {
      setError("Missing email address. Go back and try again.");
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);

    if (mode === "login") {
      await clearPendingSignupDraft();
    } else {
      const draft = await loadPendingSignupDraft();

      if (!draft || draft.email !== email) {
        setLoading(false);
        setError("Your signup details expired. Go back and create the account again.");
        return;
      }
    }

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: Linking.createURL("/auth/callback"),
      },
    });

    setLoading(false);

    if (authError) {
      setError(formatAuthEmailError(authError));
      return;
    }

    setNotice(`Sent another magic link to ${email}.`);
  };

  return (
    <Screen contentStyle={{ flexGrow: 1, justifyContent: "center" }}>
      <Card>
        <Stack gap={spacing.lg}>
          <View>
            <Eyebrow>{mode === "signup" ? "Create account" : "Log in"}</Eyebrow>
            <Typography variant="h2" style={{ marginTop: spacing.sm }}>
              Check your email
            </Typography>
          </View>

          <Typography variant="bodyMuted">
            We sent a magic link to {email || "your email"}. Open that link on this phone and we’ll
            drop you straight back into the app.
          </Typography>

          <Typography variant="bodyMuted">
            If nothing shows up, check spam and then wait a few seconds before sending another link.
          </Typography>

          {notice ? <Notice tone="info">{notice}</Notice> : null}
          {error ? <Notice tone="danger">{error}</Notice> : null}

          <Pressable
            onPress={resendLink}
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
              {loading ? "Sending..." : "Resend magic link"}
            </Typography>
          </Pressable>

          <Pressable
            onPress={() => router.replace(mode === "signup" ? "/auth/signup" : "/auth/login")}
            style={{
              minHeight: 50,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.borderStrong,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: spacing.lg,
            }}
          >
            <Typography variant="label">
              {mode === "signup" ? "Back to signup" : "Back to login"}
            </Typography>
          </Pressable>
        </Stack>
      </Card>
    </Screen>
  );
}

function Notice({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "info" | "danger";
}) {
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
