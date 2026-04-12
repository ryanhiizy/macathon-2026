import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, Easing, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  Camera01Icon,
  Fire02Icon,
  PlusSignIcon,
  Tick02Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";
import Svg, { Circle } from "react-native-svg";
import { CoachInsightTeaser } from "@/components/CoachInsightCard";
import { AnimatedPress } from "@/components/animated-press";
import { Icon } from "@/components/icon";
import { Divider, Row, Screen, Stack } from "@/components/layout";
import { Typography } from "@/components/typography";
import { useAuth } from "@/lib/auth-context";
import { fetchHabits, generateMockHabits, type HabitView } from "@/lib/habits";
import { WEEK_DAYS } from "@/lib/mock";
import { colors, fonts, radius, spacing, tintFor } from "@/lib/theme";

type TimeOfDay = "morning" | "afternoon" | "evening";

const TIME_ORDER: TimeOfDay[] = ["morning", "afternoon", "evening"];
const TIME_LABEL: Record<TimeOfDay, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

const DUE_SOON_MINUTES = 30;

type Urgency = {
  dueSoon: boolean;
  overdue: boolean;
  label: string | null;
  color: string | null;
};

const greetingFor = (hour: number) => {
  if (hour < 5) return { label: "Night owl", sub: "The world's still dreaming." };
  if (hour < 11) return { label: "Morning", sub: "The day is still soft." };
  if (hour < 14) return { label: "Midday", sub: "Keep the rhythm going." };
  if (hour < 17) return { label: "Afternoon", sub: "Still plenty of day left." };
  if (hour < 21) return { label: "Evening", sub: "Room for one more habit." };
  return { label: "Good night", sub: "A gentle close to the day." };
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

function getTimeOfDay(time: string): TimeOfDay {
  if (time === "All day") return "afternoon";

  const match = time.match(/^(\d+):(\d+)\s(AM|PM)$/);
  if (!match) return "morning";

  let hours = Number(match[1]) % 12;
  if (match[3] === "PM") {
    hours += 12;
  }

  if (hours < 12) return "morning";
  if (hours < 17) return "afternoon";
  return "evening";
}

function minutesUntilDue(targetTime: string): number | null {
  const [hours, minutes] = targetTime.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  const now = new Date();
  const targetMinutes = hours * 60 + minutes;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return targetMinutes - nowMinutes;
}

function getUrgency(habit: HabitView): Urgency {
  if (habit.done) {
    return { dueSoon: false, overdue: false, label: null, color: null };
  }

  const diff = minutesUntilDue(habit.targetTime);
  if (diff === null) {
    return { dueSoon: false, overdue: false, label: null, color: null };
  }

  if (diff > 0 && diff <= DUE_SOON_MINUTES) {
    return {
      dueSoon: true,
      overdue: false,
      label: `${diff}m left`,
      color: colors.warning,
    };
  }

  if (diff < 0 && diff >= -60) {
    return {
      dueSoon: false,
      overdue: true,
      label: "Overdue",
      color: colors.danger,
    };
  }

  return { dueSoon: false, overdue: false, label: null, color: null };
}

export default function Habits() {
  const router = useRouter();
  const { user, demoSession } = useAuth();
  const [habits, setHabits] = useState<HabitView[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    if (demoSession) {
      setHabits(generateMockHabits());
      setLoading(false);
      return;
    }

    if (!user) {
      setHabits([]);
      setLoading(false);
      return;
    }

    const data = await fetchHabits(user.id);
    setHabits(data);
    setLoading(false);
  }, [demoSession, user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const completed = habits.filter((habit) => habit.done).length;
  const progress = habits.length > 0 ? completed / habits.length : 0;
  const weekDone = WEEK_DAYS.filter((day) => day.done).length;

  const { greeting, dateLabel } = useMemo(() => {
    const now = new Date();
    return {
      greeting: greetingFor(now.getHours()),
      dateLabel: formatDate(now),
    };
  }, []);

  const grouped = useMemo(() => {
    const groups: Record<TimeOfDay, HabitView[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };

    for (const habit of habits) {
      groups[getTimeOfDay(habit.time)].push(habit);
    }

    return groups;
  }, [habits]);

  const coachHabit = habits.find((habit) => habit.streak > 0) ?? habits[0];

  const header = (
    <Row style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
      <Stack gap={spacing.xs}>
        <Typography variant="metaItalic">{dateLabel}</Typography>
        <Typography
          style={{
            fontFamily: fonts.heading,
            fontSize: 32,
            lineHeight: 38,
            color: colors.fg,
          }}
        >
          {greeting.label} check-in
        </Typography>
      </Stack>
      <AnimatedPress
        onPress={() => router.push("/create-habit")}
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
      <Row gap={spacing.lg} style={{ alignItems: "center", paddingVertical: spacing.sm }}>
        <View style={{ width: 96, height: 96, alignItems: "center", justifyContent: "center" }}>
          <ProgressRing progress={progress} />
          <View style={{ position: "absolute", alignItems: "center" }}>
            <Typography
              style={{
                fontFamily: fonts.heading,
                fontSize: 26,
                lineHeight: 30,
                color: colors.fg,
              }}
            >
              {completed}
            </Typography>
            <Typography variant="metaItalic" style={{ marginTop: 2 }}>
              of {habits.length || 0}
            </Typography>
          </View>
        </View>
        <Stack gap={spacing.xs} style={{ flex: 1 }}>
          <Typography
            style={{
              fontFamily: fonts.heading,
              fontSize: 22,
              lineHeight: 28,
              color: colors.fg,
            }}
          >
            {Math.max(habits.length - completed, 0)} habits left
          </Typography>
          <Typography variant="bodyMuted">{greeting.sub}</Typography>
        </Stack>
      </Row>

      {coachHabit ? (
        <CoachInsightTeaser
          habitId={coachHabit.id}
          habitName={coachHabit.name}
          onPress={() => router.push(`/habit/${coachHabit.id}`)}
        />
      ) : null}

      <Stack gap={spacing.md}>
        <Row gap={spacing.sm} style={{ alignItems: "baseline", justifyContent: "space-between" }}>
          <Typography
            style={{
              fontFamily: fonts.heading,
              fontSize: 18,
              lineHeight: 22,
              color: colors.fg,
            }}
          >
            This week
          </Typography>
          <Typography variant="metaItalic">{weekDone} of 7 days</Typography>
        </Row>
        <Row gap={6}>
          {WEEK_DAYS.map((day) => (
            <Stack key={day.label} gap={spacing.xs} style={{ flex: 1, alignItems: "center" }}>
              <View
                style={{
                  width: "100%",
                  aspectRatio: 1,
                  borderRadius: radius.sm,
                  backgroundColor: day.done ? colors.primary : colors.bgRaised,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {day.done ? (
                  <Icon icon={Tick02Icon} size={16} color={colors.onPrimary} strokeWidth={2.8} />
                ) : null}
              </View>
              <Typography variant="tiny" color={day.done ? colors.fg : colors.fgDim}>
                {day.label}
              </Typography>
            </Stack>
          ))}
        </Row>
      </Stack>

      {loading ? (
        <View style={{ alignItems: "center", paddingTop: spacing.xl }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : habits.length === 0 ? (
        <Stack gap={spacing.sm} style={{ paddingVertical: spacing.xl, alignItems: "center" }}>
          <Typography
            style={{
              fontFamily: fonts.heading,
              fontSize: 20,
              lineHeight: 26,
              color: colors.fgMuted,
            }}
          >
            No habits yet
          </Typography>
          <Typography variant="metaItalic">Tap + to create your first ritual.</Typography>
        </Stack>
      ) : (
        <Stack gap={spacing.xl}>
          {TIME_ORDER.map((timeOfDay) => {
            const items = grouped[timeOfDay];
            if (items.length === 0) return null;

            const doneInGroup = items.filter((habit) => habit.done).length;

            return (
              <Stack key={timeOfDay} gap={spacing.sm}>
                <Row
                  gap={spacing.sm}
                  style={{ alignItems: "baseline", justifyContent: "space-between" }}
                >
                  <Typography
                    style={{
                      fontFamily: fonts.heading,
                      fontSize: 18,
                      lineHeight: 22,
                      color: colors.fg,
                    }}
                  >
                    {TIME_LABEL[timeOfDay]}
                  </Typography>
                  <Typography variant="metaItalic">
                    {doneInGroup} of {items.length}
                  </Typography>
                </Row>
                <Divider />
                <Stack gap={0}>
                  {items.map((habit, index) => (
                    <View key={habit.id}>
                      <HabitRow
                        habit={habit}
                        urgency={getUrgency(habit)}
                        onOpen={() => router.push(`/habit/${habit.id}`)}
                        onInvite={() => router.push(`/invite/${habit.id}`)}
                        onProve={() => router.push(`/camera/${habit.id}`)}
                      />
                      {index < items.length - 1 ? <Divider /> : null}
                    </View>
                  ))}
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      )}
    </Screen>
  );
}

function ProgressRing({ progress }: { progress: number }) {
  const size = 96;
  const strokeWidth = 10;
  const radiusValue = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusValue;
  const safe = Math.max(0, Math.min(progress, 1));
  const offset = circumference * (1 - safe);

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radiusValue}
        stroke={colors.bgSunk}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radiusValue}
        stroke={colors.primary}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90, ${size / 2}, ${size / 2})`}
      />
    </Svg>
  );
}

function PulsingDot({ color }: { color: string }) {
  const anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.4,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  return (
    <Animated.View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: color,
        opacity: anim,
      }}
    />
  );
}

function HabitRow({
  habit,
  urgency,
  onOpen,
  onInvite,
  onProve,
}: {
  habit: HabitView;
  urgency: Urgency;
  onOpen: () => void;
  onInvite: () => void;
  onProve: () => void;
}) {
  const urgent = urgency.dueSoon || urgency.overdue;
  const urgentColor = urgency.color ?? colors.fg;

  return (
    <View
      style={{
        paddingVertical: spacing.md,
        opacity: habit.done ? 0.62 : 1,
      }}
    >
      <Row gap={spacing.md} style={{ justifyContent: "space-between" }}>
        <AnimatedPress onPress={onOpen} haptic={false} style={{ flex: 1 }}>
          <Row gap={spacing.md} style={{ flex: 1 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: radius.md,
                backgroundColor: tintFor(habit.accent),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon icon={habit.icon} size={24} color={habit.accent} strokeWidth={1.8} />
            </View>
            <Stack gap={4} style={{ flex: 1 }}>
              <Row gap={spacing.sm} style={{ alignItems: "center" }}>
                <Typography
                  style={{
                    fontFamily: fonts.heading,
                    fontSize: 17,
                    lineHeight: 22,
                    color: colors.fg,
                    textDecorationLine: habit.done ? "line-through" : "none",
                  }}
                >
                  {habit.name}
                </Typography>
                {urgent && urgency.label ? (
                  <Row
                    gap={4}
                    style={{
                      alignItems: "center",
                      backgroundColor: `${urgentColor}1a`,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: radius.pill,
                    }}
                  >
                    <PulsingDot color={urgentColor} />
                    <Typography
                      style={{
                        fontFamily: fonts.bodySemibold,
                        fontSize: 11,
                        lineHeight: 14,
                        color: urgentColor,
                      }}
                    >
                      {urgency.label}
                    </Typography>
                  </Row>
                ) : null}
              </Row>
              <Row gap={spacing.sm} style={{ alignItems: "center" }}>
                <Typography variant="metaItalic" color={habit.done ? colors.success : undefined}>
                  {habit.done ? "Kept today" : habit.time}
                </Typography>
                <Row gap={3} style={{ alignItems: "center" }}>
                  <Icon icon={Fire02Icon} size={13} color={colors.danger} strokeWidth={1.8} />
                  <Typography
                    style={{
                      fontFamily: fonts.bodySemibold,
                      fontSize: 12,
                      lineHeight: 16,
                      color: colors.danger,
                    }}
                  >
                    {habit.streak}
                  </Typography>
                </Row>
              </Row>
            </Stack>
          </Row>
        </AnimatedPress>

        {habit.done ? (
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: radius.pill,
              backgroundColor: `${colors.success}22`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon icon={Tick02Icon} size={20} color={colors.success} strokeWidth={2.4} />
          </View>
        ) : (
          <Row gap={spacing.sm}>
            <AnimatedPress
              onPress={onInvite}
              style={{
                width: 40,
                height: 40,
                borderRadius: radius.pill,
                backgroundColor: colors.bgRaised,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon icon={UserAdd01Icon} size={18} color={colors.fg} strokeWidth={1.8} />
            </AnimatedPress>
            <AnimatedPress
              onPress={onProve}
              haptic="medium"
              style={{
                paddingHorizontal: spacing.lg,
                height: 40,
                borderRadius: radius.pill,
                backgroundColor: urgent ? urgentColor : colors.fg,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: spacing.sm,
              }}
            >
              <Icon icon={Camera01Icon} size={16} color={colors.bg} strokeWidth={2} />
              <Typography color={colors.bg} style={{ fontFamily: fonts.bodyBold, fontSize: 13 }}>
                Prove
              </Typography>
            </AnimatedPress>
          </Row>
        )}
      </Row>
    </View>
  );
}
