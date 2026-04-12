import { useState, useEffect, useMemo } from "react";
import { TextInput, View, ScrollView, Switch, Pressable } from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft02Icon,
  LockPasswordIcon,
  GlobeIcon,
  Search01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Row, Stack } from "@/components/layout";
import { Typography } from "@/components/typography";
import { Icon } from "@/components/icon";
import { AnimatedPress } from "@/components/animated-press";
import { colors, fonts, radius, spacing, tintFor } from "@/lib/theme";
import { HABIT_ICONS, ACCENT_OPTIONS } from "@/lib/mock";
import { useAuth } from "@/lib/auth-context";
import { fetchHabits, type HabitView } from "@/lib/habits";
import { rememberCircleConfig } from "@/lib/circles";
import { supabase } from "@/lib/supabase";

export default function CreateCircle() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconIdx, setIconIdx] = useState(0);
  const [accent, setAccent] = useState(ACCENT_OPTIONS[2]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [saving, setSaving] = useState(false);

  // Habit search state
  const [habits, setHabits] = useState<HabitView[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<HabitView | null>(null);
  const [habitQuery, setHabitQuery] = useState("");
  const [showHabitDropdown, setShowHabitDropdown] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchHabits(user.id).then(setHabits);
  }, [user]);

  const filteredHabits = useMemo(() => {
    if (!habitQuery.trim()) return habits;
    const q = habitQuery.toLowerCase();
    return habits.filter((h) => h.name.toLowerCase().includes(q));
  }, [habits, habitQuery]);

  const chosenIcon = HABIT_ICONS[iconIdx].icon;
  const canSave = name.trim().length > 0 && selectedHabit !== null;

  function selectHabit(habit: HabitView) {
    setSelectedHabit(habit);
    setHabitQuery(habit.name);
    setShowHabitDropdown(false);
  }

  function clearHabit() {
    setSelectedHabit(null);
    setHabitQuery("");
    setShowHabitDropdown(true);
  }

  async function handleCreate() {
    if (!canSave || saving || !user) return;
    setSaving(true);

    const { data: circle, error } = await supabase
      .from("circles")
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        created_by: user.id,
        invite_code: `circle-${Date.now().toString(36)}`,
      })
      .select()
      .single();

    if (error || !circle) {
      console.warn("[create-circle] error:", error?.message);
      setSaving(false);
      return;
    }

    rememberCircleConfig(circle.id, {
      icon: chosenIcon,
      accent,
      habit: selectedHabit?.name ?? "Daily habit",
    });

    await supabase.from("circle_members").insert({
      circle_id: circle.id,
      user_id: user.id,
    });

    setSaving(false);
    router.back();
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
        keyboardShouldPersistTaps="handled"
      >
        {/* Header — matches Messages / Notifications */}
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
            New circle
          </Typography>
          <View style={{ width: 24 }} />
        </Row>

        {/* Hero */}
        <Stack gap={spacing.md} style={{ alignItems: "center", paddingVertical: spacing.md }}>
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
            <Icon icon={chosenIcon} size={52} color={accent} strokeWidth={1.6} />
          </View>
          <Typography
            style={{
              fontFamily: fonts.heading,
              fontSize: 18,
              lineHeight: 24,
              color: colors.fgMuted,
              textAlign: "center",
              paddingHorizontal: spacing.xl,
            }}
          >
            Gather friends around one habit
          </Typography>
        </Stack>

        {/* Circle name */}
        <Stack gap={spacing.sm}>
          <Typography variant="metaItalic" color={colors.fgFaint}>
            Circle name
          </Typography>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="5K every morning"
            placeholderTextColor={colors.fgDim}
            style={{
              fontFamily: fonts.heading,
              fontSize: 24,
              color: colors.fg,
              paddingVertical: spacing.sm,
              borderBottomWidth: 2,
              borderBottomColor: colors.border,
            }}
          />
        </Stack>

        {/* Habit search dropdown */}
        <Stack gap={spacing.sm}>
          <Typography variant="metaItalic" color={colors.fgFaint}>
            The shared habit
          </Typography>

          {selectedHabit ? (
            <AnimatedPress onPress={clearHabit} scale={0.98}>
              <Row
                gap={spacing.md}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.md,
                  borderRadius: radius.md,
                  backgroundColor: tintFor(selectedHabit.accent),
                  borderWidth: 1.5,
                  borderColor: selectedHabit.accent,
                  alignItems: "center",
                }}
              >
                <Icon
                  icon={selectedHabit.icon}
                  size={22}
                  color={selectedHabit.accent}
                  strokeWidth={1.8}
                />
                <View style={{ flex: 1 }}>
                  <Typography
                    style={{
                      fontFamily: fonts.bodySemibold,
                      fontSize: 16,
                      color: colors.fg,
                    }}
                  >
                    {selectedHabit.name}
                  </Typography>
                  <Typography variant="meta" color={colors.fgMuted}>
                    {selectedHabit.time} · {selectedHabit.streak} day streak
                  </Typography>
                </View>
                <Icon icon={Tick01Icon} size={20} color={selectedHabit.accent} />
              </Row>
            </AnimatedPress>
          ) : (
            <View>
              <Row
                gap={spacing.sm}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.md,
                  backgroundColor: colors.bgRaised,
                  borderWidth: showHabitDropdown ? 1.5 : 0,
                  borderColor: showHabitDropdown ? accent : "transparent",
                  alignItems: "center",
                }}
              >
                <Icon icon={Search01Icon} size={18} color={colors.fgDim} strokeWidth={1.8} />
                <TextInput
                  value={habitQuery}
                  onChangeText={(t) => {
                    setHabitQuery(t);
                    setShowHabitDropdown(true);
                  }}
                  onFocus={() => setShowHabitDropdown(true)}
                  placeholder="Search your habits…"
                  placeholderTextColor={colors.fgDim}
                  style={{
                    flex: 1,
                    fontFamily: fonts.body,
                    fontSize: 16,
                    color: colors.fg,
                    paddingVertical: spacing.xs,
                  }}
                />
              </Row>

              {showHabitDropdown && (
                <View
                  style={{
                    marginTop: spacing.xs,
                    borderRadius: radius.md,
                    backgroundColor: colors.bgRaised,
                    overflow: "hidden",
                    maxHeight: 240,
                  }}
                >
                  {filteredHabits.length === 0 ? (
                    <View style={{ padding: spacing.lg, alignItems: "center" }}>
                      <Typography variant="caption" color={colors.fgMuted}>
                        {habits.length === 0
                          ? "No habits yet — create one first"
                          : "No matches found"}
                      </Typography>
                    </View>
                  ) : (
                    <ScrollView
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}
                      style={{ maxHeight: 240 }}
                    >
                      {filteredHabits.map((h) => (
                        <Pressable
                          key={h.id}
                          onPress={() => selectHabit(h)}
                          style={({ pressed }) => ({
                            flexDirection: "row",
                            alignItems: "center",
                            gap: spacing.md,
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.md,
                            backgroundColor: pressed ? colors.uiHover : "transparent",
                            borderBottomWidth: 0.5,
                            borderBottomColor: colors.border,
                          })}
                        >
                          <View
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: radius.sm,
                              backgroundColor: tintFor(h.accent),
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Icon icon={h.icon} size={18} color={h.accent} strokeWidth={1.8} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Typography
                              style={{
                                fontFamily: fonts.bodySemibold,
                                fontSize: 15,
                                color: colors.fg,
                              }}
                            >
                              {h.name}
                            </Typography>
                            <Typography variant="meta" color={colors.fgMuted}>
                              {h.time} · {h.streak} day streak
                            </Typography>
                          </View>
                        </Pressable>
                      ))}
                    </ScrollView>
                  )}
                </View>
              )}
            </View>
          )}
        </Stack>

        {/* Description */}
        <Stack gap={spacing.sm}>
          <Typography variant="metaItalic" color={colors.fgFaint}>
            A few words about it
          </Typography>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="We lace up every morning, rain or shine…"
            placeholderTextColor={colors.fgDim}
            multiline
            style={{
              fontFamily: fonts.body,
              fontSize: 15,
              lineHeight: 22,
              color: colors.fg,
              paddingVertical: spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              minHeight: 72,
              textAlignVertical: "top",
            }}
          />
        </Stack>

        {/* Symbol picker */}
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

        {/* Mood picker */}
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

        {/* Privacy toggle */}
        <Row
          style={{
            justifyContent: "space-between",
            paddingVertical: spacing.md,
          }}
        >
          <Row gap={spacing.md}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: radius.pill,
                backgroundColor: colors.bgRaised,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                icon={isPrivate ? LockPasswordIcon : GlobeIcon}
                size={18}
                color={colors.fg}
                strokeWidth={1.8}
              />
            </View>
            <Stack gap={2}>
              <Typography variant="label">
                {isPrivate ? "Invite only" : "Discoverable"}
              </Typography>
              <Typography variant="metaItalic">
                {isPrivate
                  ? "Only people you invite can join"
                  : "Anyone in presence can find and join"}
              </Typography>
            </Stack>
          </Row>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            trackColor={{ false: colors.borderStrong, true: colors.primary }}
            thumbColor={colors.bg}
            ios_backgroundColor={colors.borderStrong}
          />
        </Row>

        {/* Create button */}
        <AnimatedPress
          onPress={handleCreate}
          haptic="medium"
          scale={0.97}
          style={{
            marginTop: spacing.md,
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
            {saving ? "Creating..." : "Open the circle"}
          </Typography>
        </AnimatedPress>
      </ScrollView>
    </SafeAreaView>
  );
}
