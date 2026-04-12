import { useCallback, useState } from "react";
import { Pressable, SectionList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { ArrowLeft02Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { AnimatedPress } from "@/components/animated-press";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icon";
import { Row } from "@/components/layout";
import { Typography } from "@/components/typography";
import { NOTIFICATIONS, type Notification, pickPhoto } from "@/lib/mock";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import { SafeAreaView } from "react-native-safe-area-context";

type Section = { title: string; data: Notification[] };

function bucketNotifications(items: Notification[]): Section[] {
  const today: Notification[] = [];
  const thisWeek: Notification[] = [];
  const thisMonth: Notification[] = [];

  for (const n of items) {
    const w = n.when;
    if (w.includes("m") && !w.includes("mo") || w.includes("h")) {
      today.push(n);
    } else if (w.includes("d") && parseInt(w) <= 7) {
      thisWeek.push(n);
    } else {
      thisMonth.push(n);
    }
  }

  const sections: Section[] = [];
  if (today.length) sections.push({ title: "Today", data: today });
  if (thisWeek.length) sections.push({ title: "This Week", data: thisWeek });
  if (thisMonth.length) sections.push({ title: "This Month", data: thisMonth });
  return sections;
}

export default function Notifications() {
  const router = useRouter();
  const [notifications] = useState(NOTIFICATIONS);
  const [followedIds, setFollowedIds] = useState<Record<string, boolean>>({});
  const sections = bucketNotifications(notifications);

  const toggleFollow = useCallback((id: string) => {
    setFollowedIds((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Notification }) => (
      <NotificationRow
        item={item}
        followed={Boolean(followedIds[item.id])}
        onToggleFollow={() => toggleFollow(item.id)}
      />
    ),
    [followedIds, toggleFollow],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => (
      <View style={styles.sectionHeader}>
        <Typography
          style={{ fontFamily: fonts.bodySemibold, fontSize: 15, lineHeight: 20, color: colors.fg }}
        >
          {section.title}
        </Typography>
      </View>
    ),
    [],
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <Row style={styles.header}>
        <AnimatedPress onPress={() => router.back()} hitSlop={12} scale={0.88}>
          <Icon icon={ArrowLeft02Icon} size={24} color={colors.fg} />
        </AnimatedPress>
        <Typography
          style={{ fontFamily: fonts.bodySemibold, fontSize: 17, lineHeight: 22, color: colors.fg, flex: 1, textAlign: "center" }}
        >
          Notifications
        </Typography>
        <View style={{ width: 24 }} />
      </Row>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

function NotificationRow({
  item,
  followed,
  onToggleFollow,
}: {
  item: Notification;
  followed: boolean;
  onToggleFollow: () => void;
}) {
  return (
    <Pressable
      style={[styles.notifRow, !item.read && styles.notifRowUnread]}
    >
      <Avatar color={item.color} letter={item.letter} size={44} ring={false} />
      <View style={styles.notifBody}>
        <Typography variant="body" numberOfLines={2}>
          <Typography style={{ fontFamily: fonts.bodySemibold, fontSize: 15, lineHeight: 22, color: colors.fg }}>
            {item.name}
          </Typography>
          {" "}
          {item.body}
        </Typography>
        <Typography variant="meta" style={{ color: colors.fgFaint, marginTop: 1 }}>
          {item.when}
        </Typography>
      </View>
      {item.photoIndex != null && (
        <Image
          source={pickPhoto(item.photoIndex)}
          style={styles.notifThumb}
        />
      )}
      {item.type === "follow" && (
        <AnimatedPress
          onPress={onToggleFollow}
          haptic="medium"
          scale={0.92}
          style={[
            styles.followBtn,
            followed
              ? { backgroundColor: colors.primary + "18", borderColor: colors.primary + "40" }
              : { backgroundColor: colors.fg, borderColor: colors.fg },
          ]}
        >
          {followed ? (
            <Row gap={4}>
              <Icon icon={Tick02Icon} size={14} color={colors.primary} strokeWidth={2.2} />
              <Typography
                style={{ fontFamily: fonts.bodySemibold, fontSize: 13, lineHeight: 16, color: colors.primary }}
              >
                Following
              </Typography>
            </Row>
          ) : (
            <Typography
              style={{ fontFamily: fonts.bodySemibold, fontSize: 13, lineHeight: 16, color: colors.bg }}
            >
              Follow
            </Typography>
          )}
        </AnimatedPress>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  notifRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  notifRowUnread: {
    backgroundColor: colors.primary + "0c",
  },
  notifBody: {
    flex: 1,
  },
  notifThumb: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
  },
  followBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: "center",
  },
});
