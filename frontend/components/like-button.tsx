import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPress } from "@/components/animated-press";
import { Typography } from "@/components/typography";
import { fetchLikeState, toggleLike } from "@/lib/likes";
import { colors, spacing } from "@/lib/theme";

type FloatingHeart = { id: number; dx: number };

type Props = {
  initialCount: number;
  tint?: string;
  snapId?: string;
};

export function LikeButton({ initialCount, tint, snapId }: Props) {
  const [liked, setLiked] = useState(false);
  const [backendCount, setBackendCount] = useState<number | null>(null);
  const [floaters, setFloaters] = useState<FloatingHeart[]>([]);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!snapId) return;
    fetchLikeState(snapId).then(({ count, liked: isLiked }) => {
      setBackendCount(count);
      setLiked(isLiked);
    });
  }, [snapId]);

  useEffect(
    () => () => {
      timeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId));
    },
    [],
  );

  const onPress = () => {
    const next = !liked;
    setLiked(next);

    if (backendCount !== null) {
      setBackendCount((count) => (count ?? 0) + (next ? 1 : -1));
    }

    Haptics.impactAsync(
      next ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
    ).catch(() => {});

    if (snapId) {
      toggleLike(snapId).catch(() => {
        setLiked(!next);
        if (backendCount !== null) {
          setBackendCount((count) => (count ?? 0) + (next ? -1 : 1));
        }
      });
    }

    if (next) {
      const now = Date.now();
      const newFloaters: FloatingHeart[] = [
        { id: now, dx: -14 },
        { id: now + 1, dx: 2 },
        { id: now + 2, dx: 18 },
      ];
      setFloaters((prev) => [...prev, ...newFloaters]);
      const timeoutId = setTimeout(() => {
        setFloaters((prev) => prev.filter((floater) => !newFloaters.some((item) => item.id === floater.id)));
        timeoutRefs.current = timeoutRefs.current.filter((activeId) => activeId !== timeoutId);
      }, 900);
      timeoutRefs.current.push(timeoutId);
    }
  };

  const count = backendCount !== null ? backendCount : initialCount + (liked ? 1 : 0);
  const iconColor = liked ? colors.red : (tint ?? colors.fg);

  return (
    <AnimatedPress onPress={onPress} haptic={false} scale={0.95} style={{ position: "relative" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
        <Ionicons name={liked ? "heart" : "heart-outline"} size={18} color={iconColor} />
        <Typography variant="meta" color={iconColor}>
          {count}
        </Typography>
      </View>
      {floaters.map((floater, index) => (
        <FloatHeart key={floater.id} dx={floater.dx} delay={index * 60} />
      ))}
    </AnimatedPress>
  );
}

function FloatHeart({ dx, delay }: { dx: number; delay: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.6);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: dx }, { translateY: translateY.value }, { scale: scale.value }],
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
    translateY.value = withDelay(
      delay,
      withTiming(-34, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );
    scale.value = withDelay(
      delay,
      withSequence(
        withTiming(1.15, { duration: 180, easing: Easing.out(Easing.quad) }),
        withTiming(0.8, { duration: 520, easing: Easing.out(Easing.quad) }),
      ),
    );
  }, [delay, opacity, scale, translateY]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: "absolute", left: 4, top: 0 }, style]}
    >
      <Ionicons name="heart" size={14} color={colors.red} />
    </Animated.View>
  );
}
