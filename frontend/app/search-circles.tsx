import { useMemo, useRef, useState } from "react";
import {
  FlatList,
  ScrollView,
  TextInput,
  View,
  StyleSheet,
  type ListRenderItemInfo,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft02Icon,
  Search01Icon,
  UserGroup02Icon,
  Tick02Icon,
  FireIcon,
} from "@hugeicons/core-free-icons";
import { AnimatedPress } from "@/components/animated-press";
import { Icon } from "@/components/icon";
import { Row, Stack } from "@/components/layout";
import { Typography } from "@/components/typography";
import { colors, fonts, radius, spacing, tintFor } from "@/lib/theme";
import { DISCOVER_CIRCLES, type DiscoverCircle } from "@/lib/mock";

const FILTER_TAGS = ["All", "Trending", "Friends", "Fitness", "Mindfulness", "Creative"] as const;
type FilterTag = (typeof FILTER_TAGS)[number];

const TAG_MATCH: Record<FilterTag, (c: DiscoverCircle) => boolean> = {
  All: () => true,
  Trending: (c) => !!c.trending,
  Friends: (c) => c.friendsIn > 0,
  Fitness: (c) => c.tags.some((t) => ["fitness", "strength", "commute"].includes(t)),
  Mindfulness: (c) => c.tags.some((t) => ["mindfulness", "sleep", "health"].includes(t)),
  Creative: (c) => c.tags.some((t) => ["creative", "art", "music"].includes(t)),
};

export default function SearchCircles() {
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterTag>("All");
  const [joined, setJoined] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let list = DISCOVER_CIRCLES;
    if (filter !== "All") list = list.filter(TAG_MATCH[filter]);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.habit.toLowerCase().includes(q) ||
          c.tags.some((t) => t.includes(q)),
      );
    }
    return list;
  }, [query, filter]);

  const toggleJoin = (id: string) => {
    setJoined((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderItem = ({ item }: ListRenderItemInfo<DiscoverCircle>) => (
    <CircleCard circle={item} joined={joined.has(item.id)} onJoin={() => toggleJoin(item.id)} />
  );

  const header = (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pills}
        style={{ marginHorizontal: -spacing.lg, flexGrow: 0 }}
      >
        {FILTER_TAGS.map((tag) => {
          const active = filter === tag;
          return (
            <AnimatedPress
              key={tag}
              scale={0.95}
              haptic="light"
              onPress={() => setFilter(tag)}
              style={[styles.pill, active && styles.pillActive]}
            >
              <Typography
                style={{
                  fontFamily: active ? fonts.bodySemibold : fonts.body,
                  fontSize: 13,
                  lineHeight: 18,
                  color: active ? colors.bg : colors.fgMuted,
                }}
              >
                {tag}
              </Typography>
            </AnimatedPress>
          );
        })}
      </ScrollView>

      {filter === "All" && !query.trim() && (
        <>
          <View style={[styles.sectionHeader, { marginTop: spacing.sm }]}>
            <Typography
              style={{
                fontFamily: fonts.bodySemibold,
                fontSize: 14,
                lineHeight: 18,
                color: colors.fg,
              }}
            >
              Recommended for you
            </Typography>
          </View>

          {DISCOVER_CIRCLES.filter((c) => c.friendsIn >= 3)
            .slice(0, 3)
            .map((c) => (
              <CircleCard
                key={c.id}
                circle={c}
                joined={joined.has(c.id)}
                onJoin={() => toggleJoin(c.id)}
              />
            ))}

          <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
            <Row gap={spacing.xs}>
              <Typography
                style={{
                  fontFamily: fonts.bodySemibold,
                  fontSize: 14,
                  lineHeight: 18,
                  color: colors.fg,
                }}
              >
                Trending right now
              </Typography>
              <Icon icon={FireIcon} size={16} color={colors.orange} strokeWidth={1.8} />
            </Row>
          </View>
        </>
      )}
    </>
  );

  const empty = (
    <View style={styles.empty}>
      <Typography variant="bodyMuted" style={{ textAlign: "center" }}>
        No circles match &quot;{query}&quot;
      </Typography>
      <Typography variant="metaItalic" style={{ textAlign: "center", marginTop: 4 }}>
        Try a different search or browse the categories above
      </Typography>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <View style={styles.searchRow}>
        <AnimatedPress
          onPress={() => router.back()}
          style={styles.backBtn}
          scale={0.92}
          haptic="light"
        >
          <Icon icon={ArrowLeft02Icon} size={22} color={colors.fg} strokeWidth={1.8} />
        </AnimatedPress>
        <View style={styles.searchBar}>
          <Icon icon={Search01Icon} size={18} color={colors.fgFaint} strokeWidth={1.6} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search circles..."
            placeholderTextColor={colors.fgDim}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={styles.searchInput}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

function CircleCard({
  circle,
  joined,
  onJoin,
}: {
  circle: DiscoverCircle;
  joined: boolean;
  onJoin: () => void;
}) {
  return (
    <View style={styles.card}>
      <Row gap={spacing.md} style={{ alignItems: "flex-start" }}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: tintFor(circle.accent) },
          ]}
        >
          <Icon icon={circle.icon} size={26} color={circle.accent} strokeWidth={1.6} />
        </View>

        <View style={{ flex: 1 }}>
          <Row style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <Stack gap={2} style={{ flex: 1, marginRight: spacing.sm }}>
              <Typography
                style={{
                  fontFamily: fonts.heading,
                  fontSize: 17,
                  lineHeight: 22,
                  color: colors.fg,
                }}
                numberOfLines={1}
              >
                {circle.name}
              </Typography>
              <Typography variant="metaItalic" numberOfLines={1}>
                {circle.habit}
              </Typography>
            </Stack>

            <AnimatedPress
              onPress={onJoin}
              haptic="medium"
              scale={0.92}
              style={[
                styles.joinBtn,
                joined
                  ? { backgroundColor: circle.accent + "18", borderColor: circle.accent + "40" }
                  : { backgroundColor: colors.fg, borderColor: colors.fg },
              ]}
            >
              {joined ? (
                <Row gap={4}>
                  <Icon icon={Tick02Icon} size={14} color={circle.accent} strokeWidth={2.2} />
                  <Typography
                    style={{
                      fontFamily: fonts.bodySemibold,
                      fontSize: 12,
                      lineHeight: 16,
                      color: circle.accent,
                    }}
                  >
                    Joined
                  </Typography>
                </Row>
              ) : (
                <Typography
                  style={{
                    fontFamily: fonts.bodySemibold,
                    fontSize: 12,
                    lineHeight: 16,
                    color: colors.bg,
                  }}
                >
                  Join
                </Typography>
              )}
            </AnimatedPress>
          </Row>

          <Typography
            variant="caption"
            numberOfLines={2}
            style={{ marginTop: spacing.xs }}
          >
            {circle.description}
          </Typography>

          <Row gap={spacing.md} style={{ marginTop: spacing.sm }}>
            <Row gap={4}>
              <Icon icon={UserGroup02Icon} size={13} color={colors.fgFaint} strokeWidth={1.6} />
              <Typography
                style={{
                  fontFamily: fonts.body,
                  fontSize: 12,
                  lineHeight: 16,
                  color: colors.fgFaint,
                }}
              >
                {circle.members.toLocaleString()}
              </Typography>
            </Row>
            {circle.friendsIn > 0 && (
              <Typography
                style={{
                  fontFamily: fonts.body,
                  fontSize: 12,
                  lineHeight: 16,
                  color: colors.blue,
                }}
              >
                {circle.friendsIn} friend{circle.friendsIn !== 1 ? "s" : ""} here
              </Typography>
            )}
          </Row>
        </View>
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgRaised,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    height: 42,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.fg,
    paddingVertical: 0,
  },
  pills: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.bgRaised,
  },
  pillActive: {
    backgroundColor: colors.fg,
  },
  sectionHeader: {
    paddingBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 120,
  },
  card: {
    paddingVertical: spacing.lg,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  joinBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    paddingTop: spacing.huge,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
  },
});
