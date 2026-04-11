import { useState } from "react";
import { TextInput, View, ScrollView, Switch } from "react-native";
import { router } from "expo-router";
import { Cancel01Icon, LockPasswordIcon, GlobeIcon } from "@hugeicons/core-free-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Row, Stack } from "@/components/layout";
import { Typography } from "@/components/typography";
import { Icon } from "@/components/icon";
import { AnimatedPress } from "@/components/animated-press";
import { colors, fonts, radius, spacing, tintFor } from "@/lib/theme";
import { HABIT_ICONS, ACCENT_OPTIONS } from "@/lib/mock";

export default function CreateCircle() {
  const [name, setName] = useState("");
  const [habit, setHabit] = useState("");
  const [description, setDescription] = useState("");
  const [iconIdx, setIconIdx] = useState(0);
  const [accent, setAccent] = useState(ACCENT_OPTIONS[2]);
  const [isPrivate, setIsPrivate] = useState(false);

  const ChosenIcon = HABIT_ICONS[iconIdx].icon;

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
          <Typography variant="metaItalic">New circle</Typography>
          <View style={{ width: 40 }} />
        </Row>

        <View>
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
              <Icon icon={ChosenIcon} size={52} color={accent} strokeWidth={1.6} />
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
        </View>

        <View>
          <Stack gap={spacing.sm}>
            <Typography variant="metaItalic" color={colors.fgFaint}>
              Name
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
        </View>

        <View>
          <Stack gap={spacing.sm}>
            <Typography variant="metaItalic" color={colors.fgFaint}>
              The shared habit
            </Typography>
            <TextInput
              value={habit}
              onChangeText={setHabit}
              placeholder="Run 5 kilometers"
              placeholderTextColor={colors.fgDim}
              style={{
                fontFamily: fonts.body,
                fontSize: 17,
                color: colors.fg,
                paddingVertical: spacing.sm,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            />
          </Stack>
        </View>

        <View>
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
        </View>

        <View>
          <AnimatedPress
            onPress={() => router.back()}
            haptic="medium"
            scale={0.97}
            style={{
              marginTop: spacing.md,
              paddingVertical: spacing.lg,
              borderRadius: radius.pill,
              backgroundColor: colors.fg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              color={colors.bg}
              style={{ fontFamily: fonts.bodyBold, fontSize: 16, letterSpacing: 0.3 }}
            >
              Open the circle
            </Typography>
          </AnimatedPress>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
