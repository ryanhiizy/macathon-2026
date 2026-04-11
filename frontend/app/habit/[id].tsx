import { Pressable, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft01Icon,
  Fire03Icon,
  Award01Icon,
  Tick02Icon,
  Cancel01Icon,
  Calendar03Icon,
  Clock01Icon,
  UserMultiple02Icon,
  Camera01Icon,
  SunriseIcon,
  DropletIcon,
  BookOpen01Icon,
  Yoga01Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { Screen, Card, Row, Stack } from "@/components/layout";
import { Typography, Eyebrow } from "@/components/typography";
import { Icon } from "@/components/icon";
import { CoachInsightCard } from "@/components/CoachInsightCard";
import { colors, radius, spacing, fonts } from "@/lib/theme";

// ── mock data (same source as habits tab for now) ──────────────────────

type HabitData = {
  id: string;
  name: string;
  icon: typeof SunriseIcon;
  accent: string;
  streak: number;
  bestStreak: number;
  time: string;
  category: string;
  frequency: string;
  completionRate: number;
  totalCompleted: number;
  totalScheduled: number;
  history: { day: string; done: boolean }[];
};

const HABITS_MAP: Record<string, HabitData> = {
  "1": {
    id: "1",
    name: "Morning walk",
    icon: SunriseIcon,
    accent: colors.orange,
    streak: 12,
    bestStreak: 18,
    time: "7:00 AM",
    category: "fitness",
    frequency: "Daily",
    completionRate: 0.85,
    totalCompleted: 24,
    totalScheduled: 28,
    history: [
      { day: "Mon", done: true },
      { day: "Tue", done: true },
      { day: "Wed", done: true },
      { day: "Thu", done: false },
      { day: "Fri", done: true },
      { day: "Sat", done: true },
      { day: "Sun", done: true },
    ],
  },
  "2": {
    id: "2",
    name: "Drink water",
    icon: DropletIcon,
    accent: colors.cyan,
    streak: 5,
    bestStreak: 14,
    time: "All day",
    category: "health",
    frequency: "Daily",
    completionRate: 0.71,
    totalCompleted: 20,
    totalScheduled: 28,
    history: [
      { day: "Mon", done: true },
      { day: "Tue", done: false },
      { day: "Wed", done: true },
      { day: "Thu", done: true },
      { day: "Fri", done: false },
      { day: "Sat", done: true },
      { day: "Sun", done: true },
    ],
  },
  "3": {
    id: "3",
    name: "Meditate",
    icon: Yoga01Icon,
    accent: colors.purple,
    streak: 23,
    bestStreak: 23,
    time: "8:30 AM",
    category: "mindfulness",
    frequency: "Daily",
    completionRate: 0.93,
    totalCompleted: 26,
    totalScheduled: 28,
    history: [
      { day: "Mon", done: true },
      { day: "Tue", done: true },
      { day: "Wed", done: true },
      { day: "Thu", done: true },
      { day: "Fri", done: true },
      { day: "Sat", done: false },
      { day: "Sun", done: true },
    ],
  },
  "4": {
    id: "4",
    name: "Read 10 pages",
    icon: BookOpen01Icon,
    accent: colors.green,
    streak: 3,
    bestStreak: 9,
    time: "9:00 PM",
    category: "learning",
    frequency: "Daily",
    completionRate: 0.57,
    totalCompleted: 16,
    totalScheduled: 28,
    history: [
      { day: "Mon", done: false },
      { day: "Tue", done: true },
      { day: "Wed", done: false },
      { day: "Thu", done: true },
      { day: "Fri", done: false },
      { day: "Sat", done: true },
      { day: "Sun", done: true },
    ],
  },
};

export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const habit = HABITS_MAP[id ?? "1"];

  if (!habit) return null;

  return (
    <Screen>
      {/* Header */}
      <Row style={{ justifyContent: "space-between" }}>
        <Pressable
          onPress={() => router.back()}
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
        <Pressable
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
            backgroundColor: `${habit.accent}18`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon icon={habit.icon} size={30} color={habit.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Typography style={{ fontFamily: fonts.heading, fontSize: 24, color: colors.fg }}>
            {habit.name}
          </Typography>
          <Row gap={spacing.md}>
            <Row gap={spacing.xs}>
              <Icon icon={Clock01Icon} size={14} color={colors.fgMuted} />
              <Typography variant="caption">{habit.time}</Typography>
            </Row>
            <Row gap={spacing.xs}>
              <Icon icon={Calendar03Icon} size={14} color={colors.fgMuted} />
              <Typography variant="caption">{habit.frequency}</Typography>
            </Row>
          </Row>
        </View>
      </Row>

      {/* Stats row */}
      <Row gap={spacing.md} style={{ justifyContent: "space-between" }}>
        <StatCard
          icon={Fire03Icon}
          iconColor={colors.orange}
          value={`${habit.streak}`}
          label="Current streak"
        />
        <StatCard
          icon={Award01Icon}
          iconColor={colors.yellow}
          value={`${habit.bestStreak}`}
          label="Best streak"
        />
        <StatCard
          icon={Tick02Icon}
          iconColor={colors.green}
          value={`${Math.round(habit.completionRate * 100)}%`}
          label="Completion"
        />
      </Row>

      {/* AI Coach */}
      <CoachInsightCard habitId={habit.id} habitName={habit.name} />

      {/* This week */}
      <View>
        <Eyebrow style={{ marginBottom: spacing.md }}>This week</Eyebrow>
        <Card>
          <Row style={{ justifyContent: "space-between" }}>
            {habit.history.map((day) => (
              <View key={day.day} style={{ alignItems: "center", gap: spacing.xs }}>
                <Typography variant="caption" style={{ fontFamily: fonts.bodyMedium }}>
                  {day.day}
                </Typography>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: radius.pill,
                    backgroundColor: day.done ? `${colors.success}18` : colors.ui,
                    borderWidth: 1,
                    borderColor: day.done ? colors.success : colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {day.done ? (
                    <Icon icon={Tick02Icon} size={16} color={colors.success} />
                  ) : (
                    <Icon icon={Cancel01Icon} size={16} color={colors.fgDim} />
                  )}
                </View>
              </View>
            ))}
          </Row>
        </Card>
      </View>

      {/* Progress summary */}
      <View>
        <Eyebrow style={{ marginBottom: spacing.md }}>Last 30 days</Eyebrow>
        <Card>
          <Row style={{ justifyContent: "space-between" }}>
            <View>
              <Typography variant="caption">Completed</Typography>
              <Typography style={{ fontFamily: fonts.heading, fontSize: 28, color: colors.fg }}>
                {habit.totalCompleted}
              </Typography>
            </View>
            <View>
              <Typography variant="caption">Scheduled</Typography>
              <Typography style={{ fontFamily: fonts.heading, fontSize: 28, color: colors.fg }}>
                {habit.totalScheduled}
              </Typography>
            </View>
            <View>
              <Typography variant="caption">Rate</Typography>
              <Typography style={{ fontFamily: fonts.heading, fontSize: 28, color: colors.success }}>
                {Math.round(habit.completionRate * 100)}%
              </Typography>
            </View>
          </Row>

          {/* Progress bar */}
          <View
            style={{
              height: 8,
              borderRadius: radius.pill,
              backgroundColor: colors.ui,
              marginTop: spacing.sm,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                width: `${habit.completionRate * 100}%`,
                borderRadius: radius.pill,
                backgroundColor: colors.success,
              }}
            />
          </View>
        </Card>
      </View>

      {/* Prove button */}
      <Pressable
        style={{
          height: 52,
          borderRadius: radius.pill,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: spacing.sm,
        }}
      >
        <Icon icon={Camera01Icon} size={22} color={colors.onPrimary} />
        <Typography
          style={{ fontFamily: fonts.bodyBold, fontSize: 16, color: colors.onPrimary }}
        >
          Prove it
        </Typography>
      </Pressable>
    </Screen>
  );
}

function StatCard({
  icon,
  iconColor,
  value,
  label,
}: {
  icon: typeof Fire03Icon;
  iconColor: string;
  value: string;
  label: string;
}) {
  return (
    <Card style={{ flex: 1, alignItems: "center", paddingVertical: spacing.lg }}>
      <Icon icon={icon} size={22} color={iconColor} />
      <Typography style={{ fontFamily: fonts.heading, fontSize: 22, color: colors.fg, marginTop: spacing.xs }}>
        {value}
      </Typography>
      <Typography variant="caption" style={{ textAlign: "center" }}>
        {label}
      </Typography>
    </Card>
  );
}
