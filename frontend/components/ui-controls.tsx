import { Pressable, View } from "react-native";
import { Row } from "@/components/layout";
import { Typography } from "@/components/typography";
import { colors, radius, fonts } from "@/lib/theme";

type SegmentedPickerProps = {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
};

export function SegmentedPicker({ options, selectedIndex, onChange }: SegmentedPickerProps) {
  return (
    <Row
      style={{
        backgroundColor: colors.ui,
        borderRadius: radius.pill,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {options.map((option, index) => {
        const active = index === selectedIndex;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(index)}
            style={{
              flex: 1,
              height: 40,
              borderRadius: radius.pill,
              backgroundColor: active ? colors.card : "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="label"
              style={{
                fontFamily: active ? fonts.bodyBold : fonts.bodyMedium,
                color: active ? colors.fg : colors.fgMuted,
              }}
            >
              {option}
            </Typography>
          </Pressable>
        );
      })}
    </Row>
  );
}

export function ProgressRing({ progress, color }: { progress: number; color: string }) {
  return (
    <View
      style={{
        width: 90,
        height: 90,
        borderRadius: radius.pill,
        borderWidth: 8,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          height: `${Math.max(0, Math.min(1, progress)) * 100}%`,
          backgroundColor: color,
          opacity: 0.18,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          borderRadius: radius.pill,
          borderWidth: 8,
          borderColor: color,
          borderRightColor: colors.border,
          borderBottomColor: colors.border,
          transform: [{ rotate: "-45deg" }],
        }}
      />
    </View>
  );
}

export function ProgressBar({ progress, color }: { progress: number; color: string }) {
  return (
    <View
      style={{
        height: 10,
        borderRadius: radius.pill,
        backgroundColor: colors.ui,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          height: "100%",
          width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
          backgroundColor: color,
          borderRadius: radius.pill,
        }}
      />
    </View>
  );
}
