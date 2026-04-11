import { useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Cancel01Icon,
  SunriseIcon,
  DropletIcon,
  BookOpen01Icon,
  Yoga01Icon,
  Dumbbell01Icon,
  RunningShoesIcon,
  CookBookIcon,
  NaturalFoodIcon,
  CheckmarkCircle02Icon,
  CameraAiIcon,
  CheckmarkBadge01Icon,
} from "@hugeicons/core-free-icons";
import { Typography, Eyebrow } from "@/components/typography";
import { Icon } from "@/components/icon";
import { Row, Stack } from "@/components/layout";
import { colors, radius, spacing, fonts } from "@/lib/theme";
import { createHabit } from "@/lib/habits";
import { supabase, getTestUserId } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Category options
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { key: "gym", label: "Gym", icon: Dumbbell01Icon, accent: colors.orange },
  { key: "running", label: "Running", icon: RunningShoesIcon, accent: colors.green },
  { key: "cooking", label: "Cooking", icon: CookBookIcon, accent: colors.red },
  { key: "meal_prep", label: "Meal Prep", icon: NaturalFoodIcon, accent: colors.yellow },
  { key: "reading", label: "Reading", icon: BookOpen01Icon, accent: colors.blue },
  { key: "meditation", label: "Meditate", icon: Yoga01Icon, accent: colors.purple },
  { key: "water", label: "Water", icon: DropletIcon, accent: colors.cyan },
  { key: "morning", label: "Morning", icon: SunriseIcon, accent: colors.orange },
] as const;

// ---------------------------------------------------------------------------
// Time presets
// ---------------------------------------------------------------------------

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = ["00", "15", "30", "45"];

export default function NewHabit() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("gym");
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState("00");
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");
  const [verificationMode, setVerificationMode] = useState<"verifiable" | "trust">("verifiable");
  const [saving, setSaving] = useState(false);

  const canSave = name.trim().length > 0;

  async function handleSave() {
    if (!canSave || saving) return;
    setSaving(true);

    // Convert to 24h format for DB
    let h24 = hour;
    if (ampm === "PM" && hour !== 12) h24 += 12;
    if (ampm === "AM" && hour === 12) h24 = 0;
    const targetTime = `${String(h24).padStart(2, "0")}:${minute}:00`;

    // Get the user's first circle (or create one)
    const circleId = await getOrCreateCircle();
    if (!circleId) {
      setSaving(false);
      return;
    }

    const result = await createHabit({
      name: name.trim(),
      category,
      verification_mode: verificationMode,
      target_time: targetTime,
      circle_id: circleId,
    });

    setSaving(false);
    if (result) {
      router.back();
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <Row style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Icon icon={Cancel01Icon} size={24} color={colors.fg} />
          </Pressable>
          <Typography style={{ fontFamily: fonts.heading, fontSize: 20 }}>
            New habit
          </Typography>
          <View style={{ width: 24 }} />
        </Row>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name */}
          <Stack gap={spacing.sm}>
            <Eyebrow>Name</Eyebrow>
            <TextInput
              style={styles.input}
              placeholder="e.g. Morning walk"
              placeholderTextColor={colors.fgDim}
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="done"
            />
          </Stack>

          {/* Category */}
          <Stack gap={spacing.sm}>
            <Eyebrow>Category</Eyebrow>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const selected = category === cat.key;
                return (
                  <Pressable
                    key={cat.key}
                    onPress={() => setCategory(cat.key)}
                    style={[
                      styles.categoryChip,
                      selected && { backgroundColor: cat.accent + "1A", borderColor: cat.accent },
                    ]}
                  >
                    <Icon icon={cat.icon} size={22} color={selected ? cat.accent : colors.fgMuted} />
                    <Typography
                      variant="caption"
                      color={selected ? cat.accent : colors.fgMuted}
                      style={{ fontFamily: selected ? fonts.bodySemibold : fonts.body }}
                    >
                      {cat.label}
                    </Typography>
                  </Pressable>
                );
              })}
            </View>
          </Stack>

          {/* Time */}
          <Stack gap={spacing.sm}>
            <Eyebrow>Reminder time</Eyebrow>

            {/* Hour row */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Row gap={spacing.sm}>
                {HOURS.map((h) => (
                  <Pressable
                    key={h}
                    onPress={() => setHour(h)}
                    style={[
                      styles.timePill,
                      hour === h && styles.timePillActive,
                    ]}
                  >
                    <Typography
                      variant="label"
                      color={hour === h ? colors.onPrimary : colors.fg}
                    >
                      {h}
                    </Typography>
                  </Pressable>
                ))}
              </Row>
            </ScrollView>

            {/* Minute + AM/PM row */}
            <Row gap={spacing.sm}>
              {MINUTES.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setMinute(m)}
                  style={[
                    styles.timePill,
                    minute === m && styles.timePillActive,
                  ]}
                >
                  <Typography
                    variant="label"
                    color={minute === m ? colors.onPrimary : colors.fg}
                  >
                    :{m}
                  </Typography>
                </Pressable>
              ))}

              <View style={{ width: spacing.sm }} />

              {(["AM", "PM"] as const).map((v) => (
                <Pressable
                  key={v}
                  onPress={() => setAmpm(v)}
                  style={[
                    styles.timePill,
                    ampm === v && styles.timePillActive,
                  ]}
                >
                  <Typography
                    variant="label"
                    color={ampm === v ? colors.onPrimary : colors.fg}
                  >
                    {v}
                  </Typography>
                </Pressable>
              ))}
            </Row>

            <Typography variant="caption" style={{ marginTop: spacing.xs }}>
              You&apos;ll be reminded at {hour}:{minute} {ampm}
            </Typography>
          </Stack>

          {/* Verification mode */}
          <Stack gap={spacing.sm}>
            <Eyebrow>Verification</Eyebrow>
            <Row gap={spacing.md}>
              <Pressable
                onPress={() => setVerificationMode("verifiable")}
                style={[
                  styles.verifyCard,
                  verificationMode === "verifiable" && {
                    borderColor: colors.primary,
                    backgroundColor: colors.primary + "0D",
                  },
                ]}
              >
                <Icon
                  icon={CameraAiIcon}
                  size={24}
                  color={verificationMode === "verifiable" ? colors.primary : colors.fgMuted}
                />
                <Typography
                  variant="label"
                  color={verificationMode === "verifiable" ? colors.primary : colors.fg}
                >
                  AI Verified
                </Typography>
                <Typography variant="caption">
                  Photo checked by AI
                </Typography>
              </Pressable>

              <Pressable
                onPress={() => setVerificationMode("trust")}
                style={[
                  styles.verifyCard,
                  verificationMode === "trust" && {
                    borderColor: colors.green,
                    backgroundColor: colors.green + "0D",
                  },
                ]}
              >
                <Icon
                  icon={CheckmarkBadge01Icon}
                  size={24}
                  color={verificationMode === "trust" ? colors.green : colors.fgMuted}
                />
                <Typography
                  variant="label"
                  color={verificationMode === "trust" ? colors.green : colors.fg}
                >
                  Trust
                </Typography>
                <Typography variant="caption">
                  Photo ritual only
                </Typography>
              </Pressable>
            </Row>
          </Stack>
        </ScrollView>

        {/* Save button */}
        <View style={styles.footer}>
          <Pressable
            onPress={handleSave}
            disabled={!canSave || saving}
            style={[
              styles.saveButton,
              (!canSave || saving) && { opacity: 0.4 },
            ]}
          >
            <Icon icon={CheckmarkCircle02Icon} size={20} color={colors.onPrimary} />
            <Typography
              color={colors.onPrimary}
              style={{ fontFamily: fonts.bodyBold, fontSize: 16 }}
            >
              {saving ? "Creating..." : "Create habit"}
            </Typography>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Helper: get user's first circle, or create a personal one
// ---------------------------------------------------------------------------

async function getOrCreateCircle(): Promise<string | null> {
  const userId = getTestUserId();

  // Try to find an existing circle
  const { data: memberships } = await supabase
    .from("circle_members")
    .select("circle_id")
    .eq("user_id", userId)
    .limit(1);

  if (memberships && memberships.length > 0) {
    return memberships[0].circle_id;
  }

  // Create a personal circle
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
    console.warn("[habits/new] create circle error:", error.message);
    return null;
  }

  // Add self as member
  await supabase.from("circle_members").insert({
    circle_id: circle.id,
    user_id: userId,
  });

  return circle.id;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scroll: {
    padding: spacing.lg,
    gap: spacing.xl,
    paddingBottom: 120,
  },
  input: {
    backgroundColor: colors.bgRaised,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.fg,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  categoryChip: {
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgRaised,
    width: "22.5%",
    minWidth: 72,
  },
  timePill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  timePillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  verifyCard: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgRaised,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
});
