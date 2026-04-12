import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CameraView,
  useCameraPermissions,
  type CameraType,
  type FlashMode,
} from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import {
  AlertCircleIcon,
  CameraRotated01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  FlashIcon,
  FlashOffIcon,
} from "@hugeicons/core-free-icons";
import { AnimatedPress } from "@/components/animated-press";
import { Icon } from "@/components/icon";
import { Row, Stack } from "@/components/layout";
import { ShutterButton, useShutterFlash } from "@/components/shutter";
import { Typography } from "@/components/typography";
import { useAuth } from "@/lib/auth-context";
import { fetchAIPrompt, getHabitCaptureMeta, submitSoloSnap, verifySnapPhoto } from "@/lib/snaps";
import { colors, fonts, radius, spacing } from "@/lib/theme";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const shimmerWidth = screenWidth * 1.5;

type CapturePhase = "camera" | "verifying" | "failed" | "caption";

function isDemoPassEnabled() {
  const value = process.env.EXPO_PUBLIC_ENABLE_DEMO_PASS?.trim().toLowerCase();
  return value === "true" || value === "1" || value === "yes";
}

function useKeyboardVisible() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const show = Keyboard.addListener(showEvent, () => setVisible(true));
    const hide = Keyboard.addListener(hideEvent, () => setVisible(false));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return visible;
}

function ScanOverlay() {
  const translateX = useSharedValue(-shimmerWidth);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(screenWidth, {
        duration: 1600,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
    );
  }, [translateX]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(300)}
      style={[StyleSheet.absoluteFill, styles.scanOverlay]}
      pointerEvents="none"
    >
      <View style={[StyleSheet.absoluteFill, styles.scanOverlayTint]} />

      <Animated.View style={[styles.scanShimmer, shimmerStyle]}>
        <LinearGradient
          colors={[
            "transparent",
            "rgba(255,255,255,0.04)",
            "rgba(255,255,255,0.10)",
            "rgba(255,255,255,0.04)",
            "transparent",
          ]}
          locations={[0, 0.3, 0.5, 0.7, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </Animated.View>

      <View style={styles.scanCopy}>
        <View style={styles.scanSpinner}>
          <ActivityIndicator color={colors.white + "99"} size="small" />
        </View>
        <Typography style={styles.scanTitle}>Verifying your snap</Typography>
        <Typography variant="meta" color={colors.white + "66"} style={styles.centeredText}>
          Checking the prompt against your photo...
        </Typography>
      </View>
    </Animated.View>
  );
}

export default function CameraScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const keyboardVisible = useKeyboardVisible();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [habitName, setHabitName] = useState("Habit check-in");
  const [prompt, setPrompt] = useState("Show yourself doing habit check-in.");
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [phase, setPhase] = useState<CapturePhase>("camera");
  const [error, setError] = useState<string | null>(null);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [retryHint, setRetryHint] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const { trigger: triggerFlash, Flash } = useShutterFlash();
  const demoPassEnabled = useMemo(() => isDemoPassEnabled(), []);
  const defaultCaption = useMemo(
    () => `Checked in for ${habitName.toLowerCase()}.`,
    [habitName],
  );

  useEffect(() => {
    let isActive = true;

    if (!id || !user?.id) {
      return;
    }

    getHabitCaptureMeta(id, user.id)
      .then(async (habit) => {
        if (!isActive) return;

        setHabitName(habit.name);
        setPrompt(`Show yourself doing ${habit.name.toLowerCase()}.`);

        const aiPrompt = await fetchAIPrompt(habit.name);
        if (isActive) {
          setPrompt(aiPrompt);
        }
      })
      .catch((loadError: unknown) => {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load habit.");
        }
      });

    return () => {
      isActive = false;
    };
  }, [id, user?.id]);

  const runVerification = useCallback(
    async (uri: string) => {
      setPhase("verifying");
      setError(null);
      setRetryMessage(null);
      setRetryHint(null);

      try {
        const verification = await verifySnapPhoto({
          localUri: uri,
          promptText: prompt,
        });

        if (verification.passed) {
          setPhase("caption");
          return;
        }

        setRetryMessage(verification.message);
        setRetryHint(verification.retryHint);
        setPhase("failed");
      } catch (verifyError) {
        setError(verifyError instanceof Error ? verifyError.message : "Verification failed.");
        setPhase("failed");
      }
    },
    [prompt],
  );

  const handleCapture = async () => {
    if (!id || !user?.id) {
      setError("You need to be signed in to post a habit photo.");
      return;
    }

    if (!cameraRef.current || !isCameraReady || submitting) {
      return;
    }

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

      if (!picture?.uri) {
        throw new Error("Camera did not return a photo.");
      }

      setCapturedUri(picture.uri);
      setCaption("");
      await runVerification(picture.uri);
    } catch (captureError) {
      setError(captureError instanceof Error ? captureError.message : "Failed to capture photo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoPass = () => {
    if (!capturedUri) return;
    setCaption("");
    setError(null);
    setRetryMessage(null);
    setRetryHint(null);
    setPhase("caption");
  };

  const handlePost = async () => {
    if (!id || !user?.id || !capturedUri || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await submitSoloSnap({
        habitId: id,
        userId: user.id,
        localUri: capturedUri,
        caption: caption.trim() || defaultCaption,
        promptText: prompt,
      });

      router.replace("/");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to post your snap.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setCapturedUri(null);
    setCaption("");
    setError(null);
    setRetryMessage(null);
    setRetryHint(null);
    setPhase("camera");
    setSubmitting(false);
  };

  if (!permission) {
    return <View style={styles.screen} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <Stack gap={spacing.xl} style={styles.permissionState}>
          <Typography
            serif
            color={colors.bg}
            style={{ fontSize: 24, lineHeight: 32, textAlign: "center" }}
          >
            Camera access needed to prove your habit
          </Typography>
          <AnimatedPress onPress={requestPermission} style={styles.permissionButton}>
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
    <View style={styles.screen}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
        onCameraReady={() => setIsCameraReady(true)}
      />
      <Flash />

      {capturedUri ? (
        <View style={StyleSheet.absoluteFill}>
          <Image source={{ uri: capturedUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: phase === "verifying" ? colors.black + "22" : colors.black + "33" },
            ]}
          />
        </View>
      ) : null}

      {phase === "verifying" ? <ScanOverlay /> : null}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
          <View style={styles.header}>
            <Row style={{ justifyContent: "space-between" }}>
              <AnimatedPress
                onPress={phase === "verifying" ? undefined : () => router.back()}
                disabled={phase === "verifying"}
                style={[styles.iconButton, phase === "verifying" && styles.dimmedButton]}
              >
                <Icon icon={Cancel01Icon} size={20} color={colors.bg} />
              </AnimatedPress>

              <Stack gap={2} style={styles.habitBadge}>
                <Typography color={colors.bg} style={styles.habitBadgeTitle}>
                  {habitName}
                </Typography>
                <Row gap={spacing.xs}>
                  <Icon icon={Clock01Icon} size={11} color={colors.bg} />
                  <Typography variant="metaItalic" color={colors.bg}>
                    Ends in 42 min
                  </Typography>
                </Row>
              </Stack>

              <AnimatedPress
                onPress={() => setFlash(flash === "off" ? "on" : "off")}
                disabled={submitting || !!capturedUri}
                style={[styles.iconButton, capturedUri && styles.dimmedButton]}
              >
                <Icon
                  icon={flash === "off" ? FlashOffIcon : FlashIcon}
                  size={20}
                  color={flash === "off" ? colors.bg : colors.yellow}
                />
              </AnimatedPress>
            </Row>
          </View>

          {phase === "camera" ? (
            <View style={styles.promptCard}>
              <Stack gap={4}>
                <Typography variant="metaItalic" color={colors.primary}>
                  Today&apos;s prompt
                </Typography>
                <Typography style={styles.promptText}>{prompt}</Typography>
              </Stack>
            </View>
          ) : null}

          <View style={{ flex: 1 }} />

          {phase === "failed" ? (
            <Animated.View entering={FadeIn.duration(300)}>
              <View style={styles.statusCard}>
                <Row gap={spacing.sm} style={styles.failedHeader}>
                  <Icon icon={AlertCircleIcon} size={15} color={colors.danger} strokeWidth={2} />
                  <Typography
                    variant="meta"
                    color={colors.danger}
                    style={{ fontFamily: fonts.bodySemibold }}
                  >
                    Verification failed
                  </Typography>
                </Row>

                <Stack gap={spacing.md} style={styles.statusBody}>
                  {error ? (
                    <Typography color={colors.danger} style={styles.centeredText}>
                      {error}
                    </Typography>
                  ) : null}

                  {retryMessage ? (
                    <Stack gap={spacing.xs}>
                      <Typography style={styles.failedTitle}>{retryMessage}</Typography>
                      {retryHint ? (
                        <Typography variant="meta" color={colors.white + "88"} style={styles.centeredText}>
                          {retryHint}
                        </Typography>
                      ) : null}
                    </Stack>
                  ) : null}

                  <Row gap={spacing.sm} style={{ justifyContent: "center" }}>
                    <AnimatedPress onPress={handleRetake} style={styles.secondaryAction}>
                      <Typography style={styles.secondaryActionText}>Retake</Typography>
                    </AnimatedPress>
                    {demoPassEnabled ? (
                      <AnimatedPress onPress={handleDemoPass} style={styles.primaryAction}>
                        <Typography style={styles.primaryActionText}>Demo Pass</Typography>
                      </AnimatedPress>
                    ) : null}
                  </Row>
                </Stack>
              </View>
            </Animated.View>
          ) : null}

          {phase === "caption" ? (
            <Animated.View entering={FadeIn.duration(300)}>
              <Pressable onPress={Keyboard.dismiss}>
                <View style={[styles.statusCard, styles.verifiedCard, keyboardVisible && styles.keyboardRaisedCard]}>
                  <Row style={styles.verifiedHeader}>
                    <Row gap={spacing.sm} style={{ alignItems: "center" }}>
                      <Icon icon={CheckmarkCircle02Icon} size={15} color={colors.success} strokeWidth={2} />
                      <Typography
                        variant="meta"
                        color={colors.success}
                        style={{ fontFamily: fonts.bodySemibold }}
                      >
                        Verified
                      </Typography>
                    </Row>
                    <AnimatedPress onPress={Keyboard.dismiss} style={styles.dismissButton}>
                      <Icon icon={Cancel01Icon} size={14} color={colors.white + "88"} />
                    </AnimatedPress>
                  </Row>

                  <Stack gap={spacing.md} style={styles.verifiedBody}>
                    <Stack gap={spacing.xs}>
                      <Typography variant="metaItalic" color={colors.white + "66"} style={{ paddingLeft: spacing.xs }}>
                        Add a caption
                      </Typography>
                      <TextInput
                        value={caption}
                        onChangeText={setCaption}
                        placeholder={defaultCaption}
                        placeholderTextColor={colors.white + "22"}
                        multiline
                        editable={!submitting}
                        style={styles.captionInput}
                      />
                    </Stack>

                    <Row gap={spacing.sm} style={{ justifyContent: "space-between", alignItems: "center" }}>
                      <AnimatedPress
                        onPress={handleRetake}
                        disabled={submitting}
                        style={styles.verifiedSecondaryAction}
                      >
                        <Typography style={styles.secondaryActionText}>Retake</Typography>
                      </AnimatedPress>
                      <AnimatedPress
                        onPress={handlePost}
                        disabled={submitting}
                        style={styles.verifiedPrimaryAction}
                      >
                        {submitting ? (
                          <ActivityIndicator color={colors.onPrimary} size="small" />
                        ) : (
                          <Typography style={styles.primaryActionText}>Post</Typography>
                        )}
                      </AnimatedPress>
                    </Row>
                  </Stack>
                </View>
              </Pressable>
            </Animated.View>
          ) : null}

          {phase === "camera" ? (
            <View style={{ paddingBottom: spacing.lg }}>
              <Row style={styles.cameraActions}>
                <View style={{ width: 52 }} />
                <View style={{ alignItems: "center", justifyContent: "center" }}>
                  <ShutterButton onCapture={handleCapture} disabled={submitting || !isCameraReady} />
                  {submitting ? (
                    <View style={styles.shutterSpinner}>
                      <ActivityIndicator color={colors.primary} />
                    </View>
                  ) : null}
                </View>
                <AnimatedPress
                  onPress={() => setFacing(facing === "back" ? "front" : "back")}
                  disabled={submitting}
                  style={styles.rotateButton}
                >
                  <Icon icon={CameraRotated01Icon} size={22} color={colors.bg} />
                </AnimatedPress>
              </Row>
            </View>
          ) : null}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.black,
  },
  permissionState: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
  },
  scanOverlay: {
    zIndex: 10,
    overflow: "hidden",
  },
  scanOverlayTint: {
    backgroundColor: colors.black + "44",
  },
  scanShimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: shimmerWidth,
  },
  scanCopy: {
    position: "absolute",
    bottom: screenHeight * 0.38,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: spacing.md,
  },
  scanSpinner: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.white + "0a",
    borderWidth: 1,
    borderColor: colors.white + "18",
    alignItems: "center",
    justifyContent: "center",
  },
  scanTitle: {
    fontFamily: fonts.heading,
    fontSize: 19,
    lineHeight: 26,
    color: colors.white,
    textAlign: "center",
  },
  centeredText: {
    textAlign: "center",
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.black + "80",
    alignItems: "center",
    justifyContent: "center",
  },
  dimmedButton: {
    opacity: 0.4,
  },
  habitBadge: {
    alignItems: "center",
    backgroundColor: colors.black + "80",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  habitBadgeTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    lineHeight: 22,
  },
  promptCard: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.bg + "f2",
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  promptText: {
    fontFamily: fonts.heading,
    fontSize: 17,
    lineHeight: 24,
    color: colors.fg,
  },
  statusCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.black + "cc",
    borderWidth: 1,
    overflow: "hidden",
  },
  failedHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  statusBody: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  failedTitle: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
  },
  primaryAction: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  secondaryAction: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.white + "14",
    alignItems: "center",
  },
  primaryActionText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
    color: colors.onPrimary,
  },
  secondaryActionText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
    color: colors.white + "cc",
  },
  verifiedCard: {
    borderColor: colors.success + "66",
  },
  keyboardRaisedCard: {
    marginBottom: spacing.xs,
  },
  verifiedHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: "space-between",
    alignItems: "center",
  },
  dismissButton: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.white + "12",
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  captionInput: {
    minHeight: 56,
    maxHeight: 100,
    borderRadius: radius.md,
    backgroundColor: colors.white + "0a",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.white + "ee",
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: "top",
  },
  verifiedPrimaryAction: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedSecondaryAction: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.white + "14",
  },
  cameraActions: {
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  shutterSpinner: {
    position: "absolute",
  },
  rotateButton: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.black + "80",
    alignItems: "center",
    justifyContent: "center",
  },
});
