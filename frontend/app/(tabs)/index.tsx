import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import {
  BellDotIcon,
  Comment01Icon,
  MessageAdd01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { Avatar, AvatarStack } from "@/components/avatar";
import { AnimatedPress } from "@/components/animated-press";
import { BragStat } from "@/components/brag-stat";
import { CommentsSheet } from "@/components/comments-sheet";
import { Icon } from "@/components/icon";
import { LikeButton } from "@/components/like-button";
import { PhotoCarousel } from "@/components/photo-carousel";
import { Screen, Row, Stack } from "@/components/layout";
import { Segmented } from "@/components/segmented";
import { SwipeableTabs } from "@/components/swipeable-tabs";
import { StreakFlame } from "@/components/streak-flame";
import { Typography } from "@/components/typography";
import {
  FEED_POSTS,
  type GroupPost as GroupPostData,
  type SoloPost as SoloPostData,
} from "@/lib/mock";
import { colors, fonts, radius, spacing } from "@/lib/theme";

const PULL_MESSAGES = [
  "See who showed up today",
  "Listening for fresh proofs",
  "A quiet moment before new habits",
];

export default function Home() {
  const router = useRouter();
  const [feedIdx, setFeedIdx] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [pullMessageIdx, setPullMessageIdx] = useState(0);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    },
    [],
  );

  const onRefresh = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    setRefreshing(true);
    setPullMessageIdx((i) => (i + 1) % PULL_MESSAGES.length);
    refreshTimeoutRef.current = setTimeout(() => {
      setRefreshing(false);
      refreshTimeoutRef.current = null;
    }, 900);
  };


  const inkWidth = useSharedValue(0);
  useEffect(() => {
    inkWidth.value = withDelay(
      260,
      withTiming(116, { duration: 520, easing: Easing.out(Easing.cubic) }),
    );
  }, [inkWidth]);
  const inkStyle = useAnimatedStyle(() => ({ width: inkWidth.value }));

  const header = (
    <Stack gap={spacing.lg}>
      <Row style={{ justifyContent: "space-between" }}>
        <View>
          <Typography
            style={{
              fontFamily: fonts.headingItalic,
              fontSize: 32,
              lineHeight: 38,
              color: colors.fg,
            }}
          >
            presence
          </Typography>
          <Animated.View
            style={[
              {
                height: 2,
                backgroundColor: colors.primary,
                borderRadius: 1,
                marginTop: -2,
              },
              inkStyle,
            ]}
          />
        </View>
        <Row gap={spacing.lg}>
          <Pressable hitSlop={10} onPress={() => router.push("/notifications")}>
            <Icon icon={BellDotIcon} size={24} color={colors.fg} />
          </Pressable>
          <Pressable hitSlop={10} onPress={() => router.push("/messages")}>
            <Icon icon={MessageAdd01Icon} size={24} color={colors.fg} />
          </Pressable>
        </Row>
      </Row>
      <Segmented options={["Friends", "Circles"]} value={feedIdx} onChange={setFeedIdx} />
    </Stack>
  );

  const friendsPosts = FEED_POSTS.filter((post) => post.kind !== "group");
  const circlePosts = FEED_POSTS.filter((post) => post.kind === "group");

  const paneScroll = {
    contentContainerStyle: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: 24,
      gap: spacing.xl,
    },
    showsVerticalScrollIndicator: false,
  } as const;

  return (
    <Screen stickyHeader={header} scroll={false}>
      <SwipeableTabs value={feedIdx} onChange={setFeedIdx}>
        {[
          <ScrollView
            key="friends"
            {...paneScroll}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                title={PULL_MESSAGES[pullMessageIdx]}
                titleColor={colors.fgFaint}
              />
            }
          >
            <FeedList posts={friendsPosts} onComment={setCommentPostId} />
          </ScrollView>,
          <ScrollView
            key="circles"
            {...paneScroll}
          >
            <FeedList posts={circlePosts} onComment={setCommentPostId} />
          </ScrollView>,
        ]}
      </SwipeableTabs>
      <CommentsSheet postId={commentPostId} onClose={() => setCommentPostId(null)} />
    </Screen>
  );
}

function FeedList({
  posts,
  onComment,
}: {
  posts: typeof FEED_POSTS;
  onComment: (id: string) => void;
}) {
  return (
    <Stack gap={spacing.xxl}>
      {posts.map((post) => {
        if (post.kind === "dispatch") {
          return (
            <BragStat
              key={post.id}
              name={post.name}
              handle={post.handle}
              when={post.when}
              color={post.color}
              letter={post.letter}
              streak={post.streak}
              value={post.value}
              unit={post.unit}
              caption={post.caption}
            />
          );
        }

        if (post.kind === "group") {
          return <GroupPost key={post.id} post={post} onComment={onComment} />;
        }

        return <SoloPost key={post.id} post={post} onComment={onComment} />;
      })}
      <Typography
        variant="metaItalic"
        style={{ textAlign: "center", paddingVertical: spacing.xl, color: colors.fgFaint }}
      >
        You&apos;re all caught up. Go make some presence.
      </Typography>
    </Stack>
  );
}

function SoloPost({ post, onComment }: { post: SoloPostData; onComment: (id: string) => void }) {
  return (
    <Stack gap={spacing.md}>
      <Row style={{ justifyContent: "space-between" }}>
        <Row gap={spacing.md}>
          <Avatar color={post.color} letter={post.letter} size={40} ring={false} />
          <View>
            <Typography variant="label">{post.name}</Typography>
            <Typography variant="metaItalic">
              {post.handle} · {post.when}
            </Typography>
          </View>
        </Row>
        <StreakFlame days={post.streak} />
      </Row>

      <Typography variant="body" style={{ paddingHorizontal: spacing.xs }}>
        {post.caption}
      </Typography>

      <PhotoCarousel
        photoIdxs={post.photoIdxs}
        footer={<PostActions likes={post.likes} comments={post.comments} onComment={() => onComment(post.id)} />}
      />
    </Stack>
  );
}

function GroupPost({ post, onComment }: { post: GroupPostData; onComment: (id: string) => void }) {
  const avatars = post.participants.map((participant) => ({
    color: participant.color,
    letter: participant.letter,
  }));

  return (
    <Stack gap={spacing.md}>
      <Row style={{ justifyContent: "space-between" }}>
        <Row gap={spacing.md}>
          <AvatarStack avatars={avatars} size={36} />
          <View>
            <Typography variant="label">{post.name}</Typography>
            <Typography variant="metaItalic">
              {post.handle} · {post.when}
            </Typography>
          </View>
        </Row>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.xs,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: radius.pill,
            backgroundColor: colors.purple + "1f",
          }}
        >
          <Icon icon={UserGroupIcon} size={14} color={colors.purple} />
          <Typography
            color={colors.purple}
            style={{ fontFamily: fonts.bodyBold, fontSize: 12.5, lineHeight: 14.5 }}
          >
            {post.participants.length}
          </Typography>
        </View>
      </Row>

      <Typography variant="body" style={{ paddingHorizontal: spacing.xs }}>
        {post.caption}
      </Typography>

      <PhotoCarousel
        photoIdxs={post.photoIdxs}
        footer={<PostActions likes={post.likes} comments={post.comments} onComment={() => onComment(post.id)} />}
      />
    </Stack>
  );
}

function PostActions({
  likes,
  comments,
  onComment,
}: {
  likes: number;
  comments: number;
  onComment: () => void;
}) {
  return (
    <Row gap={spacing.md} style={{ paddingTop: spacing.sm, paddingHorizontal: spacing.xs }}>
      <LikeButton initialCount={likes} />
      <AnimatedPress
        onPress={onComment}
        style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}
        scale={0.9}
        haptic={false}
      >
        <Icon icon={Comment01Icon} size={18} color={colors.fg} strokeWidth={1.7} />
        <Typography variant="meta">{comments}</Typography>
      </AnimatedPress>
    </Row>
  );
}
