import { useEffect, useState, useCallback } from "react";
import { Pressable, View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft01Icon,
  Fire03Icon,
  Award01Icon,
  Tick02Icon,
  Cancel01Icon,
  Calendar03Icon,
  Clock01Icon,
  Camera01Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { Screen, Card, Row } from "@/components/layout";
import { Typography, Eyebrow } from "@/components/typography";
import { Icon } from "@/components/icon";
import { CoachInsightCard } from "@/components/CoachInsightCard";
import { colors, radius, spacing, fonts } from "@/lib/theme";
import { fetchHabitDetail, type HabitDetailView } from "@/lib/habits";
import { useAuth } from "@/lib/auth-context";

export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [habit, setHabit] = useState<HabitDetailView | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id || !user) return;
    const data = await fetchHabitDetail(id, user.id);
    setHabit(data);
    setLoading(false);
  }, [id, user]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Screen>
        <Row>
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
        </Row>
        <View style={{ alignItems: "center", paddingTop: spacing.xxl }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!habit) {
    return (
      <Screen>
        <Row>
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
        </Row>
        <Card>
          <Typography variant="caption" style={{ textAlign: "center" }}>
            Habit not found.
          </Typography>
        </Card>
      </Screen>
    );
  }

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
            {habit.history.map((day, i) => (
              <View key={i} style={{ alignItems: "center", gap: spacing.xs }}>
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
