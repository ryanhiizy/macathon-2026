import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { Typography } from "@/components/typography";
import { AnimatedPress } from "@/components/animated-press";
import { colors, spacing } from "@/lib/theme";

type FloatingHeart = { id: number; dx: number };

type Props = {
  initialCount: number;
  tint?: string;
};

export function LikeButton({ initialCount, tint }: Props) {
  const [liked, setLiked] = useState(false);
  const [floaters, setFloaters] = useState<FloatingHeart[]>([]);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(
    () => () => {
      timeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId));
    },
    [],
  );

  const onPress = () => {
    const next = !liked;
    setLiked(next);
    Haptics.impactAsync(
      next ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
    ).catch(() => {});

    if (next) {
      const now = Date.now();
      const newFloaters: FloatingHeart[] = [
        { id: now, dx: -14 },
        { id: now + 1, dx: 2 },
        { id: now + 2, dx: 18 },
      ];
      setFloaters((prev) => [...prev, ...newFloaters]);
      const timeoutId = setTimeout(() => {
        setFloaters((prev) => prev.filter((f) => !newFloaters.some((n) => n.id === f.id)));
        timeoutRefs.current = timeoutRefs.current.filter((activeId) => activeId !== timeoutId);
      }, 900);
      timeoutRefs.current.push(timeoutId);
    }
  };

  const count = initialCount + (liked ? 1 : 0);

  return (
    <AnimatedPress onPress={onPress} haptic={false} scale={0.95} style={{ position: "relative" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
        <Icon
          icon={FavouriteIcon}
          size={18}
          color={liked ? colors.red : (tint ?? colors.fg)}
          strokeWidth={liked ? 2.2 : 1.7}
        />
        <Typography variant="meta" color={liked ? colors.red : (tint ?? colors.fg)}>
          {count}
        </Typography>
      </View>
      {floaters.map((f, i) => (
        <FloatHeart key={f.id} dx={f.dx} delay={i * 60} />
      ))}
    </AnimatedPress>
  );
}

function FloatHeart({ dx, delay }: { dx: number; delay: number }) {
  const ty = useSharedValue(0);
  const opacity = useSharedValue(0);
  const s = useSharedValue(0.6);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: dx },
      { translateY: ty.value },
      { scale: s.value },
    ],
    opacity: opacity.value,
  }));

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 120 }),
        withTiming(0, { duration: 520, easing: Easing.out(Easing.quad) }),
      ),
    );
    ty.value = withDelay(
      delay,
      withTiming(-34, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );
    s.value = withDelay(
      delay,
      withSequence(
        withTiming(1.15, { duration: 180, easing: Easing.out(Easing.quad) }),
        withTiming(0.8, { duration: 520, easing: Easing.out(Easing.quad) }),
      ),
    );
  }, [delay, opacity, s, ty]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: 4,
          top: 0,
        },
        style,
      ]}
    >
      <Icon icon={FavouriteIcon} size={14} color={colors.red} strokeWidth={2.4} />
    </Animated.View>
  );
}
