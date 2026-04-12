import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const SCRIBBLE =
  "M2 8 C8 4, 16 13, 24 6 C32 0, 40 14, 52 7 C60 2, 68 12, 78 5 C86 0, 94 13, 104 7 C110 4, 114 10, 116 8";

const PATH_LENGTH = 190;

interface ScribbleUnderlineProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  delay?: number;
  duration?: number;
}

export function ScribbleUnderline({
  width = 118,
  height = 16,
  color = "#8B7EC8",
  strokeWidth = 2.4,
  delay = 260,
  duration = 1000,
}: ScribbleUnderlineProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) }),
    );
  }, [delay, duration, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: PATH_LENGTH * (1 - progress.value),
  }));

  return (
    <Svg width={width} height={height} viewBox="0 0 118 16" fill="none">
      <AnimatedPath
        d={SCRIBBLE}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={PATH_LENGTH}
        animatedProps={animatedProps}
      />
    </Svg>
  );
}
