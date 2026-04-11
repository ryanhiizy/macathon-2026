import { View } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import {
  Search01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { Screen, Row, Stack } from "@/components/layout";
import { Typography } from "@/components/typography";
import { Icon } from "@/components/icon";
import { AnimatedPress } from "@/components/animated-press";
import { StreakFlame } from "@/components/streak-flame";
import { colors, fonts, radius, spacing, tintFor } from "@/lib/theme";
import { CIRCLES, pickPhoto, type CircleRow } from "@/lib/mock";

export default function Circles() {
  const header = (
    <Row style={{ justifyContent: "space-between" }}>
      <AnimatedPress
        style={{
          width: 44,
          height: 44,
          borderRadius: radius.pill,
          backgroundColor: colors.bgRaised,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon icon={Search01Icon} size={20} color={colors.fg} strokeWidth={1.8} />
      </AnimatedPress>
      <Stack gap={0} style={{ alignItems: "center" }}>
        <Typography
          style={{
            fontFamily: fonts.heading,
            fontSize: 28,
            lineHeight: 32,
            color: colors.fg,
          }}
        >
          Circles
        </Typography>
        <Typography variant="metaItalic">{CIRCLES.length} joined</Typography>
      </Stack>
      <AnimatedPress
        onPress={() => router.push("/create-circle")}
        style={{
          width: 44,
          height: 44,
          borderRadius: radius.pill,
          backgroundColor: colors.fg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon icon={PlusSignIcon} size={22} color={colors.bg} strokeWidth={2.2} />
      </AnimatedPress>
    </Row>
  );

  return (
    <Screen stickyHeader={header}>
      <Stack gap={spacing.xxl}>
        {CIRCLES.map((circle, i) => (
          <CircleRowView key={circle.id} circle={circle} index={i} />
        ))}
      </Stack>
    </Screen>
  );
}

function CircleRowView({ circle, index }: { circle: CircleRow; index: number }) {
  return (
    <AnimatedPress
      onPress={() => router.push(`/circle/${circle.id}`)}
      haptic="light"
      scale={0.98}
      style={{ gap: spacing.md }}
    >
      <Row gap={spacing.md} style={{ alignItems: "center" }}>
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: radius.md,
            backgroundColor: tintFor(circle.accent),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon icon={circle.icon} size={30} color={circle.accent} strokeWidth={1.8} />
        </View>
        <Stack gap={4} style={{ flex: 1 }}>
          <Typography
            style={{
              fontFamily: fonts.heading,
              fontSize: 20,
              lineHeight: 24,
              color: colors.fg,
            }}
          >
            {circle.name}
          </Typography>
          <Typography variant="metaItalic">
            {circle.members} members · your streak {circle.streak}
          </Typography>
        </Stack>
        <StreakFlame days={circle.streak} />
      </Row>

      <Row gap={spacing.sm}>
        {[0, 1, 2, 3].map((j) => (
          <View
            key={j}
            style={{
              flex: 1,
              aspectRatio: 1,
              borderRadius: radius.sm,
              overflow: "hidden",
              backgroundColor: colors.bgSunk,
            }}
          >
            <Image
              source={pickPhoto(index * 2 + j)}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={300}
            />
          </View>
        ))}
      </Row>
    </AnimatedPress>
  );
}
