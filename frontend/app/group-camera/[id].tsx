import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions, type CameraType, type FlashMode } from "expo-camera";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import {
  Cancel01Icon,
  CameraRotated01Icon,
  FlashIcon,
  FlashOffIcon,
  Tick02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { Row, Stack } from "@/components/layout";
import { Typography } from "@/components/typography";
import { Icon } from "@/components/icon";
import { AnimatedPress } from "@/components/animated-press";
import { Avatar } from "@/components/avatar";
import { ShutterButton, useShutterFlash } from "@/components/shutter";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import { HABITS } from "@/lib/mock";

function ReadyDot() {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.55 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 1.2 }],
  }));

  return (
    <View
      style={{
        position: "absolute",
        bottom: -2,
        right: -2,
        width: 18,
        height: 18,
      }}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 9,
            backgroundColor: colors.success,
          },
          ringStyle,
        ]}
      />
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: colors.success,
          borderWidth: 2,
          borderColor: colors.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon icon={Tick02Icon} size={10} color={colors.bg} strokeWidth={3} />
      </View>
    </View>
  );
}

const GROUP_PROMPTS: Record<string, string> = {
  "1": "Everyone in frame — hit us with your best smile!",
  "2": "Squad check! Show us what you're sipping.",
  "3": "Group selfie — show us those zen vibes.",
  "4": "Crew shot — what are y'all working on?",
};

const PARTICIPANTS = [
  { letter: "B", color: colors.purple, name: "You", ready: true },
  { letter: "M", color: colors.green, name: "Mia", ready: true },
  { letter: "J", color: colors.cyan, name: "Jae", ready: false },
];

export default function GroupCameraScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habit = HABITS.find((h) => h.id === id);
  const prompt = habit ? (GROUP_PROMPTS[habit.id] ?? "Get together — make the photo count.") : null;
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const { trigger: triggerFlash, Flash } = useShutterFlash();

  const allReady = PARTICIPANTS.every((p) => p.ready);

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
            <Stack gap={2} style={{ alignItems: "center" }}>
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
          <Stack gap={4}>
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
        </View>

        <View style={{ flex: 1 }} />

        <View
          style={{
            marginHorizontal: spacing.lg,
            marginBottom: spacing.md,
            padding: spacing.md,
            borderRadius: radius.lg,
            backgroundColor: colors.bg + "f2",
          }}
        >
          <Row gap={spacing.sm} style={{ justifyContent: "space-between" }}>
            <Typography variant="metaItalic" color={colors.fgMuted}>
              {allReady ? "Everyone is ready" : "Waiting for everyone"}
            </Typography>
            <Typography
              color={colors.fgMuted}
              style={{ fontFamily: fonts.bodyBold, fontSize: 12 }}
            >
              {PARTICIPANTS.filter((p) => p.ready).length}/{PARTICIPANTS.length}
            </Typography>
          </Row>
          <Row gap={spacing.md} style={{ marginTop: spacing.md }}>
            {PARTICIPANTS.map((p, i) => (
              <Stack key={i} gap={spacing.xs} style={{ alignItems: "center", flex: 1 }}>
                <View style={{ position: "relative" }}>
                  <Avatar color={p.color} letter={p.letter} size={44} ring={false} />
                  {p.ready ? (
                    <ReadyDot />
                  ) : (
                    <View
                      style={{
                        position: "absolute",
                        bottom: -2,
                        right: -2,
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        backgroundColor: colors.bgRaised,
                        borderWidth: 2,
                        borderColor: colors.bg,
                      }}
                    />
                  )}
                </View>
                <Typography
                  style={{
                    fontFamily: fonts.bodyMedium,
                    fontSize: 11,
                    color: p.ready ? colors.fg : colors.fgFaint,
                  }}
                >
                  {p.name}
                </Typography>
              </Stack>
            ))}
          </Row>
        </View>

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
