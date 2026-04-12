import { useEffect, useState, useCallback, useMemo } from "react";
import { Pressable, View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft01Icon,
  Fire03Icon,
  Award01Icon,
  Tick02Icon,
  Clock01Icon,
  Camera01Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { Screen, Row, Stack } from "@/components/layout";
import { Typography } from "@/components/typography";
import { Icon } from "@/components/icon";
import { CoachInsightInline } from "@/components/CoachInsightCard";
import { colors, palette, radius, spacing, fonts, tintFor } from "@/lib/theme";
import {
  fetchHabitDetail,
  getMockHabitDetail,
  type HabitDetailView,
} from "@/lib/habits";
import { useAuth } from "@/lib/auth-context";

export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, demoSession } = useAuth();
  const [habit, setHabit] = useState<HabitDetailView | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) {
      setHabit(null);
      setLoading(false);
      return;
    }

    if (demoSession) {
      setHabit(getMockHabitDetail(id));
      setLoading(false);
      return;
    }

    if (!user) {
      setHabit(null);
      setLoading(false);
      return;
    }

    const data = await fetchHabitDetail(id, user.id);
    setHabit(data);
    setLoading(false);
  }, [demoSession, id, user]);

  useEffect(() => {
    load();
  }, [load]);

  const backButton = (
    <Pressable
      onPress={() => router.back()}
      hitSlop={8}
      style={{
        width: 40,
        height: 40,
        borderRadius: radius.pill,
        backgroundColor: colors.ui,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon icon={ArrowLeft01Icon} size={20} color={colors.fg} />
    </Pressable>
  );

  if (loading) {
    return (
      <Screen>
        <Row>{backButton}</Row>
        <View style={{ alignItems: "center", paddingTop: spacing.xxl }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!habit) {
    return (
      <Screen>
        <Row>{backButton}</Row>
        <View style={{ alignItems: "center", paddingTop: spacing.xxl }}>
          <Typography variant="caption">Habit not found.</Typography>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Header */}
      <Row style={{ justifyContent: "space-between" }}>
        {backButton}
        <Pressable
          onPress={() => router.push(`/edit-habit/${id}`)}
          hitSlop={8}
          style={{
            width: 40,
            height: 40,
            borderRadius: radius.pill,
            backgroundColor: colors.ui,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon icon={Edit02Icon} size={20} color={colors.fg} />
        </Pressable>
      </Row>

      {/* Habit identity */}
      <Row gap={spacing.lg}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: radius.lg,
            backgroundColor: tintFor(habit.accent),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon icon={habit.icon} size={28} color={habit.accent} strokeWidth={1.8} />
        </View>
        <View style={{ flex: 1 }}>
          <Typography
            style={{ fontFamily: fonts.heading, fontSize: 24, color: colors.fg }}
          >
            {habit.name}
          </Typography>
          <Row gap={spacing.md} style={{ marginTop: 2 }}>
            <Row gap={spacing.xs}>
              <Icon icon={Clock01Icon} size={14} color={colors.fgMuted} />
              <Typography variant="caption">{habit.time}</Typography>
            </Row>
            <Typography variant="caption" color={colors.fgDim}>
              ·
            </Typography>
            <Typography variant="caption">{habit.frequency}</Typography>
          </Row>
        </View>
      </Row>

      {/* Streak strip */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.bgRaised,
          borderRadius: radius.lg,
          overflow: "hidden",
        }}
      >
        <StatInline
          icon={Fire03Icon}
          iconColor={colors.orange}
          value={habit.streak}
          label="day streak"
        />
        <View style={{ width: 1, alignSelf: "stretch", backgroundColor: colors.border }} />
        <StatInline
          icon={Award01Icon}
          iconColor={colors.yellow}
          value={habit.bestStreak}
          label="best"
        />
        <View style={{ width: 1, alignSelf: "stretch", backgroundColor: colors.border }} />
        <StatInline
          value={Math.round(habit.completionRate * 100)}
          label="% rate"
          suffix="%"
        />
      </View>

      {/* This week */}
      <View>
        <Typography
          style={{
            fontFamily: fonts.heading,
            fontSize: 18,
            lineHeight: 22,
            color: colors.fg,
            marginBottom: spacing.md,
          }}
        >
          This week
        </Typography>
        <Row gap={6} style={{ justifyContent: "space-between" }}>
          {habit.history.map((day, i) => {
            const isToday = i === habit.history.length - 1;
            return (
              <Stack key={i} gap={spacing.xs} style={{ flex: 1, alignItems: "center" }}>
                <View
                  style={{
                    width: "100%",
                    aspectRatio: 1,
                    borderRadius: radius.pill,
                    backgroundColor: day.done
                      ? colors.fg
                      : isToday
                        ? colors.bgSunk
                        : colors.bgRaised,
                    borderWidth: isToday && !day.done ? 1.5 : 0,
                    borderColor: colors.fgDim,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {day.done ? (
                    <Icon
                      icon={Tick02Icon}
                      size={16}
                      color={colors.bg}
                      strokeWidth={2.8}
                    />
                  ) : null}
                </View>
                <Typography
                  variant="tiny"
                  color={isToday ? colors.fg : day.done ? colors.fg : colors.fgDim}
                  style={isToday ? { fontFamily: fonts.bodyBold } : undefined}
                >
                  {day.day}
                </Typography>
              </Stack>
            );
          })}
        </Row>
      </View>

      {/* Last 30 days — contribution graph */}
      <ContributionGraph
        data={habit.monthHistory}
        accent={habit.accent}
        completed={habit.totalCompleted}
        scheduled={habit.totalScheduled}
      />

      {/* Coach insights */}
      <CoachInsightInline habitId={habit.id} habitName={habit.name} />

      {/* Prove button */}
      <Pressable
        onPress={() => router.push(`/camera/${habit.id}`)}
        style={{
          height: 52,
          borderRadius: radius.pill,
          backgroundColor: colors.fg,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: spacing.sm,
        }}
      >
        <Icon icon={Camera01Icon} size={22} color={colors.bg} />
        <Typography
          style={{ fontFamily: fonts.bodyBold, fontSize: 16, color: colors.bg }}
        >
          Prove it
        </Typography>
      </Pressable>
    </Screen>
  );
}

function StatInline({
  icon,
  iconColor,
  value,
  label,
  suffix,
}: {
  icon?: typeof Fire03Icon;
  iconColor?: string;
  value: number;
  label: string;
  suffix?: string;
}) {
  return (
    <View style={{ flex: 1, alignItems: "center", paddingVertical: spacing.lg }}>
      <Row gap={4}>
        {icon && iconColor ? (
          <Icon icon={icon} size={18} color={iconColor} strokeWidth={1.8} />
        ) : null}
        <Typography
          style={{
            fontFamily: fonts.heading,
            fontSize: 24,
            lineHeight: 28,
            color: colors.fg,
          }}
        >
          {value}
          {suffix}
        </Typography>
      </Row>
      <Typography variant="tiny" style={{ marginTop: 2 }}>
        {label}
      </Typography>
    </View>
  );
}

function ContributionGraph({
  data,
  accent,
  completed,
  scheduled,
}: {
  data: boolean[];
  accent: string;
  completed: number;
  scheduled: number;
}) {
  const COLS = 6;
  const ROWS = 5;
  const GAP = 4;

  const grid = useMemo(() => {
    const cells: boolean[] = [];
    for (let i = 0; i < COLS * ROWS; i++) {
      cells.push(data[i] ?? false);
    }
    return cells;
  }, [data]);

  const monthLabels = useMemo(() => {
    const labels: string[] = [];
    for (let c = 0; c < COLS; c++) {
      const dayIndex = c * ROWS;
      const d = new Date();
      d.setDate(d.getDate() - (data.length - 1 - dayIndex));
      labels.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
    }
    return labels;
  }, [data]);

  return (
    <View>
      <Row
        style={{
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: spacing.md,
        }}
      >
        <Typography
          style={{
            fontFamily: fonts.heading,
            fontSize: 18,
            lineHeight: 22,
            color: colors.fg,
          }}
        >
          Last 30 days
        </Typography>
        <Typography variant="metaItalic">
          {completed} of {scheduled}
        </Typography>
      </Row>

      <View
        style={{
          backgroundColor: colors.bgRaised,
          borderRadius: radius.lg,
          padding: spacing.lg,
        }}
      >
        <View style={{ flexDirection: "row", gap: GAP }}>
          {Array.from({ length: COLS }).map((_, col) => (
            <View key={col} style={{ flex: 1, gap: GAP }}>
              {Array.from({ length: ROWS }).map((_, row) => {
                const idx = col * ROWS + row;
                const done = grid[idx];
                return (
                  <View
                    key={row}
                    style={{
                      aspectRatio: 1,
                      borderRadius: 4,
                      backgroundColor: done ? accent : `${palette.base300}40`,
                    }}
                  />
                );
              })}
            </View>
          ))}
        </View>

        <Row
          style={{
            justifyContent: "space-between",
            marginTop: spacing.sm,
            paddingHorizontal: 2,
          }}
        >
          {monthLabels
            .filter((_, i) => i % 2 === 0)
            .map((label) => (
              <Typography key={label} variant="tiny" color={colors.fgDim}>
                {label}
              </Typography>
            ))}
        </Row>
      </View>
    </View>
  );
}

