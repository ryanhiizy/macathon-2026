import { useState } from "react";
import { ScrollView, Share, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import {
  ArrowLeft02Icon,
  Share01Icon,
  Crown02Icon,
  Medal01Icon,
  Award01Icon,
  Comment01Icon,
} from "@hugeicons/core-free-icons";
import { Screen, Row, Stack, Divider } from "@/components/layout";
import { Typography } from "@/components/typography";
import { Icon } from "@/components/icon";
import { Segmented } from "@/components/segmented";
import { SwipeableTabs } from "@/components/swipeable-tabs";
import { Avatar } from "@/components/avatar";
import { StreakFlame } from "@/components/streak-flame";
import { AnimatedPress } from "@/components/animated-press";
import { CommentsSheet } from "@/components/comments-sheet";
import { LikeButton } from "@/components/like-button";
import { PhotoCarousel } from "@/components/photo-carousel";
import { colors, fonts, palette, radius, spacing, tintFor } from "@/lib/theme";
import { CIRCLES, CIRCLE_MEMBERS, COMMENTS } from "@/lib/mock";
import type { HugeiconsProps } from "@hugeicons/react-native";

const TABS = ["Feed", "Leaderboard", "About"];

export default function CircleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const circle = CIRCLES.find((c) => c.id === id) ?? CIRCLES[0];
  const [tab, setTab] = useState(0);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const backX = useSharedValue(0);

  const pageStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: backX.value }],
  }));

  const paneScroll = {
    contentContainerStyle: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: 120,
    },
    showsVerticalScrollIndicator: false,
  } as const;

  return (
    <Animated.View style={[{ flex: 1, backgroundColor: colors.bg }, pageStyle]}>
      <Screen scroll={false}>
        <View style={styles.header}>
          <Row style={{ justifyContent: "space-between" }}>
            <AnimatedPress
              onPress={() => router.back()}
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.pill,
                backgroundColor: colors.bgRaised,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon icon={ArrowLeft02Icon} size={22} color={colors.fg} strokeWidth={1.8} />
            </AnimatedPress>
            <AnimatedPress
              onPress={() =>
                Share.share({
                  message: `Join my circle "${circle.name}" on presence! 🔥`,
                })
              }
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.pill,
                backgroundColor: colors.bgRaised,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon icon={Share01Icon} size={20} color={colors.fg} strokeWidth={1.8} />
            </AnimatedPress>
          </Row>

          <Stack gap={spacing.md} style={{ alignItems: "center", paddingVertical: spacing.sm }}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: radius.lg,
                backgroundColor: tintFor(circle.accent),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon icon={circle.icon} size={44} color={circle.accent} strokeWidth={1.6} />
            </View>
            <View style={{ alignItems: "center", gap: spacing.xs }}>
              <Typography
                style={{
                  fontFamily: fonts.heading,
                  fontSize: 28,
                  lineHeight: 34,
                  color: colors.fg,
                  textAlign: "center",
                }}
              >
                {circle.name}
              </Typography>
              <Typography variant="metaItalic">
                {circle.members} members · {circle.habit}
              </Typography>
            </View>
          </Stack>

          <Segmented options={TABS} value={tab} onChange={setTab} />
        </View>

        <SwipeableTabs
          value={tab}
          onChange={setTab}
          backTranslateX={backX}
          onSwipeBack={() => router.back()}
        >
          {[
            <ScrollView key="feed" {...paneScroll}>
              <FeedTab onComment={setCommentPostId} />
            </ScrollView>,
            <ScrollView key="leaderboard" {...paneScroll}>
              <LeaderboardTab accent={circle.accent} />
            </ScrollView>,
            <ScrollView key="about" {...paneScroll}>
              <AboutTab description={circle.description} />
            </ScrollView>,
          ]}
        </SwipeableTabs>
        <CommentsSheet postId={commentPostId} onClose={() => setCommentPostId(null)} />
      </Screen>
    </Animated.View>
  );
}

function FeedTab({ onComment }: { onComment: (id: string) => void }) {
  const items = [
    {
      id: "p1",
      name: "Sarah K.",
      letter: "S",
      color: colors.blue,
      when: "1h",
      streak: 47,
      photos: [0],
      caption: "Sun still low. The kind of morning that feels like a secret.",
    },
    {
      id: "p2",
      name: "Theo Vinci",
      letter: "T",
      color: colors.orange,
      when: "3h",
      streak: 11,
      photos: [3, 2],
      caption: "Brutal today. Legs felt like wet noodles but showed up anyway.",
    },
  ];
  return (
    <Stack gap={spacing.xxl}>
      {items.map((post, i) => (
        <Stack key={post.id} gap={spacing.md}>
          <Row style={{ justifyContent: "space-between" }}>
            <Row gap={spacing.md}>
              <Avatar color={post.color} letter={post.letter} size={40} ring={false} />
              <Stack gap={2}>
                <Typography variant="label">{post.name}</Typography>
                <Typography variant="metaItalic">{post.when} ago</Typography>
              </Stack>
            </Row>
            <StreakFlame days={post.streak} />
          </Row>
          <Typography variant="body">{post.caption}</Typography>
          <PhotoCarousel photoIdxs={post.photos} />
          <Row gap={spacing.xl}>
            <LikeButton initialCount={12 + i * 4} />
            <AnimatedPress
              onPress={() => onComment(post.id)}
              style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}
              scale={0.9}
              haptic={false}
            >
              <Icon icon={Comment01Icon} size={18} color={colors.fg} strokeWidth={1.7} />
              <Typography variant="meta" color={colors.fg}>
                {COMMENTS[post.id]?.length ?? 0}
              </Typography>
            </AnimatedPress>
          </Row>
        </Stack>
      ))}
    </Stack>
  );
}

function LeaderboardTab({ accent }: { accent: string }) {
  const ranks: HugeiconsProps["icon"][] = [Crown02Icon, Medal01Icon, Award01Icon];
  const rankColors = [colors.yellow, palette.base500, colors.orange] as string[];
  return (
    <Stack gap={spacing.lg}>
      <Stack gap={0}>
        {CIRCLE_MEMBERS.map((m, i) => {
          const rank = i + 1;
          const isYou = m.name === "You";
          return (
            <View key={m.id}>
              <View
                style={{
                  backgroundColor: isYou ? accent + "18" : "transparent",
                  ...(isYou && {
                    marginHorizontal: -spacing.lg,
                    paddingHorizontal: spacing.lg,
                  }),
                }}
              >
                <Row gap={spacing.md} style={{ paddingVertical: spacing.md }}>
                  <View style={{ width: 32, alignItems: "center" }}>
                    {rank <= 3 ? (
                      <Icon
                        icon={ranks[rank - 1]}
                        size={22}
                        color={rankColors[rank - 1]}
                        strokeWidth={1.8}
                      />
                    ) : (
                      <Typography
                        style={{
                          fontFamily: fonts.heading,
                          fontSize: 16,
                          color: colors.fgFaint,
                        }}
                      >
                        {rank}
                      </Typography>
                    )}
                  </View>
                  <Avatar color={m.color} letter={m.letter} size={40} ring={false} />
                  <Stack gap={0} style={{ flex: 1 }}>
                    <Typography
                      style={{
                        fontFamily: isYou ? fonts.bodyBold : fonts.bodySemibold,
                        fontSize: 15,
                        color: colors.fg,
                      }}
                    >
                      {m.name}
                    </Typography>
                    <Typography variant="metaItalic">
                      {m.handle}
                    </Typography>
                  </Stack>
                  <StreakFlame days={m.streak} />
                </Row>
              </View>
              {i < CIRCLE_MEMBERS.length - 1 && <Divider />}
            </View>
          );
        })}
      </Stack>
    </Stack>
  );
}

function AboutTab({ description }: { description: string }) {
  return (
    <Stack gap={spacing.xl}>
      <Stack gap={spacing.sm}>
        <Typography variant="metaItalic" color={colors.fgFaint}>
          Description
        </Typography>
        <Typography variant="lede">{description}</Typography>
      </Stack>

      <Stack gap={spacing.sm}>
        <Typography variant="metaItalic" color={colors.fgFaint}>
          Members
        </Typography>
        <Stack gap={0}>
          {CIRCLE_MEMBERS.map((m, i) => (
            <View key={m.id}>
              <Row
                gap={spacing.md}
                style={{
                  paddingVertical: spacing.md,
                  justifyContent: "space-between",
                }}
              >
                <Row gap={spacing.md}>
                  <Avatar color={m.color} letter={m.letter} size={40} ring={false} />
                  <Stack gap={2}>
                    <Typography variant="label">{m.name}</Typography>
                    <Typography variant="metaItalic">{m.handle}</Typography>
                  </Stack>
                </Row>
                <StreakFlame days={m.streak} />
              </Row>
              {i < CIRCLE_MEMBERS.length - 1 && <Divider />}
            </View>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.md,
    position: "relative",
    backgroundColor: colors.bg,
    zIndex: 1,
  },
});
