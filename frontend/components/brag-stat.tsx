import { View } from "react-native";
import { Row, Stack, Divider } from "@/components/layout";
import { Typography } from "@/components/typography";
import { colors, fonts, spacing } from "@/lib/theme";

type Props = {
  name: string;
  value: string;
  unit: string;
  caption: string;
};

// A quiet dispatch about someone else's win. No big block of color —
// just two hairlines and a serif number, like a small newspaper notice
// pasted into the feed.
export function BragStat({ name, value, unit, caption }: Props) {
  return (
    <Stack gap={spacing.md} style={{ paddingVertical: spacing.sm }}>
      <Divider />

      <Row gap={spacing.sm} style={{ justifyContent: "center" }}>
        <Typography
          style={{
            fontFamily: fonts.heading,
            fontSize: 13,
            lineHeight: 18,
            color: colors.fgFaint,
            letterSpacing: 0.3,
          }}
        >
          A dispatch from {name}
        </Typography>
      </Row>

      <View style={{ alignItems: "center", paddingVertical: spacing.xs }}>
        <Typography
          style={{
            fontFamily: fonts.heading,
            fontSize: 54,
            lineHeight: 60,
            color: colors.fg,
            letterSpacing: -1.5,
          }}
        >
          {value}
        </Typography>
        <Typography
          style={{
            fontFamily: fonts.heading,
            fontSize: 18,
            lineHeight: 24,
            color: colors.fgMuted,
            marginTop: 2,
          }}
        >
          {unit}
        </Typography>
      </View>

      <Typography
        variant="body"
        italic
        color={colors.fgMuted}
        style={{ textAlign: "center", paddingHorizontal: spacing.lg }}
      >
        {caption}
      </Typography>

      <Divider />
    </Stack>
  );
}
