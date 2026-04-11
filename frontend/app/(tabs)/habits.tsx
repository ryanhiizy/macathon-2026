import { useState, useCallback } from "react";
import { Pressable, View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  PlusSignIcon,
  Camera01Icon,
  UserMultiple02Icon,
  Tick02Icon,
  Fire03Icon,
} from "@hugeicons/core-free-icons";
import { Screen, Card, Row, Stack } from "@/components/layout";
import { Typography, Eyebrow } from "@/components/typography";
import { Icon } from "@/components/icon";
import { colors, radius, spacing, fonts } from "@/lib/theme";
import { fetchHabits, type HabitView } from "@/lib/habits";
import { ensureTestSession } from "@/lib/supabase";
import Svg, { Circle } from "react-native-svg";

export default function Habits() {
  const router = useRouter();
  const [habits, setHabits] = useState<HabitView[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    await ensureTestSession();
    const data = await fetchHabits();
    setHabits(data);
    setLoading(false);
  }, []);

  // Fetch on mount + re-fetch when returning from the creation modal
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const completed = habits.filter((h) => h.done).length;
  const progress = habits.length > 0 ? completed / habits.length : 0;

  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = today.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <Screen>
      <Row style={{ justifyContent: "space-between" }}>
        <View>
          <Eyebrow>{dayName} · {monthDay}</Eyebrow>
          <Typography style={{ fontFamily: fonts.heading, fontSize: 32, color: colors.fg, marginTop: 4 }}>
            Your habits
          </Typography>
        </View>
        <Pressable
          onPress={() => router.push("/habits/new")}
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
                {completed}/{habits.length}
              </Typography>
            </View>
          </View>
          <Stack gap={spacing.xs} style={{ flex: 1 }}>
            <Eyebrow>Today&apos;s ring</Eyebrow>
            <Typography variant="label">
              {habits.length - completed} habits left
            </Typography>
            <Typography variant="caption">Keep going — you&apos;re on a roll.</Typography>
          </Stack>
        </Row>
      </Card>

      {loading ? (
        <View style={{ alignItems: "center", paddingTop: spacing.xxl }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : habits.length === 0 ? (
        <Card>
          <Typography variant="caption" style={{ textAlign: "center" }}>
            No habits yet. Tap + to create one.
          </Typography>
        </Card>
      ) : (
        <Stack gap={spacing.md}>
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </Stack>
      )}
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
        originX={size / 2}
        originY={size / 2}
        rotation={-90}
      />
    </Svg>
  );
}

function HabitCard({ habit }: { habit: HabitView }) {
  return (
    <Card style={habit.done ? { backgroundColor: colors.ui, borderColor: colors.borderStrong } : undefined}>
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
            <Typography variant="label" style={habit.done ? { color: colors.fgMuted } : undefined}>
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
