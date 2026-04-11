import { forwardRef, type ElementRef, type ReactNode } from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const AnimView = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, "style" | "children"> & {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  scale?: number;
  haptic?: false | "light" | "medium" | "heavy";
};

export const AnimatedPress = forwardRef<ElementRef<typeof Pressable>, Props>(function AnimatedPress(
  { children, style, scale = 0.96, haptic = "light", onPressIn, onPressOut, onPress, ...rest },
  ref,
) {
  const s = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: s.value }],
  }));
  return (
    <AnimView
      ref={ref}
      {...rest}
      onPressIn={(e) => {
        s.value = withTiming(scale, { duration: 150 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        s.value = withTiming(1, { duration: 150 });
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) {
          const map = {
            light: Haptics.ImpactFeedbackStyle.Light,
            medium: Haptics.ImpactFeedbackStyle.Medium,
            heavy: Haptics.ImpactFeedbackStyle.Heavy,
          } as const;
          Haptics.impactAsync(map[haptic]).catch(() => {});
        }
        onPress?.(e);
      }}
      style={[animStyle, style]}
    >
      {children}
    </AnimView>
  );
});
