import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Share, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
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
import { resolveCircleDetailScreenState } from "@/lib/circle-screen-state";
import { colors, fonts, palette, radius, spacing, tintFor } from "@/lib/theme";
import {
  fetchCircle,
  fetchCircleMembers,
  fetchCircleSnaps,
  getMockCircleLeaderboard,
  type CircleView,
  type CircleMemberView,
  type CircleSnapView,
} from "@/lib/circles";
import { useAuth } from "@/lib/auth-context";
import type { HugeiconsProps } from "@hugeicons/react-native";

function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/(tabs)/circles");
  }
}

const TABS = ["Feed", "Leaderboard", "About"];

export default function CircleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [circle, setCircle] = useState<CircleView | null>(null);
  const [members, setMembers] = useState<CircleMemberView[]>([]);
  const [snaps, setSnaps] = useState<CircleSnapView[]>([]);
  const [loading, setLoading] = useState(true);
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
      paddingBottom: 24,
    },
    showsVerticalScrollIndicator: false,
  } as const;

  const load = useCallback(async () => {
    setLoading(true);

    if (!id) {
      setCircle(null);
      setMembers([]);
      setSnaps([]);
      setLoading(false);
      return;
    }

    const [c, m, s] = await Promise.all([
      fetchCircle(id),
      fetchCircleMembers(id),
      fetchCircleSnaps(id),
    ]);
    setCircle(c);
    setMembers(m);
    setSnaps(s);
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const leaderboardMembers = useMemo(
    () => (id ? getMockCircleLeaderboard(String(id), user?.id) : []),
    [id, user?.id],
  );

  const screenState = resolveCircleDetailScreenState({
    loading,
    hasCircle: Boolean(circle),
  });

  if (screenState === "loading") {
    return (
      <Screen>
        <Row style={{ justifyContent: "space-between" }}>
          <AnimatedPress
            onPress={goBack}
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
          <View style={{ width: 44 }} />
        </Row>
        <View style={{ paddingTop: spacing.xxl, alignItems: "center" }}>
          <ActivityIndicator color={colors.fgFaint} />
        </View>
      </Screen>
    );
  }

  if (!circle) {
    return (
      <Screen>
        <Row style={{ justifyContent: "space-between" }}>
          <AnimatedPress
            onPress={goBack}
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
          <View style={{ width: 44 }} />
        </Row>
        <Stack gap={spacing.sm} style={{ paddingTop: spacing.xxl, alignItems: "center" }}>
          <Typography
            style={{
              fontFamily: fonts.heading,
              fontSize: 24,
              lineHeight: 30,
              color: colors.fg,
              textAlign: "center",
            }}
          >
            Circle not found
          </Typography>
          <Typography
            variant="metaItalic"
            color={colors.fgFaint}
            style={{ textAlign: "center", maxWidth: 280 }}
          >
            This circle link is unavailable or no longer exists.
          </Typography>
        </Stack>
      </Screen>
    );
  }

  return (
    <Animated.View style={[{ flex: 1, backgroundColor: colors.bg }, pageStyle]}>
      <Screen scroll={false}>
        <View style={styles.header}>
          <Row style={{ justifyContent: "space-between" }}>
            <AnimatedPress
              onPress={goBack}
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
                  message: `Join my circle "${circle.name}" on presence!`,
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

          <Row gap={spacing.md} style={{ alignItems: "center", paddingVertical: spacing.sm }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: radius.md,
                backgroundColor: tintFor(circle.accent),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon icon={circle.icon} size={28} color={circle.accent} strokeWidth={1.6} />
            </View>
            <View style={{ gap: 2, flex: 1 }}>
              <Typography
                style={{
                  fontFamily: fonts.heading,
                  fontSize: 22,
                  lineHeight: 28,
                  color: colors.fg,
                }}
              >
                {circle.name}
              </Typography>
              <Typography variant="metaItalic">
                {circle.members} members · {circle.memberLabel}
              </Typography>
              <Typography variant="metaItalic" color={colors.fgFaint}>
                {circle.habit.charAt(0).toUpperCase() + circle.habit.slice(1)}
              </Typography>
            </View>
          </Row>

          <Segmented options={TABS} value={tab} onChange={setTab} />
        </View>

        <SwipeableTabs
          value={tab}
          onChange={setTab}
          backTranslateX={backX}
          onSwipeBack={goBack}
        >
          {[
            <ScrollView key="feed" {...paneScroll}>
              <FeedTab snaps={snaps} onComment={setCommentPostId} />
            </ScrollView>,
            <ScrollView key="leaderboard" {...paneScroll}>
              <LeaderboardTab accent={circle.accent} members={leaderboardMembers} userId={user?.id} />
            </ScrollView>,
            <ScrollView key="about" {...paneScroll}>
              <AboutTab
                description={circle.description ?? ""}
                about={circle.about}
                members={members}
                userId={user?.id}
              />
            </ScrollView>,
          ]}
        </SwipeableTabs>
        <CommentsSheet postId={commentPostId} onClose={() => setCommentPostId(null)} />
      </Screen>
    </Animated.View>
  );
}

function FeedTab({ snaps, onComment }: { snaps: CircleSnapView[]; onComment: (id: string) => void }) {
  if (snaps.length === 0) {
    return (
      <View style={{ paddingTop: spacing.xxl, alignItems: "center" }}>
        <Typography variant="metaItalic" color={colors.fgFaint}>
          No posts yet — be the first to share.
        </Typography>
      </View>
    );
  }

  return (
    <Stack gap={spacing.xxl}>
      {snaps.map((snap) => (
        <Stack key={snap.id} gap={spacing.md}>
          <Row style={{ justifyContent: "space-between" }}>
            <Row gap={spacing.md}>
              <Avatar color={snap.color} letter={snap.letter} size={40} ring={false} />
              <View>
                <Typography variant="label">{snap.name}</Typography>
                <Typography variant="metaItalic">{snap.when}</Typography>
              </View>
            </Row>
            <StreakFlame days={snap.streak} />
          </Row>

          {snap.promptText ? (
            <Typography
              variant="metaItalic"
              color={colors.fgMuted}
              style={{ paddingHorizontal: spacing.xs }}
            >
              {"\u2728"} {snap.promptText}
            </Typography>
          ) : null}

          {snap.caption ? (
            <Typography variant="body" style={{ paddingHorizontal: spacing.xs }}>
              {snap.caption}
            </Typography>
          ) : null}

          <PhotoCarousel
            photos={snap.photos}
            footer={
              <Row gap={spacing.md} style={{ paddingTop: spacing.sm, paddingHorizontal: spacing.xs }}>
                <LikeButton snapId={snap.id} initialCount={snap.likes ?? 0} />
                <AnimatedPress
                  onPress={() => onComment(snap.id)}
                  style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}
                  scale={0.9}
                  haptic={false}
                >
                  <Icon icon={Comment01Icon} size={18} color={colors.fg} strokeWidth={1.7} />
                  <Typography variant="meta">{snap.comments ?? 0}</Typography>
                </AnimatedPress>
              </Row>
            }
          />
        </Stack>
      ))}
      <Typography
        variant="metaItalic"
        style={{ textAlign: "center", paddingVertical: spacing.xl, color: colors.fgFaint }}
      >
        You&apos;re all caught up. Go make some presence.
      </Typography>
    </Stack>
  );
}

function LeaderboardTab({ accent, members, userId }: { accent: string; members: CircleMemberView[]; userId?: string }) {
  const ranks: HugeiconsProps["icon"][] = [Crown02Icon, Medal01Icon, Award01Icon];
  const rankColors = [colors.yellow, palette.base500, colors.orange] as string[];
  return (
    <Stack gap={spacing.lg}>
      <Stack gap={0}>
        {members.map((m, i) => {
          const rank = i + 1;
          const isYou = m.id === userId;
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
                      {isYou ? "You" : m.name}
                    </Typography>
                    <Typography variant="metaItalic">{memberMeta(m)}</Typography>
                  </Stack>
                  <StreakFlame days={m.streak} />
                </Row>
              </View>
              {i < members.length - 1 && <Divider />}
            </View>
          );
        })}
      </Stack>
    </Stack>
  );
}

function memberMeta(member: CircleMemberView) {
  return [member.handle, member.vibe ?? member.lastActive].filter(Boolean).join(" · ") || "Circle member";
}

function AboutTab({
  description,
  about,
  members,
  userId,
}: {
  description: string;
  about: string;
  members: CircleMemberView[];
  userId?: string;
}) {
  const preview = members.slice(0, 5);
  const remaining = members.length - preview.length;
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
          Circle vibe
        </Typography>
        <Typography variant="body">{about}</Typography>
      </Stack>

      <Stack gap={spacing.sm}>
        <Typography variant="metaItalic" color={colors.fgFaint}>
          Members
        </Typography>
        <Stack gap={0}>
          {preview.map((m, i) => (
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
                    <Typography variant="label">{m.id === userId ? "You" : m.name}</Typography>
                    <Typography variant="metaItalic">{memberMeta(m)}</Typography>
                  </Stack>
                </Row>
                <StreakFlame days={m.streak} />
              </Row>
              {i < preview.length - 1 && <Divider />}
            </View>
          ))}
        </Stack>
        {remaining > 0 && (
          <Typography
            variant="metaItalic"
            style={{ textAlign: "center", paddingTop: spacing.sm }}
          >
            + {remaining} more
          </Typography>
        )}
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
