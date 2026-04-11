import { useMemo } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import {
  PlusSignIcon,
  Camera01Icon,
  UserAdd01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { Screen, Row, Stack, Divider } from "@/components/layout";
import { Typography } from "@/components/typography";
import { Icon } from "@/components/icon";
import { AnimatedPress } from "@/components/animated-press";
import { colors, fonts, radius, spacing, tintFor } from "@/lib/theme";
import { HABITS, WEEK_DAYS, type Habit, type TimeOfDay } from "@/lib/mock";

const greetingFor = (hour: number) => {
  if (hour < 5) return { label: "Night owl", sub: "The world's still dreaming." };
  if (hour < 11) return { label: "Morning", sub: "The day is still soft." };
  if (hour < 14) return { label: "Midday", sub: "Keep the rhythm going." };
  if (hour < 17) return { label: "Afternoon", sub: "Still plenty of day left." };
  if (hour < 21) return { label: "Evening", sub: "Room for one more habit." };
  return { label: "Good night", sub: "A gentle close to the day." };
};

const formatDate = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

const TIME_ORDER: TimeOfDay[] = ["morning", "afternoon", "evening"];
const TIME_LABEL: Record<TimeOfDay, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

export default function Habits() {
  const completed = HABITS.filter((h) => h.done).length;
  const progress = completed / HABITS.length;
  const { greeting, dateLabel } = useMemo(() => {
    const now = new Date();
    return {
      greeting: greetingFor(now.getHours()),
      dateLabel: formatDate(now),
    };
  }, []);

  const weekDone = WEEK_DAYS.filter((d) => d.done).length;

  const grouped = useMemo(() => {
    const map: Record<TimeOfDay, Habit[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };
    for (const h of HABITS) map[h.timeOfDay].push(h);
    return map;
  }, []);

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
          {greeting.label},{" "}
          <Typography
            style={{
              fontFamily: fonts.heading,
              fontSize: 32,
              lineHeight: 38,
              color: colors.primary,
            }}
          >
            Budi
          </Typography>
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
              of {HABITS.length}
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
            {HABITS.length - completed} habits left
          </Typography>
          <Typography variant="bodyMuted">{greeting.sub}</Typography>
        </Stack>
      </Row>

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
          {WEEK_DAYS.map((d, i) => (
            <Stack key={i} gap={spacing.xs} style={{ flex: 1, alignItems: "center" }}>
              <View
                style={{
                  width: "100%",
                  aspectRatio: 1,
                  borderRadius: radius.sm,
                  backgroundColor: d.done ? colors.primary : colors.bgRaised,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {d.done && (
                  <Icon icon={Tick02Icon} size={16} color={colors.onPrimary} strokeWidth={2.8} />
                )}
              </View>
              <Typography variant="tiny" color={d.done ? colors.fg : colors.fgDim}>
                {d.label}
              </Typography>
            </Stack>
          ))}
        </Row>
      </Stack>

      <Stack gap={spacing.xl}>
        {TIME_ORDER.map((t) => {
          const items = grouped[t];
          if (items.length === 0) return null;
          const doneInGroup = items.filter((h) => h.done).length;
          return (
            <Stack key={t} gap={spacing.sm}>
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
                  {TIME_LABEL[t]}
                </Typography>
                <Typography variant="metaItalic">
                  {doneInGroup} of {items.length}
                </Typography>
              </Row>
              <Divider />
              <Stack gap={0}>
                {items.map((habit, i) => (
                  <View key={habit.id}>
                    <HabitRow habit={habit} />
                    {i < items.length - 1 && <Divider />}
                  </View>
                ))}
              </Stack>
            </Stack>
          );
        })}
      </Stack>
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
        originX={size / 2}
        originY={size / 2}
        rotation={-90}
      />
    </Svg>
  );
}

function HistoryStrip({ history, accent }: { history: boolean[]; accent: string }) {
  return (
    <Row gap={6}>
      {history.map((done, i) => (
        <View
          key={i}
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: done ? accent : "transparent",
            borderWidth: done ? 0 : 1.5,
            borderColor: colors.borderStrong,
          }}
        />
      ))}
    </Row>
  );
}

function HabitRow({ habit }: { habit: Habit }) {
  return (
    <View style={{ paddingVertical: spacing.md, opacity: habit.done ? 0.62 : 1 }}>
      <Row gap={spacing.md} style={{ justifyContent: "space-between" }}>
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
            {habit.done ? (
              <Typography variant="metaItalic" color={colors.success}>
                Kept · best {habit.bestStreak}
              </Typography>
            ) : (
              <Typography variant="metaItalic">
                {habit.time} · streak {habit.streak} · best {habit.bestStreak}
              </Typography>
            )}
          </Stack>
        </Row>
        {habit.done ? (
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: radius.pill,
              backgroundColor: colors.success + "22",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon icon={Tick02Icon} size={20} color={colors.success} strokeWidth={2.4} />
          </View>
        ) : (
          <Row gap={spacing.sm}>
            <AnimatedPress
              onPress={() => router.push(`/invite/${habit.id}`)}
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
              onPress={() => router.push(`/camera/${habit.id}`)}
              haptic="medium"
              style={{
                paddingHorizontal: spacing.lg,
                height: 40,
                borderRadius: radius.pill,
                backgroundColor: colors.fg,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: spacing.sm,
              }}
            >
              <Icon icon={Camera01Icon} size={16} color={colors.bg} strokeWidth={2} />
              <Typography
                color={colors.bg}
                style={{ fontFamily: fonts.bodyBold, fontSize: 13 }}
              >
                Prove
              </Typography>
            </AnimatedPress>
          </Row>
        )}
      </Row>
      <View style={{ paddingLeft: 48 + spacing.md, paddingTop: spacing.sm }}>
        <HistoryStrip history={habit.history} accent={habit.accent} />
      </View>
    </View>
  );
}
