import { View } from "react-native";
import {
  RunningShoesIcon,
  Dumbbell01Icon,
  BookOpen01Icon,
  Yoga01Icon,
  DropletIcon,
  CookBookIcon,
  SunriseIcon,
  Fire02Icon,
  Comment01Icon,
} from "@hugeicons/core-free-icons";
import type { HugeiconsProps } from "@hugeicons/react-native";
import { AnimatedPress } from "@/components/animated-press";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icon";
import { LikeButton } from "@/components/like-button";
import { StreakFlame } from "@/components/streak-flame";
import { Row, Stack } from "@/components/layout";
import { Typography } from "@/components/typography";
import { colors, palette, fonts, radius, spacing } from "@/lib/theme";

type Props = {
  id: string;
  name: string;
  handle: string;
  when: string;
  color: string;
  letter: string;
  streak: number;
  value: string;
  unit: string;
  caption: string;
  likes: number;
  comments: number;
  onComment?: () => void;
};

const UNIT_ICONS: { pattern: RegExp; icon: HugeiconsProps["icon"]; accent: string }[] = [
  { pattern: /run/i, icon: RunningShoesIcon, accent: palette.blue300 },
  { pattern: /gym|lift|weight/i, icon: Dumbbell01Icon, accent: palette.orange300 },
  { pattern: /read/i, icon: BookOpen01Icon, accent: palette.blue300 },
  { pattern: /meditat|yoga|mindful/i, icon: Yoga01Icon, accent: palette.purple300 },
  { pattern: /water|drink|hydra/i, icon: DropletIcon, accent: palette.cyan300 },
  { pattern: /cook|meal/i, icon: CookBookIcon, accent: palette.red300 },
  { pattern: /morning|wake/i, icon: SunriseIcon, accent: palette.orange300 },
];

const DEFAULT_ICON = { icon: Fire02Icon, accent: palette.orange300 };

function iconForUnit(unit: string) {
  for (const entry of UNIT_ICONS) {
    if (entry.pattern.test(unit)) return entry;
  }
  return DEFAULT_ICON;
}

export function BragStat({
  id,
  name,
  handle,
  when,
  color,
  letter,
  streak,
  value,
  unit,
  caption,
  likes,
  comments,
  onComment,
}: Props) {
  const { icon, accent } = iconForUnit(unit);

  return (
    <Stack gap={spacing.md}>
      <Row style={{ justifyContent: "space-between" }}>
        <Row gap={spacing.md}>
          <Avatar color={color} letter={letter} size={40} ring={false} />
          <View>
            <Typography variant="label">{name}</Typography>
            <Typography variant="metaItalic">
              {handle} · {when}
            </Typography>
          </View>
        </Row>
        <StreakFlame days={streak} />
      </Row>

      <View
        style={{
          backgroundColor: palette.base950,
          borderRadius: radius.lg,
          overflow: "hidden",
          padding: spacing.xl,
          gap: spacing.md,
        }}
      >
        <View
          style={{
            position: "absolute",
            right: 12,
            top: -32,
            opacity: 0.07,
          }}
          pointerEvents="none"
        >
          <Icon icon={icon} size={200} color={colors.white} strokeWidth={1.2} />
        </View>

        <View style={{ gap: 2 }}>
          <Typography
            style={{
              fontFamily: fonts.heading,
              fontSize: 64,
              lineHeight: 68,
              color: accent,
              letterSpacing: -3,
            }}
          >
            {value}
          </Typography>
          <Typography
            style={{
              fontFamily: fonts.heading,
              fontSize: 20,
              lineHeight: 26,
              color: palette.base300,
            }}
          >
            {unit}
          </Typography>
        </View>

        <Typography
          style={{
            fontFamily: fonts.body,
            fontSize: 14,
            lineHeight: 20,
            color: palette.base400,
          }}
        >
          {caption}
        </Typography>
      </View>

      <Row gap={spacing.md} style={{ paddingHorizontal: spacing.xs }}>
        <LikeButton initialCount={likes} snapId={id} />
        <AnimatedPress
          onPress={onComment}
          style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}
          scale={0.9}
          haptic={false}
        >
          <Icon icon={Comment01Icon} size={18} color={colors.fg} strokeWidth={1.7} />
          <Typography variant="meta">{comments}</Typography>
        </AnimatedPress>
      </Row>
    </Stack>
  );
}
