import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors } from "@/lib/theme";

type Props = {
  onCapture?: () => void;
  disabled?: boolean;
};

// Shutter button + full-screen white flash overlay. Render the <Flash/> at
// the root of the camera screen so it covers the preview.

export function useShutterFlash() {
  const opacity = useSharedValue(0);
  const flashStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const trigger = () => {
    opacity.value = withSequence(
      withTiming(0.85, { duration: 60, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 340, easing: Easing.out(Easing.cubic) }),
    );
  };

  const Flash = () => (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: colors.bg },
        flashStyle,
      ]}
    />
  );

  return { trigger, Flash };
}

export function ShutterButton({ onCapture, disabled = false }: Props) {
  const scale = useSharedValue(1);
  const ringScale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  const onPress = () => {
    if (disabled) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    scale.value = withSequence(
      withTiming(0.82, { duration: 70, easing: Easing.out(Easing.quad) }),
      withTiming(1.06, { duration: 160, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 160, easing: Easing.out(Easing.cubic) }),
    );
    ringScale.value = withSequence(
      withTiming(1.12, { duration: 200, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) }),
    );
    onCapture?.();
  };

  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <Animated.View
        style={[
          {
            width: 84,
            height: 84,
            borderRadius: 42,
            backgroundColor: colors.bg + "30",
            borderWidth: 4,
            borderColor: colors.bg,
            alignItems: "center",
            justifyContent: "center",
            opacity: disabled ? 0.5 : 1,
          },
          ringStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              width: 66,
              height: 66,
              borderRadius: 33,
              backgroundColor: colors.bg,
            },
            style,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}
