import { useState } from "react";
import { TextInput, View, ScrollView } from "react-native";
import { router } from "expo-router";
import { Cancel01Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Row, Stack } from "@/components/layout";
import { Typography } from "@/components/typography";
import { Icon } from "@/components/icon";
import { AnimatedPress } from "@/components/animated-press";
import { colors, fonts, radius, spacing, tintFor } from "@/lib/theme";
import { HABIT_ICONS, ACCENT_OPTIONS } from "@/lib/mock";
import { createHabit } from "@/lib/habits";
import { supabase, getTestUserId, ensureTestSession } from "@/lib/supabase";

const TIME_SUGGESTIONS = [
  "6:00 AM",
  "7:30 AM",
  "9:00 AM",
  "12:00 PM",
  "6:00 PM",
  "9:30 PM",
  "All day",
];

// Map icon labels to DB categories
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

// "7:30 AM" → "07:30:00", "All day" → "00:00:00"
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

async function getOrCreateCircle(): Promise<string | null> {
  const userId = getTestUserId();
  const { data: memberships } = await supabase
    .from("circle_members")
    .select("circle_id")
    .eq("user_id", userId)
    .limit(1);

  if (memberships && memberships.length > 0) {
    return memberships[0].circle_id;
  }

  const { data: circle, error } = await supabase
    .from("circles")
    .insert({
      name: "My Habits",
      created_by: userId,
      invite_code: `personal-${userId.slice(0, 8)}`,
    })
    .select()
    .single();

  if (error) {
    console.warn("[create-habit] create circle error:", error.message);
    return null;
  }

  await supabase.from("circle_members").insert({
    circle_id: circle.id,
    user_id: userId,
  });

  return circle.id;
}

export default function CreateHabit() {
  const [name, setName] = useState("");
  const [iconIdx, setIconIdx] = useState(0);
  const [accent, setAccent] = useState(ACCENT_OPTIONS[0]);
  const [time, setTime] = useState("7:30 AM");
  const [saving, setSaving] = useState(false);

  const ChosenIcon = HABIT_ICONS[iconIdx].icon;
  const canSave = name.trim().length > 0;

  async function handleCreate() {
    if (!canSave || saving) return;
    setSaving(true);

    await ensureTestSession();
    const circleId = await getOrCreateCircle();
    if (!circleId) {
      setSaving(false);
      return;
    }

    const category = ICON_TO_CATEGORY[HABIT_ICONS[iconIdx].label] ?? "morning";
    const result = await createHabit({
      name: name.trim(),
      category,
      verification_mode: "trust",
      target_time: parseTime(time),
      circle_id: circleId,
    });

    setSaving(false);
    if (result) {
      router.back();
    }
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
          <Typography variant="metaItalic">New habit</Typography>
          <View style={{ width: 40 }} />
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
            <Typography
              style={{
                fontFamily: fonts.heading,
                fontSize: 20,
                lineHeight: 26,
                color: colors.fgMuted,
              }}
            >
              What do you want to practice?
            </Typography>
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
            onPress={handleCreate}
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
              {saving ? "Creating..." : "Begin this habit"}
            </Typography>
          </AnimatedPress>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
