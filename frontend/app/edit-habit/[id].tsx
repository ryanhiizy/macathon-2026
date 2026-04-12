import { useCallback, useEffect, useState } from "react";
import { TextInput, View, ScrollView, Alert, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Cancel01Icon,
  Clock01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Row, Stack } from "@/components/layout";
import { Typography } from "@/components/typography";
import { Icon } from "@/components/icon";
import { AnimatedPress } from "@/components/animated-press";
import { colors, fonts, radius, spacing, tintFor } from "@/lib/theme";
import { HABIT_ICONS, ACCENT_OPTIONS } from "@/lib/mock";
import {
  updateHabit,
  deleteHabit,
  fetchHabitDetail,
  getMockHabitDetail,
  categoryMeta,
  formatTime,
  type HabitDetailView,
} from "@/lib/habits";
import { useAuth } from "@/lib/auth-context";

const TIME_SUGGESTIONS = [
  "6:00 AM",
  "7:30 AM",
  "9:00 AM",
  "12:00 PM",
  "6:00 PM",
  "9:30 PM",
  "All day",
];

const ICON_TO_CATEGORY: Record<string, string> = {
  Sunrise: "morning",
  Water: "water",
  Yoga: "meditation",
  Book: "reading",
  Run: "running",
  Coffee: "morning",
  Plant: "morning",
  Create: "morning",
};

const CATEGORY_TO_ICON: Record<string, string> = Object.fromEntries(
  Object.entries(ICON_TO_CATEGORY).map(([label, cat]) => [cat, label]),
);

function parseTime(display: string): string {
  if (display === "All day") return "00:00:00";
  const match = display.match(/^(\d+):(\d+)\s(AM|PM)$/);
  if (!match) return "07:00:00";
  let h = Number(match[1]);
  const m = match[2];
  if (match[3] === "PM" && h !== 12) h += 12;
  if (match[3] === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${m}:00`;
}

function dbTimeToDisplay(dbTime: string): string {
  const formatted = formatTime(dbTime);
  const match = TIME_SUGGESTIONS.find((t) => t === formatted);
  return match ?? TIME_SUGGESTIONS[1];
}

function findIconIndex(category: string): number {
  const label = CATEGORY_TO_ICON[category];
  if (!label) return 0;
  const idx = HABIT_ICONS.findIndex((h) => h.label === label);
  return idx >= 0 ? idx : 0;
}

function findAccent(category: string): string {
  const meta = categoryMeta(category);
  const match = ACCENT_OPTIONS.find((c) => c === meta.accent);
  return match ?? ACCENT_OPTIONS[0];
}

export default function EditHabit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, demoSession } = useAuth();

  const [loading, setLoading] = useState(true);
  const [habit, setHabit] = useState<HabitDetailView | null>(null);
  const [name, setName] = useState("");
  const [iconIdx, setIconIdx] = useState(0);
  const [accent, setAccent] = useState<string>(ACCENT_OPTIONS[0]);
  const [time, setTime] = useState("7:30 AM");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    let data: HabitDetailView | null = null;
    if (demoSession) {
      data = getMockHabitDetail(id);
    } else if (user) {
      data = await fetchHabitDetail(id, user.id);
    }

    if (data) {
      setHabit(data);
      setName(data.name);
      setIconIdx(findIconIndex(data.category));
      setAccent(findAccent(data.category));
      setTime(dbTimeToDisplay(data.targetTime));
    }

    setLoading(false);
  }, [demoSession, id, user]);

  useEffect(() => {
    load();
  }, [load]);

  const ChosenIcon = HABIT_ICONS[iconIdx].icon;
  const canSave = name.trim().length > 0;

  async function handleSave() {
    if (!canSave || saving || !id) return;

    if (demoSession) {
      router.back();
      return;
    }

    setSaving(true);
    const category = ICON_TO_CATEGORY[HABIT_ICONS[iconIdx].label] ?? "morning";
    const result = await updateHabit(id, {
      name: name.trim(),
      category,
      target_time: parseTime(time),
    });
    setSaving(false);

    if (result) {
      router.back();
    }
  }

  function handleDelete() {
    Alert.alert("Delete habit", "This can't be undone. Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (demoSession) {
            router.dismissAll();
            return;
          }
          const ok = await deleteHabit(id!);
          if (ok) {
            router.dismissAll();
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top", "bottom"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!habit) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top", "bottom"]}>
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
          <AnimatedPress
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: radius.pill,
              backgroundColor: colors.bgRaised,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon icon={Cancel01Icon} size={20} color={colors.fg} />
          </AnimatedPress>
          <View style={{ alignItems: "center", paddingTop: spacing.xxl }}>
            <Typography variant="caption">Habit not found.</Typography>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xxxl,
          gap: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Row style={{ justifyContent: "space-between", paddingTop: spacing.sm }}>
          <AnimatedPress
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: radius.pill,
              backgroundColor: colors.bgRaised,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon icon={Cancel01Icon} size={20} color={colors.fg} />
          </AnimatedPress>
          <Typography variant="metaItalic">Edit habit</Typography>
          <AnimatedPress onPress={handleDelete}>
            <Icon icon={Delete02Icon} size={20} color={colors.danger} />
          </AnimatedPress>
        </Row>

        <View>
          <Stack gap={spacing.md} style={{ alignItems: "center", paddingVertical: spacing.lg }}>
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: radius.lg,
                backgroundColor: tintFor(accent),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon icon={ChosenIcon} size={52} color={accent} strokeWidth={1.6} />
            </View>
          </Stack>
        </View>

        <View>
          <Stack gap={spacing.sm}>
            <Typography variant="metaItalic" color={colors.fgFaint}>
              Name
            </Typography>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Morning walk"
              placeholderTextColor={colors.fgDim}
              style={{
                fontFamily: fonts.heading,
                fontSize: 26,
                color: colors.fg,
                paddingVertical: spacing.sm,
                borderBottomWidth: 2,
                borderBottomColor: colors.border,
              }}
            />
          </Stack>
        </View>

        <View>
          <Stack gap={spacing.md}>
            <Typography variant="metaItalic" color={colors.fgFaint}>
              Pick a symbol
            </Typography>
            <Row gap={spacing.sm} style={{ flexWrap: "wrap" }}>
              {HABIT_ICONS.map((opt, i) => {
                const selected = iconIdx === i;
                return (
                  <AnimatedPress
                    key={i}
                    onPress={() => setIconIdx(i)}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: radius.md,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: selected ? tintFor(accent) : colors.bgRaised,
                      borderWidth: selected ? 1.5 : 0,
                      borderColor: selected ? accent : "transparent",
                    }}
                  >
                    <Icon
                      icon={opt.icon}
                      size={26}
                      color={selected ? accent : colors.fgMuted}
                      strokeWidth={1.8}
                    />
                  </AnimatedPress>
                );
              })}
            </Row>
          </Stack>
        </View>

        <View>
          <Stack gap={spacing.md}>
            <Typography variant="metaItalic" color={colors.fgFaint}>
              Pick a mood
            </Typography>
            <Row gap={spacing.sm}>
              {ACCENT_OPTIONS.map((c) => {
                const selected = accent === c;
                return (
                  <AnimatedPress
                    key={c}
                    onPress={() => setAccent(c)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: radius.pill,
                      backgroundColor: c,
                      borderWidth: selected ? 3 : 0,
                      borderColor: colors.bg,
                      transform: [{ scale: selected ? 1.1 : 1 }],
                    }}
                  />
                );
              })}
            </Row>
          </Stack>
        </View>

        <View>
          <Stack gap={spacing.md}>
            <Row gap={spacing.xs}>
              <Icon icon={Clock01Icon} size={14} color={colors.fgFaint} strokeWidth={1.8} />
              <Typography variant="metaItalic" color={colors.fgFaint}>
                When in the day
              </Typography>
            </Row>
            <Row gap={spacing.sm} style={{ flexWrap: "wrap" }}>
              {TIME_SUGGESTIONS.map((t) => {
                const selected = time === t;
                return (
                  <AnimatedPress
                    key={t}
                    onPress={() => setTime(t)}
                    scale={0.95}
                    style={{
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderRadius: radius.pill,
                      backgroundColor: selected ? colors.fg : colors.bgRaised,
                    }}
                  >
                    <Typography
                      style={{
                        fontFamily: selected ? fonts.bodyBold : fonts.bodyMedium,
                        fontSize: 13,
                        color: selected ? colors.bg : colors.fgMuted,
                      }}
                    >
                      {t}
                    </Typography>
                  </AnimatedPress>
                );
              })}
            </Row>
          </Stack>
        </View>

        <View>
          <AnimatedPress
            onPress={handleSave}
            haptic="medium"
            scale={0.97}
            style={{
              marginTop: spacing.lg,
              paddingVertical: spacing.lg,
              borderRadius: radius.pill,
              backgroundColor: canSave && !saving ? colors.fg : colors.fgDim,
              alignItems: "center",
              justifyContent: "center",
              opacity: canSave && !saving ? 1 : 0.5,
            }}
          >
            <Typography
              color={colors.bg}
              style={{ fontFamily: fonts.bodyBold, fontSize: 16, letterSpacing: 0.3 }}
            >
              {saving ? "Saving..." : "Save changes"}
            </Typography>
          </AnimatedPress>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
