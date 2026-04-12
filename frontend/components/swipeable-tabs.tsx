import { type ReactNode, useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  type SharedValue,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";

const SCREEN_W = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_W * 0.25;
const VELOCITY_THRESHOLD = 500;
const ANIM_CFG = { duration: 260, easing: Easing.out(Easing.cubic) } as const;

type Props = {
  value: number;
  onChange: (index: number) => void;
  children: ReactNode[];
  /**
   * Pass a shared value + callback for a full-page swipe-back gesture.
   * The shared value drives the whole page translateX in the parent;
   * the callback fires when the swipe completes (e.g. router.back()).
   */
  backTranslateX?: SharedValue<number>;
  onSwipeBack?: () => void;
};

export function SwipeableTabs({
  value,
  onChange,
  children,
  backTranslateX,
  onSwipeBack,
}: Props) {
  const count = children.length;
  const translateX = useSharedValue(-value * SCREEN_W);
  const startX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withTiming(-value * SCREEN_W, ANIM_CFG);
  }, [value, translateX]);

  const pan = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-10, 10])
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((e) => {
      const currentIdx = Math.round(-startX.value / SCREEN_W);
      const isBackGesture =
        currentIdx === 0 && e.translationX > 0 && backTranslateX;

      if (isBackGesture) {
        backTranslateX.value = Math.min(e.translationX, SCREEN_W);
        return;
      }

      const next = startX.value + e.translationX;
      const min = -(count - 1) * SCREEN_W;
      translateX.value = Math.max(min, Math.min(0, next));
    })
    .onEnd((e) => {
      const currentIdx = Math.round(-startX.value / SCREEN_W);

      const isBackGesture =
        currentIdx === 0 &&
        backTranslateX &&
        backTranslateX.value > 0;

      if (isBackGesture) {
        const shouldGoBack =
          e.translationX > SWIPE_THRESHOLD ||
          e.velocityX > VELOCITY_THRESHOLD;

        if (shouldGoBack && onSwipeBack) {
          backTranslateX.value = withTiming(SCREEN_W, ANIM_CFG);
          runOnJS(onSwipeBack)();
        } else {
          backTranslateX.value = withTiming(0, ANIM_CFG);
        }
        return;
      }

      let newIdx = currentIdx;

      if (
        e.translationX < -SWIPE_THRESHOLD ||
        e.velocityX < -VELOCITY_THRESHOLD
      ) {
        newIdx = Math.min(currentIdx + 1, count - 1);
      } else if (
        e.translationX > SWIPE_THRESHOLD ||
        e.velocityX > VELOCITY_THRESHOLD
      ) {
        newIdx = Math.max(currentIdx - 1, 0);
      }

      translateX.value = withTiming(-newIdx * SCREEN_W, ANIM_CFG);
      if (newIdx !== currentIdx) {
        runOnJS(onChange)(newIdx);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.row, rowStyle]}>
          {children.map((child, i) => (
            <View key={i} style={styles.page}>
              {child}
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },
  row: { flexDirection: "row", height: "100%" },
  page: { width: SCREEN_W, height: "100%" },
});
