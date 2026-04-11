import { useState } from "react";
import { TextInput, View, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Camera01Icon } from "@hugeicons/core-free-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Row, Stack } from "@/components/layout";
import { Typography } from "@/components/typography";
import { Icon } from "@/components/icon";
import { Avatar } from "@/components/avatar";
import { AnimatedPress } from "@/components/animated-press";
import { colors, fonts, radius, spacing } from "@/lib/theme";

export default function EditProfile() {
  const [name, setName] = useState("Budi Hartono");
  const [username, setUsername] = useState("budi");
  const [bio, setBio] = useState(
    "Stacking small habits into something bigger. Currently chasing 100 days of morning walks."
  );
  const [link, setLink] = useState("");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top", "bottom"]}>
      <Row style={{ justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md }}>
        <AnimatedPress onPress={() => router.back()}>
          <Typography style={{ fontFamily: fonts.body, fontSize: 16, color: colors.fg }}>
            Cancel
          </Typography>
        </AnimatedPress>
        <Typography variant="label">Edit profile</Typography>
        <AnimatedPress
          onPress={() => router.back()}
          haptic="medium"
        >
          <Typography style={{ fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.primary }}>
            Done
          </Typography>
        </AnimatedPress>
      </Row>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.xl }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "center", paddingTop: spacing.lg, gap: spacing.md }}>
          <View>
            <Avatar color={colors.primary} letter="B" size={96} ring={false} />
            <View style={s.cameraBadge}>
              <Icon icon={Camera01Icon} size={14} color={colors.onPrimary} />
            </View>
          </View>
          <AnimatedPress haptic="light">
            <Typography style={{ fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.primary }}>
              Change photo
            </Typography>
          </AnimatedPress>
        </View>

        <Stack gap={spacing.xl}>
          <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />
          <Field label="Username" value={username} onChangeText={setUsername} placeholder="username" prefix="@" />
          <Field
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell people about yourself"
            multiline
            maxLength={150}
          />
          <Field label="Link" value={link} onChangeText={setLink} placeholder="Add a link" autoCapitalize="none" keyboardType="url" />
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  maxLength,
  prefix,
  autoCapitalize,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
  maxLength?: number;
  prefix?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "url" | "email-address";
}) {
  return (
    <View style={s.fieldRow}>
      <Typography variant="label" style={{ width: 90 }}>{label}</Typography>
      <View style={s.fieldInputWrap}>
        {prefix && (
          <Typography style={{ fontFamily: fonts.body, fontSize: 15, color: colors.fgDim }}>
            {prefix}
          </Typography>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.fgDim}
          multiline={multiline}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          style={[
            s.fieldInput,
            multiline && { minHeight: 60, textAlignVertical: "top" },
          ]}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.fg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.bg,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
  },
  fieldInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 2,
  },
  fieldInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.fg,
    padding: 0,
  },
});
