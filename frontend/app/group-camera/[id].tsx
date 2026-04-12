import { useMemo, useState } from "react";
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
import { categoryMeta, formatTime } from "@/lib/habits";

const GROUP_PROMPTS: Record<string, string> = {
  "1": "All three of you — throw a peace sign in sync.",
  "2": "Cheers! Clink your bottles together.",
  "3": "Close your eyes, show your zen faces.",
  "4": "Line your books up and show the spines.",
};

export default function GroupCameraScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
    name?: string | string[];
    targetTime?: string | string[];
    category?: string | string[];
    participantCount?: string | string[];
  }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const habitNameParam = Array.isArray(params.name) ? params.name[0] : params.name;
  const targetTimeParam = Array.isArray(params.targetTime) ? params.targetTime[0] : params.targetTime;
  const categoryParam = Array.isArray(params.category) ? params.category[0] : params.category;
  const participantCountParam = Array.isArray(params.participantCount)
    ? params.participantCount[0]
    : params.participantCount;
  const fallbackHabit = HABITS.find((h) => h.id === id);
  const habit = useMemo(() => {
    if (!id) return null;

    if (habitNameParam) {
      const meta = categoryMeta(categoryParam ?? "morning");
      return {
        id,
        name: habitNameParam,
        accent: meta.accent,
        time: targetTimeParam ? formatTime(targetTimeParam) : "Today",
      };
    }

    if (!fallbackHabit) return null;

    return {
      id: fallbackHabit.id,
      name: fallbackHabit.name,
      accent: fallbackHabit.accent,
      time: fallbackHabit.time,
    };
  }, [categoryParam, fallbackHabit, habitNameParam, id, targetTimeParam]);
  const prompt = habit ? (GROUP_PROMPTS[habit.id] ?? "Get together — make the photo count.") : null;
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const { trigger: triggerFlash, Flash } = useShutterFlash();

  if (!habit) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.black }} edges={["top", "bottom"]}>
        <Stack gap={spacing.xl} style={{ flex: 1, padding: spacing.xl, justifyContent: "center", alignItems: "center" }}>
          <Typography serif color={colors.bg} style={{ fontSize: 22, textAlign: "center" }}>
            Habit not found
          </Typography>
          <AnimatedPress onPress={() => router.back()} haptic={false}>
            <Typography color={colors.bg} variant="metaItalic">
              Back
            </Typography>
          </AnimatedPress>
        </Stack>
      </SafeAreaView>
    );
  }

  if (!permission) return <View style={{ flex: 1, backgroundColor: colors.black }} />;
  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.black }} edges={["top", "bottom"]}>
        <Stack gap={spacing.xl} style={{ flex: 1, padding: spacing.xl, justifyContent: "center", alignItems: "center" }}>
          <Typography serif color={colors.bg} style={{ fontSize: 22, textAlign: "center" }}>
            Camera access needed to prove together
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
          style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}
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
              <Row gap={spacing.xs}>
                <View
                  style={{
                    paddingHorizontal: spacing.sm,
                    paddingVertical: 2,
                    borderRadius: radius.pill,
                    backgroundColor: colors.primary,
                  }}
                >
                  <Typography
                    color={colors.bg}
                    style={{ fontFamily: fonts.bodyBold, fontSize: 10, lineHeight: 13 }}
                  >
                    Group
                  </Typography>
                </View>
                <Typography
                  color={colors.bg}
                  style={{ fontFamily: fonts.heading, fontSize: 17, lineHeight: 22 }}
                >
                  {habit.name}
                </Typography>
              </Row>
              <Row gap={spacing.xs}>
                <Icon icon={Clock01Icon} size={11} color={colors.bg} />
                <Typography
                  variant="metaItalic"
                  color={colors.bg}
                  style={{ opacity: 0.85 }}
                >
                  {habit.time}
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
                A prompt for all of you
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
