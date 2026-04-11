import { useEffect, useState } from "react";
import { Pressable, View, type LayoutChangeEvent } from "react-native";
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
};

const PAD = 3;

// Tight compact pill with a simple linear slide indicator.
export function Segmented({ options, value, onChange, align = "stretch" }: Props) {
  const [width, setWidth] = useState(0);
  const itemWidth = width > 0 ? (width - PAD * 2) / options.length : 0;
  const x = useSharedValue(0);

  useEffect(() => {
    x.value = withTiming(value * itemWidth, {
      duration: 180,
      easing: Easing.out(Easing.quad),
    });
  }, [value, itemWidth, x]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View
      onLayout={onLayout}
      style={{
        padding: PAD,
        borderRadius: radius.pill,
        backgroundColor: colors.bgRaised,
        flexDirection: "row",
        alignSelf: align === "compact" ? "flex-start" : "auto",
      }}
    >
      {itemWidth > 0 && (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: PAD,
              left: PAD,
              bottom: PAD,
              width: itemWidth,
              borderRadius: radius.pill,
              backgroundColor: colors.bg,
            },
            indicatorStyle,
          ]}
        />
      )}
      {options.map((opt, i) => {
        const selected = i === value;
        return (
          <Pressable
            key={opt}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(i);
            }}
            style={{
              flex: align === "compact" ? 0 : 1,
              paddingVertical: 7,
              paddingHorizontal: spacing.md,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              style={{
                fontFamily: selected ? fonts.bodyBold : fonts.bodyMedium,
                fontSize: 12.5,
                lineHeight: 16,
                color: selected ? colors.fg : colors.fgFaint,
              }}
            >
              {opt}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}
