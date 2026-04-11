import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { Card, Screen, Stack } from "@/components/layout";
import { Eyebrow, Typography } from "@/components/typography";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import { clearPendingSignupDraft, createSessionFromUrl, ensureProfile, loadPendingSignupDraft, supabase } from "@/lib/supabase";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const url = Linking.useURL();
  const [error, setError] = useState<string | null>(null);
  const [backRoute, setBackRoute] = useState<"/auth" | "/auth/signup">("/auth");

  useEffect(() => {
    let isActive = true;

    const completeAuth = async () => {
      try {
        const incomingUrl = url ?? (await Linking.getInitialURL());

        if (!incomingUrl) {
          throw new Error("Missing auth callback URL. Re-open the magic link from your inbox.");
        }

        // Try session from URL tokens first
        let session = await createSessionFromUrl(incomingUrl);

        // If no tokens in the URL, check if Supabase already picked up the session
        // (e.g. via onAuthStateChange from the hash fragment)
        if (!session) {
          const { data } = await supabase.auth.getSession();
          session = data.session;
        }

        if (!session?.user) {
          throw new Error(
            "No valid session from the magic link. The link may have expired — request a new one.",
          );
        }

        const pendingSignupDraft = await loadPendingSignupDraft();
        const matchingDraft =
          pendingSignupDraft?.email === session.user.email?.trim().toLowerCase()
            ? pendingSignupDraft
            : null;

        if (matchingDraft) {
          setBackRoute("/auth/signup");
        }

        await ensureProfile(session.user, matchingDraft);
        await clearPendingSignupDraft();

        if (isActive) {
          router.replace("/");
        }
      } catch (callbackError) {
        if (!isActive) return;

        const message =
          callbackError instanceof Error
            ? callbackError.message
            : typeof callbackError === "string"
              ? callbackError
              : "Failed to finish sign-in.";
        console.warn("[auth/callback] error:", callbackError);
        setError(message);
      }
    };

    completeAuth().catch(() => {});

    return () => {
      isActive = false;
    };
  }, [router, url]);

  return (
    <Screen contentStyle={{ flexGrow: 1, justifyContent: "center" }}>
      <Card>
        <Stack gap={spacing.md}>
          <View>
            <Eyebrow>Auth callback</Eyebrow>
            <Typography variant="h2" style={{ marginTop: spacing.sm }}>
              {error ? "We couldn't finish sign-in" : "Finishing your sign-in"}
            </Typography>
          </View>

          <Typography variant="bodyMuted">
            {error
              ? error
              : "We're turning the magic link into a session and creating your app profile."}
          </Typography>

          {error ? (
            <Pressable
              onPress={() => router.replace(backRoute)}
              style={{
                minHeight: 50,
                borderRadius: radius.md,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: spacing.lg,
              }}
            >
              <Typography color={colors.onPrimary} style={{ fontFamily: fonts.bodyBold }}>
                Back to login
              </Typography>
            </Pressable>
          ) : null}
        </Stack>
      </Card>
    </Screen>
  );
}
