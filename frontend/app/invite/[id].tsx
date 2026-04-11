import { useMemo, useState } from "react";
import { View, TextInput, ScrollView, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Cancel01Icon,
  Search01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { Row, Stack, Divider } from "@/components/layout";
import { Typography } from "@/components/typography";
import { Icon } from "@/components/icon";
import { AnimatedPress } from "@/components/animated-press";
import { Avatar, AvatarStack } from "@/components/avatar";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import { FRIENDS, HABITS } from "@/lib/mock";

export default function InviteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habit = HABITS.find((h) => h.id === id);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return FRIENDS;
    return FRIENDS.filter(
      (f) => f.name.toLowerCase().includes(q) || f.handle.toLowerCase().includes(q),
    );
  }, [query]);

  const toggle = (fid: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(fid)) next.delete(fid);
      else next.add(fid);
      return next;
    });
  };

  const selectedFriends = FRIENDS.filter((f) => selected.has(f.id));

  if (!habit) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top", "bottom"]}>
        <Stack gap={spacing.lg} style={{ flex: 1, padding: spacing.lg, justifyContent: "center", alignItems: "center" }}>
          <Typography
            style={{
              fontFamily: fonts.heading,
              fontSize: 24,
              lineHeight: 30,
              color: colors.fg,
              textAlign: "center",
            }}
          >
            Habit not found
          </Typography>
          <AnimatedPress onPress={() => router.back()} haptic={false}>
            <Typography variant="metaItalic">Back</Typography>
          </AnimatedPress>
        </Stack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top", "bottom"]}>
      <Stack gap={spacing.lg} style={{ flex: 1, padding: spacing.lg }}>
        <Row style={{ justifyContent: "space-between" }}>
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
          <Typography variant="metaItalic">Invite friends</Typography>
          <View style={{ width: 40 }} />
        </Row>

        <View>
          <Stack gap={spacing.xs} style={{ alignItems: "center" }}>
            <Typography
              style={{
                fontFamily: fonts.heading,
                fontSize: 16,
                lineHeight: 22,
                color: colors.fgMuted,
              }}
            >
              Prove together:
            </Typography>
            <Typography
              style={{
                fontFamily: fonts.heading,
                fontSize: 26,
                lineHeight: 32,
                color: colors.fg,
              }}
            >
              {habit.name}
            </Typography>
          </Stack>
        </View>

        <Row
          gap={spacing.sm}
          style={{
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: radius.pill,
            backgroundColor: colors.bgRaised,
          }}
        >
          <Icon icon={Search01Icon} size={18} color={colors.fgFaint} strokeWidth={1.8} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Find a friend"
            placeholderTextColor={colors.fgDim}
            style={{
              fontFamily: fonts.body,
              fontSize: 15,
              color: colors.fg,
              flex: 1,
            }}
          />
        </Row>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: spacing.xxxl }}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 && (
            <View>
              <Stack gap={spacing.xs} style={{ alignItems: "center", paddingVertical: spacing.xxxl }}>
                <Typography
                  style={{
                    fontFamily: fonts.heading,
                    fontSize: 20,
                    lineHeight: 26,
                    color: colors.fgMuted,
                  }}
                >
                  No one by that name — yet
                </Typography>
                <Typography variant="metaItalic" color={colors.fgFaint}>
                  Try a handle or first name
                </Typography>
              </Stack>
            </View>
          )}
          <Stack gap={0}>
            {filtered.map((friend, i) => {
              const isSelected = selected.has(friend.id);
              return (
                <View key={friend.id}>
                  <Pressable
                    onPress={() => toggle(friend.id)}
                    style={{
                      paddingVertical: spacing.md,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Row gap={spacing.md}>
                      <Avatar
                        color={friend.color}
                        letter={friend.letter}
                        size={44}
                        ring={false}
                      />
                      <Stack gap={2}>
                        <Typography variant="label">{friend.name}</Typography>
                        <Typography variant="metaItalic">{friend.handle}</Typography>
                      </Stack>
                    </Row>
                    <View
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 13,
                        backgroundColor: isSelected ? colors.primary : "transparent",
                        borderWidth: isSelected ? 0 : 1.5,
                        borderColor: colors.borderStrong,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isSelected && (
                        <Icon icon={Tick02Icon} size={16} color={colors.bg} strokeWidth={3} />
                      )}
                    </View>
                  </Pressable>
                  {i < filtered.length - 1 && <Divider />}
                </View>
              );
            })}
          </Stack>
        </ScrollView>

        {selected.size > 0 && (
          <View style={{ gap: spacing.md }}>
            <Row gap={spacing.sm} style={{ alignItems: "center", justifyContent: "center" }}>
              <AvatarStack
                avatars={[
                  { color: colors.primary, letter: "B" },
                  ...selectedFriends.map((f) => ({ color: f.color, letter: f.letter })),
                ]}
                size={28}
              />
              <Typography variant="metaItalic">
                You + {selected.size} friend{selected.size === 1 ? "" : "s"}
              </Typography>
            </Row>
            <AnimatedPress
              onPress={() => {
                router.replace(`/group-camera/${habit.id}`);
              }}
              haptic="medium"
              scale={0.97}
              style={{
                paddingVertical: spacing.lg,
                borderRadius: radius.pill,
                backgroundColor: colors.fg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                color={colors.bg}
                style={{ fontFamily: fonts.bodyBold, fontSize: 15, letterSpacing: 0.3 }}
              >
                Start group prove · {selected.size + 1} people
              </Typography>
            </AnimatedPress>
          </View>
        )}
      </Stack>
    </SafeAreaView>
  );
}
