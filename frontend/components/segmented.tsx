import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, View, type LayoutChangeEvent, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Typography } from "@/components/typography";
import { colors, fonts, radius, spacing } from "@/lib/theme";

type Props = {
  options: string[];
  value: number;
  onChange: (i: number) => void;
  align?: "stretch" | "compact";
  variant?: "pill" | "text";
  style?: ViewStyle;
};

const PAD = 3;
const TIMING = { duration: 180, easing: Easing.out(Easing.quad) };

export function Segmented({ options, value, onChange, align = "stretch", variant = "pill", style }: Props) {
  if (variant === "text") {
    return <TextSegmented options={options} value={value} onChange={onChange} style={style} />;
  }

  return (
    <PillSegmented
      options={options}
      value={value}
      onChange={onChange}
      align={align}
      style={style}
    />
  );
}

function PillSegmented({
  options,
  value,
  onChange,
  align = "stretch",
  style,
}: Omit<Props, "variant">) {
  const isCompact = align === "compact";

  const [containerWidth, setContainerWidth] = useState(0);
  const itemLayouts = useRef<{ x: number; width: number }[]>([]);
  const [layoutReady, setLayoutReady] = useState(false);

  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(0);

  const onContainerLayout = (e: LayoutChangeEvent) =>
    setContainerWidth(e.nativeEvent.layout.width);

  const onItemLayout = useCallback(
    (index: number, e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      itemLayouts.current[index] = { x, width };
      if (itemLayouts.current.filter(Boolean).length === options.length) {
        setLayoutReady(true);
      }
    },
    [options.length],
  );

  useEffect(() => {
    if (isCompact && layoutReady) {
      const layout = itemLayouts.current[value];
      if (!layout) return;
      indicatorX.value = withTiming(layout.x, TIMING);
      indicatorW.value = withTiming(layout.width, TIMING);
    } else if (!isCompact && containerWidth > 0) {
      const itemWidth = (containerWidth - PAD * 2) / options.length;
      indicatorX.value = withTiming(value * itemWidth, TIMING);
      indicatorW.value = withTiming(itemWidth, TIMING);
    }
  }, [value, isCompact, layoutReady, containerWidth, options.length, indicatorX, indicatorW]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorW.value,
  }));

  const ready = isCompact ? layoutReady : containerWidth > 0;

  return (
    <View
      onLayout={onContainerLayout}
      style={{
        padding: PAD,
        borderRadius: radius.pill,
        backgroundColor: colors.bgRaised,
        flexDirection: "row",
        alignSelf: isCompact ? "flex-start" : "auto",
        ...style,
      }}
    >
      {ready && (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: PAD,
              left: PAD,
              bottom: PAD,
              borderRadius: radius.pill,
              backgroundColor: colors.bg,
            },
            indicatorStyle,
          ]}
        />
      )}
      {options.map((opt, i) => {
        const selected = i === value;
        const label = isCompact ? opt.replaceAll(" ", "\u00A0") : opt;
        return (
          <Pressable
            key={opt}
            onLayout={(e) => onItemLayout(i, e)}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(i);
            }}
            style={{
              flex: isCompact ? 0 : 1,
              flexShrink: 0,
              paddingVertical: 7,
              paddingHorizontal: spacing.md,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              style={{
                flexShrink: 0,
                fontFamily: selected ? fonts.bodyBold : fonts.bodyMedium,
                fontSize: 12.5,
                lineHeight: 16,
                color: selected ? colors.fg : colors.fgFaint,
                textAlign: "center",
              }}
            >
              {label}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}

function TextSegmented({ options, value, onChange, style }: Omit<Props, "align" | "variant">) {
  const itemLayouts = useRef<{ x: number; width: number }[]>([]);
  const [layoutReady, setLayoutReady] = useState(false);

  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(0);

  const onItemLayout = useCallback(
    (index: number, e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      itemLayouts.current[index] = { x, width };
      if (itemLayouts.current.filter(Boolean).length === options.length) {
        setLayoutReady(true);
      }
    },
    [options.length],
  );

  useEffect(() => {
    if (!layoutReady) return;
    const layout = itemLayouts.current[value];
    if (!layout) return;
    indicatorX.value = withTiming(layout.x, TIMING);
    indicatorW.value = withTiming(layout.width, TIMING);
  }, [value, layoutReady, indicatorX, indicatorW]);

  const underlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorW.value,
  }));

  return (
    <View style={{ flexDirection: "row", alignSelf: "flex-start", gap: spacing.lg, ...style }}>
      {options.map((opt, i) => {
        const selected = i === value;
        return (
          <Pressable
            key={opt}
            onLayout={(e) => onItemLayout(i, e)}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(i);
            }}
            style={{ paddingBottom: 6 }}
          >
            <Typography
              style={{
                fontFamily: selected ? fonts.bodySemibold : fonts.body,
                fontSize: 13,
                lineHeight: 16,
                color: selected ? colors.fg : colors.fgFaint,
              }}
            >
              {opt}
            </Typography>
          </Pressable>
        );
      })}
      {layoutReady && (
        <Animated.View
          style={[
            {
              position: "absolute",
              bottom: 0,
              left: 0,
              height: 2,
              borderRadius: 1,
              backgroundColor: colors.fg,
            },
            underlineStyle,
          ]}
        />
      )}
    </View>
  );
}
