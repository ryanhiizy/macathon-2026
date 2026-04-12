import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  SectionList,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { AnimatedPress } from "@/components/animated-press";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icon";
import { Row } from "@/components/layout";
import { Typography } from "@/components/typography";
import { CIRCLES, FRIENDS, type Friend, type CircleRow } from "@/lib/mock";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import { SafeAreaView } from "react-native-safe-area-context";

type SectionData =
  | { type: "person"; data: Friend }
  | { type: "circle"; data: CircleRow };

const FRIEND_THREAD_ID: Record<string, string> = {
  joel: "dm-joel",
  emily: "dm-emily",
  ryan: "dm-ryan",
  mu04: "dm4",
  mu05: "dm7",
  mu06: "dm8",
  mu07: "dm9",
};

const CIRCLE_THREAD_ID: Record<string, string> = {
  "1": "group-morning",
  "2": "group-team",
  "3": "group-morning",
  "4": "group-team",
};

export default function NewChat() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filteredFriends = useMemo(
    () =>
      FRIENDS.filter(
        (f) =>
          f.name.toLowerCase().includes(query.toLowerCase()) ||
          f.handle.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  const filteredCircles = useMemo(
    () =>
      CIRCLES.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.habit.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  const sections = useMemo(() => {
    const result: { title: string; data: SectionData[] }[] = [];
    if (filteredFriends.length > 0) {
      result.push({
        title: "People",
        data: filteredFriends.map((f) => ({ type: "person" as const, data: f })),
      });
    }
    if (filteredCircles.length > 0) {
      result.push({
        title: "Circles",
        data: filteredCircles.map((c) => ({ type: "circle" as const, data: c })),
      });
    }
    return result;
  }, [filteredFriends, filteredCircles]);

  const handleSelect = useCallback(
    (item: SectionData) => {
      if (item.type === "person") {
        const threadId = FRIEND_THREAD_ID[item.data.id] ?? `dm-${item.data.id}`;
        router.replace(`/chat/${threadId}`);
      } else {
        const threadId = CIRCLE_THREAD_ID[item.data.id] ?? `circle-${item.data.id}`;
        router.replace(`/chat/${threadId}`);
      }
    },
    [router],
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <Row style={styles.header}>
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
          New message
        </Typography>
        <View style={{ width: 24 }} />
      </Row>

      <View style={styles.searchBar}>
        <Icon icon={Search01Icon} size={18} color={colors.fgFaint} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search people or circles..."
          placeholderTextColor={colors.fgFaint}
          value={query}
          onChangeText={setQuery}
          autoFocus={false}
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) =>
          item.type === "person" ? `p-${item.data.id}` : `c-${item.data.id}`
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Typography
              style={{
                fontFamily: fonts.bodySemibold,
                fontSize: 13,
                lineHeight: 18,
                color: colors.fgMuted,
              }}
            >
              {section.title}
            </Typography>
          </View>
        )}
        renderItem={({ item }) =>
          item.type === "person" ? (
            <PersonRow person={item.data} onPress={() => handleSelect(item)} />
          ) : (
            <CircleRowItem circle={item.data} onPress={() => handleSelect(item)} />
          )
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

function PersonRow({ person, onPress }: { person: Friend; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <Avatar color={person.color} letter={person.letter} size={48} ring={false} />
      <View style={{ flex: 1 }}>
        <Typography
          style={{
            fontFamily: fonts.bodySemibold,
            fontSize: 15,
            lineHeight: 20,
            color: colors.fg,
          }}
        >
          {person.name}
        </Typography>
        <Typography variant="caption" style={{ color: colors.fgMuted }}>
          {person.handle}
        </Typography>
      </View>
    </Pressable>
  );
}

function CircleRowItem({
  circle,
  onPress,
}: {
  circle: CircleRow;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <View
        style={[
          styles.circleIcon,
          { backgroundColor: circle.accent + "22" },
        ]}
      >
        <Icon icon={circle.icon} size={22} color={circle.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Typography
          style={{
            fontFamily: fonts.bodySemibold,
            fontSize: 15,
            lineHeight: 20,
            color: colors.fg,
          }}
        >
          {circle.name}
        </Typography>
        <Typography variant="caption" style={{ color: colors.fgMuted }}>
          {circle.members} members · {circle.habit}
        </Typography>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.bgSunk,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    height: 42,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 20,
    color: colors.fg,
    paddingVertical: 0,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  circleIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
});
