import { useCallback, useState } from "react";
import { ActivityIndicator, View, type LayoutChangeEvent } from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  Search01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { Screen, Row, Stack } from "@/components/layout";
import { Typography } from "@/components/typography";
import { Icon } from "@/components/icon";
import { Sparkline } from "@/components/sparkline";
import { AnimatedPress } from "@/components/animated-press";
import { colors, fonts, radius, spacing, tintFor } from "@/lib/theme";
import { fetchMyCircles, type CircleView } from "@/lib/circles";
import { useAuth } from "@/lib/auth-context";

export default function Circles() {
  const { user } = useAuth();
  const [circles, setCircles] = useState<CircleView[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const data = await fetchMyCircles(user.id);
    setCircles(data);
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const header = (
    <Row style={{ justifyContent: "space-between" }}>
      <AnimatedPress
        onPress={() => router.push("/search-circles")}
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
            fontFamily: fonts.headingLight,
            fontSize: 28,
            lineHeight: 32,
            color: colors.fg,
          }}
        >
          Circles
        </Typography>
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

  if (loading) {
    return (
      <Screen stickyHeader={header}>
        <View style={{ paddingTop: spacing.xxl, alignItems: "center" }}>
          <ActivityIndicator color={colors.fgFaint} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen stickyHeader={header}>
      <Stack gap={spacing.xxl}>
        {circles.map((circle) => (
          <CircleRowView key={circle.id} circle={circle} />
        ))}
      </Stack>
    </Screen>
  );
}

const WEEK_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function CircleRowView({ circle }: { circle: CircleView }) {
  const { analytics: a } = circle;
  const todayPct = Math.round(a.todayRate * 100);
  const [chartW, setChartW] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    setChartW(e.nativeEvent.layout.width);
  };

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
            {circle.members} members
          </Typography>
        </Stack>
      </Row>

      <View
        onLayout={onLayout}
        style={{
          backgroundColor: colors.bgRaised,
          borderRadius: radius.md,
          padding: spacing.lg,
          gap: spacing.lg,
        }}
      >
        <Row style={{ justifyContent: "space-between" }}>
          <StatCell label="Today" value={`${todayPct}%`} accent={circle.accent} />
          <StatCell label="Avg streak" value={`${a.avgStreak}d`} />
          <StatCell label="Best" value={`${a.topStreak}d`} />
        </Row>

        {chartW > 0 && (
          <Sparkline
            data={a.trendLine}
            width={chartW - spacing.lg * 2}
            height={48}
            color={circle.accent}
            fillOpacity={0.15}
          />
        )}

        <Row style={{ justifyContent: "space-between" }}>
          {a.weekDaily.map((rate, i) => (
            <View key={i} style={{ alignItems: "center", gap: 4 }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: rate >= 0.7 ? circle.accent : colors.border,
                  opacity: rate >= 0.7 ? 0.5 + rate * 0.5 : 0.5,
                }}
              />
              <Typography
                style={{
                  fontFamily: fonts.body,
                  fontSize: 10,
                  lineHeight: 12,
                  color: colors.fgFaint,
                }}
              >
                {WEEK_LABELS[i]}
              </Typography>
            </View>
          ))}
        </Row>
      </View>
    </AnimatedPress>
  );
}

function StatCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <Stack gap={2} style={{ alignItems: "center" }}>
      <Typography
        style={{
          fontFamily: fonts.body,
          fontSize: 11,
          lineHeight: 14,
          color: colors.fgFaint,
        }}
      >
        {label}
      </Typography>
      <Typography
        style={{
          fontFamily: fonts.bodySemibold,
          fontSize: 17,
          lineHeight: 22,
          color: accent ?? colors.fg,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
