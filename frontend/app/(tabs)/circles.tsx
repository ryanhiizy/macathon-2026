import { Pressable, View } from "react-native";
import {
  Search01Icon,
  PlusSignIcon,
  Fire03Icon,
  RunningShoesIcon,
  DropletIcon,
  Yoga01Icon,
} from "@hugeicons/core-free-icons";
import { Screen, Card, Row, Stack } from "@/components/layout";
import { Typography } from "@/components/typography";
import { Icon } from "@/components/icon";
import { colors, radius, spacing, fonts } from "@/lib/theme";

type Circle = {
  id: string;
  name: string;
  members: number;
  streak: number;
  icon: typeof RunningShoesIcon;
  accent: string;
};

const CIRCLES: Circle[] = [
  { id: "1", name: "5K Every Day", members: 142, streak: 12, icon: RunningShoesIcon, accent: colors.orange },
  { id: "2", name: "Hydration Club", members: 89, streak: 5, icon: DropletIcon, accent: colors.cyan },
  { id: "3", name: "Morning Flow", members: 47, streak: 23, icon: Yoga01Icon, accent: colors.purple },
];

export default function Circles() {
  return (
    <Screen>
      <Row style={{ justifyContent: "space-between" }}>
        <Pressable
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.pill,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon icon={Search01Icon} size={22} color={colors.fg} />
        </Pressable>
        <Typography style={{ fontFamily: fonts.heading, fontSize: 28, color: colors.fg }}>
          Circles
        </Typography>
        <Pressable
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.pill,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon icon={PlusSignIcon} size={22} color={colors.onPrimary} />
        </Pressable>
      </Row>

      <Stack gap={spacing.md}>
        {CIRCLES.map((circle) => (
          <CircleCard key={circle.id} circle={circle} />
        ))}
      </Stack>
    </Screen>
  );
}

function CircleCard({ circle }: { circle: Circle }) {
  return (
    <Card>
      <Row gap={spacing.md}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: radius.md,
            backgroundColor: colors.bgRaised,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon icon={circle.icon} size={30} color={circle.accent} />
        </View>
        <Stack gap={spacing.xs} style={{ flex: 1 }}>
          <Typography variant="label">{circle.name}</Typography>
          <Row gap={spacing.sm}>
            <Typography variant="caption">{circle.members} members</Typography>
            <Typography variant="caption">·</Typography>
            <Row gap={spacing.xs}>
              <Icon icon={Fire03Icon} size={14} color={colors.primary} />
              <Typography variant="caption" color={colors.primary} style={{ fontFamily: fonts.bodyBold }}>
                {circle.streak}
              </Typography>
            </Row>
          </Row>
        </Stack>
      </Row>
      <Row gap={spacing.sm}>
        {[colors.orange, colors.green, colors.blue, colors.purple].map((c, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              aspectRatio: 1,
              borderRadius: radius.sm,
              backgroundColor: colors.ui,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: radius.pill,
                backgroundColor: c,
              }}
            />
          </View>
        ))}
      </Row>
    </Card>
  );
}
