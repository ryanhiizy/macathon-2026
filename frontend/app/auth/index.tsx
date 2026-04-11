import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Screen, Stack } from "@/components/layout";
import { Typography } from "@/components/typography";
import { Avatar } from "@/components/avatar";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import { supabase } from "@/lib/supabase";
import { DEMO_USERS, type DemoUser } from "@/lib/demo-users";

export default function DemoPickerScreen() {
  const [signingIn, setSigningIn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickUser = async (user: DemoUser) => {
    setSigningIn(user.id);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    });

    if (authError) {
      setError(authError.message);
      setSigningIn(null);
      return;
    }

    // AuthProvider picks up the session via onAuthStateChange and redirects
  };

  return (
    <Screen contentStyle={{ flexGrow: 1, justifyContent: "center" }}>
      <Stack gap={spacing.xxl} style={{ alignItems: "center" }}>
        <Stack gap={spacing.sm} style={{ alignItems: "center" }}>
          <Typography
            style={{
              fontFamily: fonts.heading,
              fontSize: 34,
              lineHeight: 40,
              color: colors.fg,
              textAlign: "center",
            }}
          >
            presence
          </Typography>
          <Typography variant="bodyMuted" style={{ textAlign: "center" }}>
            Who&apos;s demoing today?
          </Typography>
        </Stack>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: spacing.xl,
          }}
        >
          {DEMO_USERS.map((user) => {
            const isLoading = signingIn === user.id;
            const isDisabled = signingIn !== null;

            return (
              <Pressable
                key={user.id}
                onPress={() => pickUser(user)}
                disabled={isDisabled}
                style={{
                  alignItems: "center",
                  gap: spacing.sm,
                  opacity: isDisabled && !isLoading ? 0.4 : 1,
                  width: 100,
                }}
              >
                {isLoading ? (
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: radius.pill,
                      backgroundColor: user.color,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ActivityIndicator color={colors.onPrimary} />
                  </View>
                ) : user.avatar ? (
                  <Image
                    source={user.avatar}
                    style={{ width: 80, height: 80, borderRadius: radius.pill }}
                    contentFit="cover"
                  />
                ) : (
                  <Avatar
                    color={user.color}
                    letter={user.name[0]}
                    size={80}
                    ring={false}
                  />
                )}
                <Typography
                  style={{
                    fontFamily: fonts.bodySemibold,
                    fontSize: 16,
                    color: colors.fg,
                    textAlign: "center",
                  }}
                >
                  {user.name}
                </Typography>
              </Pressable>
            );
          })}
        </View>

        {error ? (
          <Typography
            variant="bodyMuted"
            color={colors.danger}
            style={{ textAlign: "center", paddingHorizontal: spacing.lg }}
          >
            {error}
          </Typography>
        ) : null}
      </Stack>
    </Screen>
  );
}
