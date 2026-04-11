import { Pressable, View } from "react-native";
import {
  PlusSignIcon,
  Camera01Icon,
  UserMultiple02Icon,
  Tick02Icon,
  Fire03Icon,
  SunriseIcon,
  DropletIcon,
  BookOpen01Icon,
  Yoga01Icon,
} from "@hugeicons/core-free-icons";
import { Screen, Card, Row, Stack } from "@/components/layout";
import { Typography, Eyebrow } from "@/components/typography";
import { Icon } from "@/components/icon";
import { colors, radius, spacing, fonts } from "@/lib/theme";
import Svg, { Circle } from "react-native-svg";

type Habit = {
  id: string;
  name: string;
  icon: typeof SunriseIcon;
  accent: string;
  streak: number;
  time: string;
  done: boolean;
};

const HABITS: Habit[] = [
  { id: "1", name: "Morning walk", icon: SunriseIcon, accent: colors.orange, streak: 12, time: "7:00 AM", done: true },
  { id: "2", name: "Drink water", icon: DropletIcon, accent: colors.cyan, streak: 5, time: "All day", done: false },
  { id: "3", name: "Meditate", icon: Yoga01Icon, accent: colors.purple, streak: 23, time: "8:30 AM", done: false },
  { id: "4", name: "Read 10 pages", icon: BookOpen01Icon, accent: colors.green, streak: 3, time: "9:00 PM", done: false },
];

export default function Habits() {
  const completed = HABITS.filter((h) => h.done).length;
  const progress = completed / HABITS.length;

  return (
    <Screen>
      <Row style={{ justifyContent: "space-between" }}>
        <View>
          <Eyebrow>Thursday · Apr 11</Eyebrow>
          <Typography style={{ fontFamily: fonts.heading, fontSize: 32, color: colors.fg, marginTop: 4 }}>
            Morning, Budi
          </Typography>
        </View>
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

      <Card style={{ backgroundColor: colors.bgRaised, borderColor: colors.primarySoft }}>
        <Row gap={spacing.lg}>
          <View style={{ width: 90, height: 90, alignItems: "center", justifyContent: "center" }}>
            <ProgressRing progress={progress} />
            <View style={{ position: "absolute", alignItems: "center" }}>
              <Typography style={{ fontFamily: fonts.heading, fontSize: 22, color: colors.fg }}>
                {completed}/{HABITS.length}
              </Typography>
            </View>
          </View>
          <Stack gap={spacing.xs} style={{ flex: 1 }}>
            <Eyebrow>Today&apos;s ring</Eyebrow>
            <Typography variant="label">
              {HABITS.length - completed} habits left
            </Typography>
            <Typography variant="caption">Keep going — you&apos;re on a roll.</Typography>
          </Stack>
        </Row>
      </Card>

      <Stack gap={spacing.md}>
        {HABITS.map((habit) => (
          <HabitCard key={habit.id} habit={habit} />
        ))}
      </Stack>
    </Screen>
  );
}

function ProgressRing({ progress }: { progress: number }) {
  const size = 90;
  const strokeWidth = 10;
  const radiusValue = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusValue;
  const safeProgress = Math.max(0, Math.min(progress, 1));
  const strokeDashoffset = circumference * (1 - safeProgress);

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radiusValue}
        stroke={colors.border}
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
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
}

function HabitCard({ habit }: { habit: Habit }) {
  return (
    <Card style={habit.done && { backgroundColor: colors.ui, borderColor: colors.borderStrong }}>
      <Row style={{ justifyContent: "space-between" }}>
        <Row gap={spacing.md}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: radius.md,
              backgroundColor: colors.bgRaised,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon icon={habit.icon} size={26} color={habit.accent} />
          </View>
          <View>
            <Typography variant="label" style={habit.done && { color: colors.fgMuted }}>
              {habit.name}
            </Typography>
            <Row gap={spacing.sm}>
              <Row gap={spacing.xs}>
                <Icon icon={Fire03Icon} size={14} color={colors.primary} />
                <Typography variant="caption" color={colors.primary} style={{ fontFamily: fonts.bodyBold }}>
                  {habit.streak}
                </Typography>
              </Row>
              <Typography variant="caption">· {habit.time}</Typography>
            </Row>
          </View>
        </Row>
        {habit.done ? (
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: radius.pill,
              backgroundColor: colors.success,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon icon={Tick02Icon} size={20} color={colors.onPrimary} />
          </View>
        ) : (
          <Row gap={spacing.sm}>
            <Pressable
              style={{
                width: 40,
                height: 40,
                borderRadius: radius.pill,
                backgroundColor: colors.ui,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Icon icon={UserMultiple02Icon} size={20} color={colors.fg} />
            </Pressable>
            <Pressable
              style={{
                paddingHorizontal: spacing.lg,
                height: 40,
                borderRadius: radius.pill,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: spacing.xs,
              }}
            >
              <Icon icon={Camera01Icon} size={18} color={colors.onPrimary} />
              <Typography color={colors.onPrimary} style={{ fontFamily: fonts.bodyBold }}>
                Prove
              </Typography>
            </Pressable>
          </Row>
        )}
      </Row>
    </Card>
  );
}
