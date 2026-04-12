import { useCallback } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft02Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { AnimatedPress } from "@/components/animated-press";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icon";
import { Row } from "@/components/layout";
import { Typography } from "@/components/typography";
import { type ChatThread } from "@/lib/mock";
import { useThreads } from "@/lib/messages";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Messages() {
  const router = useRouter();
  const { threads } = useThreads();

  const renderItem = useCallback(
    ({ item }: { item: ChatThread }) => (
      <ThreadRow item={item} onPress={() => router.push(`/chat/${item.id}`)} />
    ),
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
          Messages
        </Typography>
        <AnimatedPress onPress={() => router.push("/new-chat")} hitSlop={12} scale={0.88}>
          <Icon icon={Edit02Icon} size={22} color={colors.fg} />
        </AnimatedPress>
      </Row>

      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

function ThreadRow({ item, onPress }: { item: ChatThread; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.threadRow, pressed && { opacity: 0.7 }]}
    >
      <View>
        {item.isGroup && item.groupIcon ? (
          <View style={styles.groupIcon}>
            <Icon icon={item.groupIcon} size={24} color={item.color} />
          </View>
        ) : (
          <View>
            <Avatar color={item.color} letter={item.letter} size={52} ring={false} />
            {item.online && <View style={styles.onlineDot} />}
          </View>
        )}
      </View>

      <View style={styles.threadBody}>
        <Row style={{ justifyContent: "space-between" }}>
          <Typography
            style={{
              fontFamily: item.unread ? fonts.bodySemibold : fonts.body,
              fontSize: 15,
              lineHeight: 20,
              color: colors.fg,
              flex: 1,
            }}
            numberOfLines={1}
          >
            {item.name}
          </Typography>
          <Typography
            variant="meta"
            style={{ color: item.unread ? colors.fg : colors.fgFaint, marginLeft: spacing.sm }}
          >
            {item.when}
          </Typography>
        </Row>
        <Row style={{ marginTop: 2 }}>
          <Typography
            variant="caption"
            style={{
              flex: 1,
              color: item.unread ? colors.fg : colors.fgMuted,
              fontFamily: item.unread ? fonts.bodyMedium : fonts.body,
            }}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Typography>
          {item.unread && <View style={styles.unreadDot} />}
        </Row>
      </View>
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
  threadRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  threadBody: {
    flex: 1,
  },
  groupIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.bgSunk,
    alignItems: "center",
    justifyContent: "center",
  } as const,
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2.5,
    borderColor: colors.bg,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
  },
});
