import { useEffect, useId } from "react";
import { View } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

const AnimatedPath = Animated.createAnimatedComponent(Path);

type Props = {
  data: number[];
  width: number;
  height: number;
  color: string;
  fillOpacity?: number;
};

export function Sparkline({ data, width, height, color, fillOpacity = 0.12 }: Props) {
  const drawProgress = useSharedValue(0);
  const fillFade = useSharedValue(0);
  const gradientId = useId().replace(/:/g, "_");

  useEffect(() => {
    drawProgress.value = 0;
    fillFade.value = 0;
    drawProgress.value = withTiming(1, {
      duration: 2000,
      easing: Easing.out(Easing.cubic),
    });
    fillFade.value = withDelay(
      300,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );
  }, [data, drawProgress, fillFade]);

  const hasEnoughData = data.length >= 2;
  let linePath = "";
  let fillPath = "";
  let pathLen = 0;

  if (hasEnoughData) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padY = height * 0.1;
    const usableH = height - padY * 2;

    const points = data.map((v, i) => ({
      x: (i / (data.length - 1)) * width,
      y: padY + usableH - ((v - min) / range) * usableH,
    }));

    linePath = `M${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(i + 2, points.length - 1)];

      const tension = 0.3;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      linePath += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }

    fillPath = `${linePath} L${width},${height} L0,${height} Z`;

    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      pathLen += Math.sqrt(dx * dx + dy * dy);
    }
    pathLen *= 1.5;
  }

  const lineAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: pathLen * (1 - drawProgress.value),
  }));

  const fillAnimatedProps = useAnimatedProps(() => ({
    opacity: fillFade.value,
  }));

  if (!hasEnoughData) return <View style={{ width, height }} />;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={fillOpacity} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <AnimatedPath
          d={fillPath}
          fill={`url(#${gradientId})`}
          animatedProps={fillAnimatedProps}
        />
        <AnimatedPath
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={[pathLen, pathLen]}
          animatedProps={lineAnimatedProps}
        />
      </Svg>
    </View>
  );
}
