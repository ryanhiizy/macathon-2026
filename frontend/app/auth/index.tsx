import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Card, Screen, Stack } from "@/components/layout";
import { Eyebrow, Typography } from "@/components/typography";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import { signInDemoUser } from "@/lib/demo-auth";

export default function AuthLandingScreen() {
  const router = useRouter();
  const continueAsDemo = async () => {
    await signInDemoUser();
    router.replace("/");
  };

  return (
    <Screen contentStyle={{ flexGrow: 1, justifyContent: "center" }}>
      <Stack gap={spacing.xl}>
        <View>
          <Eyebrow>presence</Eyebrow>
          <Typography variant="display" style={{ marginTop: spacing.sm }}>
            Build habits with receipts.
          </Typography>
          <Typography variant="bodyMuted" style={{ marginTop: spacing.md }}>
            Start with a lightweight account, then prove your habits live.
          </Typography>
        </View>

        <Card style={{ gap: spacing.md }}>
          <AuthButton
            label="Create account"
            onPress={() => router.push("/auth/signup")}
            solid
          />
          <AuthButton label="Log in" onPress={() => router.push("/auth/login")} />
          <AuthButton label="Continue as demo user" onPress={continueAsDemo} />
        </Card>
      </Stack>
    </Screen>
  );
}

function AuthButton({
  label,
  onPress,
  solid = false,
}: {
  label: string;
  onPress: () => void;
  solid?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        minHeight: 54,
        borderRadius: radius.md,
        borderWidth: solid ? 0 : 1,
        borderColor: colors.borderStrong,
        backgroundColor: solid ? colors.primary : colors.bgRaised,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: spacing.lg,
      }}
    >
      <Typography
        color={solid ? colors.onPrimary : colors.fg}
        style={{ fontFamily: solid ? fonts.bodyBold : fonts.bodySemibold }}
      >
        {label}
      </Typography>
    </Pressable>
  );
}
