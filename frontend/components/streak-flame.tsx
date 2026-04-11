import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Fire03Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { Typography } from "@/components/typography";
import { colors, fonts, radius, spacing } from "@/lib/theme";

type Props = {
  days: number;
  size?: "sm" | "md" | "lg";
};

export function StreakFlame({ days, size = "sm" }: Props) {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [pulse]);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const iconSize = size === "lg" ? 22 : size === "md" ? 18 : 14;
  const padV = size === "lg" ? 8 : size === "md" ? 6 : 4;
  const padH = size === "lg" ? 14 : size === "md" ? 10 : 8;
  const fontSize = size === "lg" ? 16 : size === "md" ? 14 : 12.5;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
        paddingHorizontal: padH,
        paddingVertical: padV,
        borderRadius: radius.pill,
        backgroundColor: colors.red + "1f",
      }}
    >
      <Animated.View style={animStyle}>
        <Icon icon={Fire03Icon} size={iconSize} color={colors.red} />
      </Animated.View>
      <Typography
        color={colors.red}
        style={{ fontFamily: fonts.bodyBold, fontSize, lineHeight: fontSize + 2 }}
      >
        {days}
      </Typography>
    </View>
  );
}
