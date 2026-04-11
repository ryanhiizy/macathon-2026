import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions, type CameraType, type FlashMode } from "expo-camera";
import {
  Cancel01Icon,
  CameraRotated01Icon,
  FlashIcon,
  FlashOffIcon,
  SparklesIcon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { Row, Stack } from "@/components/layout";
import { Typography } from "@/components/typography";
import { Icon } from "@/components/icon";
import { AnimatedPress } from "@/components/animated-press";
import { ShutterButton, useShutterFlash } from "@/components/shutter";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import { HABITS } from "@/lib/mock";

const PROMPT_BY_HABIT: Record<string, string> = {
  "1": "Throw a peace sign mid-stride on your morning walk.",
  "2": "Show your water bottle — how full is it right now?",
  "3": "Show your peaceful meditation corner.",
  "4": "Hold up the book — reveal the cover.",
};

export default function CameraScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habit = HABITS.find((h) => h.id === id) ?? HABITS[0];
  const prompt = PROMPT_BY_HABIT[habit.id] ?? "Show us something honest.";
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const { trigger: triggerFlash, Flash } = useShutterFlash();

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: colors.black }} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.black }} edges={["top", "bottom"]}>
        <Stack gap={spacing.xl} style={{ flex: 1, padding: spacing.xl, justifyContent: "center", alignItems: "center" }}>
          <Typography
            serif
            color={colors.bg}
            style={{ fontSize: 24, lineHeight: 32, textAlign: "center" }}
          >
            Camera access needed to prove your habit
          </Typography>
          <AnimatedPress
            onPress={requestPermission}
            style={{
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.md,
              borderRadius: radius.pill,
              backgroundColor: colors.bg,
            }}
          >
            <Typography color={colors.fg} style={{ fontFamily: fonts.bodyBold }}>
              Allow
            </Typography>
          </AnimatedPress>
          <AnimatedPress onPress={() => router.back()} haptic={false}>
            <Typography color={colors.bg} variant="metaItalic">
              Back
            </Typography>
          </AnimatedPress>
        </Stack>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.black }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
      />
      <Flash />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.sm,
          }}
        >
          <Row style={{ justifyContent: "space-between" }}>
            <AnimatedPress
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: radius.pill,
                backgroundColor: colors.black + "80",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon icon={Cancel01Icon} size={20} color={colors.bg} />
            </AnimatedPress>
            <Stack
              gap={2}
              style={{
                alignItems: "center",
                backgroundColor: colors.black + "80",
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.xs,
                borderRadius: radius.pill,
              }}
            >
              <Typography
                color={colors.bg}
                style={{ fontFamily: fonts.heading, fontSize: 17, lineHeight: 22 }}
              >
                {habit.name}
              </Typography>
              <Row gap={spacing.xs}>
                <Icon icon={Clock01Icon} size={11} color={colors.bg} />
                <Typography
                  variant="metaItalic"
                  color={colors.bg}
                >
                  Ends in 42 min
                </Typography>
              </Row>
            </Stack>
            <AnimatedPress
              onPress={() => setFlash(flash === "off" ? "on" : "off")}
              style={{
                width: 40,
                height: 40,
                borderRadius: radius.pill,
                backgroundColor: colors.black + "80",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                icon={flash === "off" ? FlashOffIcon : FlashIcon}
                size={20}
                color={flash === "off" ? colors.bg : colors.yellow}
              />
            </AnimatedPress>
          </Row>
        </View>

        <View
          style={{
            marginTop: spacing.lg,
            marginHorizontal: spacing.lg,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderRadius: radius.lg,
            backgroundColor: colors.bg + "f2",
            borderWidth: 1,
            borderColor: colors.primarySoft,
          }}
        >
          <Row gap={spacing.sm} style={{ alignItems: "flex-start" }}>
            <View style={{ paddingTop: 2 }}>
              <Icon icon={SparklesIcon} size={16} color={colors.primary} strokeWidth={2} />
            </View>
            <Stack gap={4} style={{ flex: 1 }}>
              <Typography variant="metaItalic" color={colors.primary}>
                Today&apos;s prompt
              </Typography>
              <Typography
                style={{
                  fontFamily: fonts.heading,
                  fontSize: 17,
                  lineHeight: 24,
                  color: colors.fg,
                }}
              >
                {prompt}
              </Typography>
            </Stack>
          </Row>
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ paddingBottom: spacing.lg }}>
          <Row style={{ justifyContent: "space-around", alignItems: "center", paddingHorizontal: spacing.xl }}>
            <View style={{ width: 52 }} />
            <ShutterButton onCapture={triggerFlash} />
            <AnimatedPress
              onPress={() => setFacing(facing === "back" ? "front" : "back")}
              style={{
                width: 52,
                height: 52,
                borderRadius: radius.pill,
                backgroundColor: colors.black + "80",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon icon={CameraRotated01Icon} size={22} color={colors.bg} />
            </AnimatedPress>
          </Row>
        </View>
      </SafeAreaView>
    </View>
  );
}
