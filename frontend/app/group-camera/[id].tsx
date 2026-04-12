import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, TextInput, View, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions, type CameraType, type FlashMode } from "expo-camera";
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
import { ShutterButton, useShutterFlash } from "@/components/shutter";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import { HABITS } from "@/lib/mock";
import { categoryMeta, formatTime } from "@/lib/habits";
import { useAuth } from "@/lib/auth-context";
import { fetchAIPrompt, submitGroupSnap, verifySnapPhoto } from "@/lib/snaps";

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
  const participantCount = Number(participantCountParam) || 2;
  const [prompt, setPrompt] = useState<string | null>(
    habit ? `Show yourselves doing ${habit.name.toLowerCase()} together.` : null,
  );
  const { user } = useAuth();

  useEffect(() => {
    if (!habit) return;
    fetchAIPrompt(habit.name, participantCount).then(setPrompt);
  }, [habit, participantCount]);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [retryHint, setRetryHint] = useState<string | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const { trigger: triggerFlash, Flash } = useShutterFlash();

  function isDemoPassEnabled() {
    const value = process.env.EXPO_PUBLIC_ENABLE_DEMO_PASS?.trim().toLowerCase();
    return value === "true" || value === "1" || value === "yes";
  }
  const demoPassEnabled = useMemo(() => isDemoPassEnabled(), []);

  const handleCapture = async () => {
    if (!cameraRef.current || !isCameraReady || submitting) return;

    try {
      setSubmitting(true);
      setError(null);
      setRetryMessage(null);
      setRetryHint(null);
      triggerFlash();

      const picture = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        shutterSound: false,
      });

      if (!picture?.uri) throw new Error("Camera did not return a photo.");

      setCapturedUri(picture.uri);
      setCaption(`Group prove for ${habit?.name ?? "habit"}.`);
    } catch (captureError) {
      setError(captureError instanceof Error ? captureError.message : "Failed to capture photo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePost = async (options?: { skipVerification?: boolean }) => {
    if (!id || !user?.id || !capturedUri || submitting) return;

    try {
      setSubmitting(true);
      setError(null);
      setRetryMessage(null);
      setRetryHint(null);

      if (!options?.skipVerification && prompt) {
        const verification = await verifySnapPhoto({
          localUri: capturedUri,
          promptText: prompt,
        });

        if (!verification.passed) {
          setRetryMessage(verification.message);
          setRetryHint(verification.retryHint);
          return;
        }
      }

      await submitGroupSnap({
        habitId: id,
        userId: user.id,
        localUri: capturedUri,
        caption,
        promptText: prompt ?? undefined,
      });

      router.replace("/");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to submit photo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    if (submitting) return;
    setCapturedUri(null);
    setCaption("");
    setError(null);
    setRetryMessage(null);
    setRetryHint(null);
  };

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
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
        onCameraReady={() => setIsCameraReady(true)}
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

        {capturedUri ? (
          <View style={StyleSheet.absoluteFill}>
            <Image source={{ uri: capturedUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.black + "33" }]} />
          </View>
        ) : null}

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
            opacity: capturedUri ? 0 : 1,
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

        {error ? (
          <View
            style={{
              marginHorizontal: spacing.lg,
              marginBottom: spacing.md,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: radius.md,
              backgroundColor: colors.bg + "f2",
            }}
          >
            <Typography color={colors.danger} style={{ textAlign: "center" }}>
              {error}
            </Typography>
          </View>
        ) : null}

        {retryMessage ? (
          <View
            style={{
              marginHorizontal: spacing.lg,
              marginBottom: spacing.md,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              borderRadius: radius.md,
              backgroundColor: colors.bg + "f2",
              gap: spacing.xs,
            }}
          >
            <Typography style={{ color: colors.fg, fontFamily: fonts.bodyBold, textAlign: "center" }}>
              {retryMessage}
            </Typography>
            {retryHint ? (
              <Typography color={colors.fgMuted} style={{ textAlign: "center" }}>
                {retryHint}
              </Typography>
            ) : null}
          </View>
        ) : null}

        {capturedUri ? (
          <View
            style={{
              marginHorizontal: spacing.lg,
              marginBottom: spacing.lg,
              padding: spacing.lg,
              borderRadius: radius.lg,
              backgroundColor: colors.bg + "f2",
              gap: spacing.md,
            }}
          >
            <Stack gap={spacing.xs}>
              <Typography variant="metaItalic" color={colors.primary}>
                Add a caption
              </Typography>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                placeholder={`Group prove for ${habit.name}.`}
                placeholderTextColor={colors.fgFaint}
                multiline
                editable={!submitting}
                style={{
                  minHeight: 76,
                  borderRadius: radius.md,
                  backgroundColor: colors.bgRaised,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.md,
                  color: colors.fg,
                  fontFamily: fonts.body,
                  fontSize: 15,
                  lineHeight: 22,
                  textAlignVertical: "top",
                }}
              />
            </Stack>
            <Row style={{ justifyContent: "space-between" }}>
              <AnimatedPress
                onPress={handleRetake}
                disabled={submitting}
                style={{
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md,
                  borderRadius: radius.pill,
                  backgroundColor: colors.bgRaised,
                }}
              >
                <Typography style={{ fontFamily: fonts.bodyBold, color: colors.fg }}>
                  Retake
                </Typography>
              </AnimatedPress>
              <Stack gap={spacing.sm} style={{ alignItems: "flex-end" }}>
                <AnimatedPress
                  onPress={() => handlePost()}
                  disabled={submitting}
                  style={{
                    minWidth: 138,
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.md,
                    borderRadius: radius.pill,
                    backgroundColor: colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {submitting ? (
                    <ActivityIndicator color={colors.onPrimary} />
                  ) : (
                    <Typography style={{ fontFamily: fonts.bodyBold, color: colors.onPrimary }}>
                      Verify & Post
                    </Typography>
                  )}
                </AnimatedPress>
                {demoPassEnabled ? (
                  <AnimatedPress
                    onPress={() => handlePost({ skipVerification: true })}
                    disabled={submitting}
                    style={{
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderRadius: radius.pill,
                      backgroundColor: colors.bgRaised,
                      borderWidth: 1,
                      borderColor: colors.primarySoft,
                    }}
                  >
                    <Typography style={{ fontFamily: fonts.bodyBold, color: colors.primary }}>
                      Use Demo Pass
                    </Typography>
                  </AnimatedPress>
                ) : null}
              </Stack>
            </Row>
          </View>
        ) : (
          <View style={{ paddingBottom: spacing.lg }}>
            <Row style={{ justifyContent: "space-around", alignItems: "center", paddingHorizontal: spacing.xl }}>
              <View style={{ width: 52 }} />
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <ShutterButton onCapture={handleCapture} disabled={submitting || !isCameraReady} />
                {submitting ? (
                  <View style={{ position: "absolute" }}>
                    <ActivityIndicator color={colors.primary} />
                  </View>
                ) : null}
              </View>
              <AnimatedPress
                onPress={() => setFacing(facing === "back" ? "front" : "back")}
                disabled={submitting}
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
        )}
      </SafeAreaView>
    </View>
  );
}
