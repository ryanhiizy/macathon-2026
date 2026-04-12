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
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Screen, Row } from "@/components/layout";
import { Typography } from "@/components/typography";
import { Icon } from "@/components/icon";
import { CoachInsightTeaser } from "@/components/CoachInsightCard";
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
    <Screen
      contentStyle={{ paddingBottom: spacing.sm }}
      stickyHeader={
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
      }
    >
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

      <CoachInsightTeaser habitId={habit.id} habitName={habit.name} />

      <View>
        <Typography
          style={{
            fontFamily: fonts.heading,
            fontSize: 18,
            lineHeight: 22,
            color: colors.fg,
            marginBottom: spacing.lg,
          }}
        >
          This week
        </Typography>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.bgRaised,
            borderRadius: radius.lg,
            padding: spacing.md,
            gap: spacing.xs,
          }}
        >
          {habit.history.map((day, i) => {
            const isToday = i === habit.history.length - 1;
            const isMissed = !isToday && !day.done;
            return (
              <View
                key={i}
                style={{
                  flex: 1,
                  alignItems: "center",
                  gap: spacing.sm,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.md,
                  backgroundColor: "transparent",
                }}
              >
                <Typography
                  variant="tiny"
                  color={isToday ? colors.fg : colors.fgDim}
                  style={isToday ? { fontFamily: fonts.bodyBold } : undefined}
                >
                  {day.day}
                </Typography>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: radius.pill,
                    backgroundColor: day.done
                      ? colors.green
                      : isMissed
                        ? colors.red
                        : "transparent",
                    borderWidth: isToday ? 1.5 : 0,
                    borderColor: colors.fgDim,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {day.done ? (
                    <Icon
                      icon={Tick02Icon}
                      size={18}
                      color={colors.white}
                      strokeWidth={2.8}
                    />
                  ) : isMissed ? (
                    <Icon
                      icon={Cancel01Icon}
                      size={16}
                      color={colors.white}
                      strokeWidth={2.4}
                    />
                  ) : null}
                </View>
                {isToday && (
                  <Typography
                    style={{
                      fontFamily: fonts.bodySemibold,
                      fontSize: 9,
                      lineHeight: 12,
                      color: habit.accent,
                    }}
                  >
                    Today
                  </Typography>
                )}
              </View>
            );
          })}
        </View>
      </View>

      <ContributionGraph
        data={habit.monthHistory}
        accent={habit.accent}
        completed={habit.totalCompleted}
        scheduled={habit.totalScheduled}
      />

      <Pressable
        onPress={() => router.push(`/camera/${habit.id}`)}
        style={{
          height: 54,
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
  const ROWS = 7;
  const GAP = 4;

  const { grid, cols } = useMemo(() => {
    const totalDays = data.length;
    const c = Math.ceil(totalDays / ROWS);
    const cells: (boolean | null)[] = [];
    const padCount = c * ROWS - totalDays;
    for (let i = 0; i < padCount; i++) cells.push(null);
    for (let i = 0; i < totalDays; i++) cells.push(data[i]);
    return { grid: cells, cols: c };
  }, [data]);

  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (data.length - 1));
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${fmt(start)} – ${fmt(end)}`;
  }, [data]);

  const pct = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;

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
        <Typography variant="caption" color={colors.fgMuted}>
          {completed}/{scheduled} ({pct}%)
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
          {Array.from({ length: cols }).map((_, col) => (
            <View key={col} style={{ flex: 1, gap: GAP }}>
              {Array.from({ length: ROWS }).map((_, row) => {
                const idx = col * ROWS + row;
                const cell = grid[idx];
                const isEmpty = cell === null;
                return (
                  <View
                    key={row}
                    style={{
                      aspectRatio: 1,
                      borderRadius: 4,
                      backgroundColor: isEmpty
                        ? "transparent"
                        : cell
                          ? accent
                          : `${palette.base300}30`,
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
            alignItems: "center",
            marginTop: spacing.md,
          }}
        >
          <Typography variant="tiny" color={colors.fgDim}>
            {dateRange}
          </Typography>
          <Row gap={spacing.xs} style={{ alignItems: "center" }}>
          <Typography variant="tiny" color={colors.fgDim}>
            Missed
          </Typography>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              backgroundColor: `${palette.base300}30`,
            }}
          />
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              backgroundColor: accent,
            }}
          />
          <Typography variant="tiny" color={colors.fgDim}>
            Done
          </Typography>
          </Row>
        </Row>
      </View>
    </View>
  );
}
