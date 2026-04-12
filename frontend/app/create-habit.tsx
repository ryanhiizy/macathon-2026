import { useState, useCallback } from "react";
import {
  TextInput,
  View,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft02Icon,
  Clock01Icon,
  Calendar03Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Row, Stack } from "@/components/layout";
import { Typography } from "@/components/typography";
import { Icon } from "@/components/icon";
import { AnimatedPress } from "@/components/animated-press";
import { colors, fonts, radius, spacing, tintFor } from "@/lib/theme";
import { HABIT_ICONS, ACCENT_OPTIONS } from "@/lib/mock";
import { createHabit } from "@/lib/habits";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

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

const WEEKDAYS = [
  { key: "mon", label: "M" },
  { key: "tue", label: "T" },
  { key: "wed", label: "W" },
  { key: "thu", label: "T" },
  { key: "fri", label: "F" },
  { key: "sat", label: "S" },
  { key: "sun", label: "S" },
];

type FrequencyOption = "every_day" | "weekdays" | "weekends" | "custom";

const FREQUENCY_OPTIONS: { key: FrequencyOption; label: string }[] = [
  { key: "every_day", label: "Every day" },
  { key: "weekdays", label: "Weekdays" },
  { key: "weekends", label: "Weekends" },
  { key: "custom", label: "Custom" },
];

function frequencyToDbValue(frequency: FrequencyOption, customDays: Set<string>): string {
  if (frequency === "every_day") return "daily";
  if (frequency === "weekdays") return "weekdays";
  if (frequency === "weekends") return "weekends";

  const orderedDays = WEEKDAYS.map((day) => day.key).filter((day) => customDays.has(day));
  return orderedDays.length > 0 ? `custom:${orderedDays.join(",")}` : "daily";
}

function formatDbTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

function formatTimeDisplay(hour: number, minute: number): string {
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${String(minute).padStart(2, "0")} ${ampm}`;
}

async function getOrCreateCircle(userId: string): Promise<string | null> {
  const personalInviteCode = `personal-${userId.slice(0, 8)}`;
  const { data: existingCircle } = await supabase
    .from("circles")
    .select("id")
    .eq("created_by", userId)
    .eq("invite_code", personalInviteCode)
    .maybeSingle();

  if (existingCircle?.id) {
    const { data: membership } = await supabase
      .from("circle_members")
      .select("circle_id")
      .eq("circle_id", existingCircle.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (!membership) {
      await supabase.from("circle_members").insert({
        circle_id: existingCircle.id,
        user_id: userId,
      });
    }

    return existingCircle.id;
  }

  const { data: circle, error } = await supabase
    .from("circles")
    .insert({
      name: "My Habits",
      created_by: userId,
      invite_code: personalInviteCode,
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
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [iconIdx, setIconIdx] = useState(0);
  const [accent, setAccent] = useState(ACCENT_OPTIONS[0]);
  const [saving, setSaving] = useState(false);

  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [frequency, setFrequency] = useState<FrequencyOption>("every_day");
  const [customDays, setCustomDays] = useState<Set<string>>(
    new Set(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
  );

  const ChosenIcon = HABIT_ICONS[iconIdx].icon;
  const canSave = name.trim().length > 0;

  const toggleDay = useCallback((day: string) => {
    setCustomDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }, []);

  const nudgeHour = (delta: number) => {
    setHour((h) => (h + delta + 24) % 24);
  };
  const nudgeMinute = (delta: number) => {
    setMinute((m) => {
      const next = m + delta;
      if (next >= 60) { nudgeHour(1); return 0; }
      if (next < 0) { nudgeHour(-1); return 55; }
      return next;
    });
  };

  async function handleCreate() {
    if (!canSave || saving || !user) return;
    setSaving(true);

    const circleId = await getOrCreateCircle(user.id);
    if (!circleId) {
      setSaving(false);
      return;
    }

    const category = ICON_TO_CATEGORY[HABIT_ICONS[iconIdx].label] ?? "morning";
    const result = await createHabit({
      name: name.trim(),
      category,
      verification_mode: "trust",
      target_time: formatDbTime(hour, minute),
      frequency: frequencyToDbValue(frequency, customDays),
      circle_id: circleId,
      user_id: user.id,
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
        <Row style={{ paddingTop: spacing.sm, gap: spacing.md }}>
          <AnimatedPress onPress={() => router.back()} hitSlop={12} scale={0.88}>
            <Icon icon={ArrowLeft02Icon} size={24} color={colors.fg} />
          </AnimatedPress>
          <Typography
            style={{
              fontFamily: fonts.bodySemibold,
              fontSize: 17,
              lineHeight: 22,
              color: colors.fg,
              flex: 1,
              textAlign: "center",
            }}
          >
            New habit
          </Typography>
          <View style={{ width: 24 }} />
        </Row>

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

        {/* Reminder time */}
        <Stack gap={spacing.md}>
          <Row gap={spacing.xs}>
            <Icon icon={Clock01Icon} size={14} color={colors.fgFaint} strokeWidth={1.8} />
            <Typography variant="metaItalic" color={colors.fgFaint}>
              Reminder time
            </Typography>
          </Row>

          <AnimatedPress
            onPress={() => setShowTimePicker((p) => !p)}
            scale={0.97}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              borderRadius: radius.md,
              backgroundColor: colors.bgRaised,
            }}
          >
            <Icon icon={Clock01Icon} size={20} color={accent} strokeWidth={1.8} />
            <Typography
              style={{
                fontFamily: fonts.heading,
                fontSize: 22,
                color: colors.fg,
                flex: 1,
              }}
            >
              {formatTimeDisplay(hour, minute)}
            </Typography>
            <Typography variant="meta" color={colors.fgFaint}>
              {showTimePicker ? "Tap to close" : "Tap to change"}
            </Typography>
          </AnimatedPress>

          {showTimePicker && (
            <View
              style={{
                backgroundColor: colors.bgRaised,
                borderRadius: radius.md,
                padding: spacing.lg,
              }}
            >
              <Row style={{ justifyContent: "center", alignItems: "center", gap: spacing.xxl }}>
                {/* Hour stepper */}
                <Stack gap={spacing.sm} style={{ alignItems: "center" }}>
                  <AnimatedPress onPress={() => nudgeHour(1)} hitSlop={8} scale={0.85}>
                    <Icon icon={ArrowUp01Icon} size={24} color={colors.fgMuted} />
                  </AnimatedPress>
                  <View
                    style={{
                      width: 64,
                      height: 56,
                      borderRadius: radius.sm,
                      backgroundColor: colors.bg,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      style={{
                        fontFamily: fonts.heading,
                        fontSize: 28,
                        color: colors.fg,
                      }}
                    >
                      {String(hour % 12 || 12).padStart(2, " ")}
                    </Typography>
                  </View>
                  <AnimatedPress onPress={() => nudgeHour(-1)} hitSlop={8} scale={0.85}>
                    <Icon icon={ArrowDown01Icon} size={24} color={colors.fgMuted} />
                  </AnimatedPress>
                  <Typography variant="meta" color={colors.fgFaint}>
                    Hour
                  </Typography>
                </Stack>

                <Typography
                  style={{
                    fontFamily: fonts.heading,
                    fontSize: 28,
                    color: colors.fgMuted,
                    marginBottom: 28,
                  }}
                >
                  :
                </Typography>

                {/* Minute stepper */}
                <Stack gap={spacing.sm} style={{ alignItems: "center" }}>
                  <AnimatedPress onPress={() => nudgeMinute(5)} hitSlop={8} scale={0.85}>
                    <Icon icon={ArrowUp01Icon} size={24} color={colors.fgMuted} />
                  </AnimatedPress>
                  <View
                    style={{
                      width: 64,
                      height: 56,
                      borderRadius: radius.sm,
                      backgroundColor: colors.bg,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      style={{
                        fontFamily: fonts.heading,
                        fontSize: 28,
                        color: colors.fg,
                      }}
                    >
                      {String(minute).padStart(2, "0")}
                    </Typography>
                  </View>
                  <AnimatedPress onPress={() => nudgeMinute(-5)} hitSlop={8} scale={0.85}>
                    <Icon icon={ArrowDown01Icon} size={24} color={colors.fgMuted} />
                  </AnimatedPress>
                  <Typography variant="meta" color={colors.fgFaint}>
                    Min
                  </Typography>
                </Stack>

                {/* AM/PM toggle */}
                <Stack gap={spacing.sm} style={{ alignItems: "center" }}>
                  <AnimatedPress
                    onPress={() => setHour((h) => (h + 12) % 24)}
                    hitSlop={8}
                    scale={0.85}
                  >
                    <Icon icon={ArrowUp01Icon} size={24} color={colors.fgMuted} />
                  </AnimatedPress>
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: radius.sm,
                      backgroundColor: colors.bg,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      style={{
                        fontFamily: fonts.bodySemibold,
                        fontSize: 18,
                        color: accent,
                      }}
                    >
                      {hour >= 12 ? "PM" : "AM"}
                    </Typography>
                  </View>
                  <AnimatedPress
                    onPress={() => setHour((h) => (h + 12) % 24)}
                    hitSlop={8}
                    scale={0.85}
                  >
                    <Icon icon={ArrowDown01Icon} size={24} color={colors.fgMuted} />
                  </AnimatedPress>
                  <Typography variant="meta" color={colors.fgFaint}>
                    {" "}
                  </Typography>
                </Stack>
              </Row>
            </View>
          )}
        </Stack>

        {/* Frequency */}
        <Stack gap={spacing.md}>
          <Row gap={spacing.xs}>
            <Icon icon={Calendar03Icon} size={14} color={colors.fgFaint} strokeWidth={1.8} />
            <Typography variant="metaItalic" color={colors.fgFaint}>
              How often
            </Typography>
          </Row>

          <Row gap={spacing.sm} style={{ flexWrap: "wrap" }}>
            {FREQUENCY_OPTIONS.map((opt) => {
              const selected = frequency === opt.key;
              return (
                <AnimatedPress
                  key={opt.key}
                  onPress={() => setFrequency(opt.key)}
                  scale={0.95}
                  style={{
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.sm + 2,
                    borderRadius: radius.pill,
                    backgroundColor: selected ? colors.fg : colors.bgRaised,
                  }}
                >
                  <Typography
                    style={{
                      fontFamily: selected ? fonts.bodyBold : fonts.bodyMedium,
                      fontSize: 14,
                      color: selected ? colors.bg : colors.fgMuted,
                    }}
                  >
                    {opt.label}
                  </Typography>
                </AnimatedPress>
              );
            })}
          </Row>

          {frequency === "custom" && (
            <Row gap={spacing.sm}>
              {WEEKDAYS.map((d, i) => {
                const selected = customDays.has(d.key);
                return (
                  <AnimatedPress
                    key={d.key + i}
                    onPress={() => toggleDay(d.key)}
                    scale={0.9}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: radius.pill,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: selected ? accent : colors.bgRaised,
                    }}
                  >
                    <Typography
                      style={{
                        fontFamily: fonts.bodySemibold,
                        fontSize: 13,
                        color: selected ? colors.bg : colors.fgMuted,
                      }}
                    >
                      {d.label}
                    </Typography>
                  </AnimatedPress>
                );
              })}
            </Row>
          )}
        </Stack>

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
      </ScrollView>
    </SafeAreaView>
  );
}
