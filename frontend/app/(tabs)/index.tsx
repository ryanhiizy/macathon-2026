import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, RefreshControl, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
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
} from "@hugeicons/core-free-icons";
import { Avatar, AvatarStack } from "@/components/avatar";
import { AnimatedPress } from "@/components/animated-press";
import { BragStat } from "@/components/brag-stat";
import { Icon } from "@/components/icon";
import { LikeButton } from "@/components/like-button";
import { PhotoCarousel } from "@/components/photo-carousel";
import { Screen, Row, Stack } from "@/components/layout";
import { Segmented } from "@/components/segmented";
import { StreakFlame } from "@/components/streak-flame";
import { Typography } from "@/components/typography";
import { type FeedPost, type GroupPost as GroupPostData, type SoloPost as SoloPostData } from "@/lib/mock";
import { loadFeedPosts } from "@/lib/feed";
import { useAuth } from "@/lib/auth-context";
import { colors, fonts, radius, spacing } from "@/lib/theme";

const PULL_MESSAGES = [
  "See who showed up today",
  "Listening for fresh proofs",
  "A quiet moment before new habits",
];

export default function Home() {
  const { user } = useAuth();
  const [feedIdx, setFeedIdx] = useState(0);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [pullMessageIdx, setPullMessageIdx] = useState(0);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshFeed = useCallback(async () => {
    const nextPosts = await loadFeedPosts(user?.id);
    setPosts(nextPosts);
  }, [user?.id]);

  useEffect(
    () => () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      refreshFeed();
    }, [refreshFeed])
  );

  const onRefresh = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    setRefreshing(true);
    setPullMessageIdx((i) => (i + 1) % PULL_MESSAGES.length);
    refreshTimeoutRef.current = setTimeout(() => {
      refreshFeed().catch(() => {});
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
          <Pressable hitSlop={10}>
            <Icon icon={BellDotIcon} size={24} color={colors.fg} />
          </Pressable>
          <Pressable hitSlop={10}>
            <Icon icon={MessageAdd01Icon} size={24} color={colors.fg} />
          </Pressable>
        </Row>
      </Row>
      <Segmented options={["Friends", "Circles"]} value={feedIdx} onChange={setFeedIdx} />
    </Stack>
  );

  return (
    <Screen
      stickyHeader={header}
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
      <Stack gap={spacing.xxl}>
        {posts.map((post) => {
          if (post.kind === "dispatch") {
            return (
              <BragStat
                key={post.id}
                name={post.name}
                value={post.value}
                unit={post.unit}
                caption={post.caption}
              />
            );
          }

          if (post.kind === "group") {
            return <GroupPost key={post.id} post={post} />;
          }

          return <SoloPost key={post.id} post={post} />;
        })}
      </Stack>
    </Screen>
  );
}

function SoloPost({ post }: { post: SoloPostData }) {
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

      {post.promptText ? (
        <Typography variant="metaItalic" color={colors.fgMuted}>
          {"\u2728"} {post.promptText}
        </Typography>
      ) : null}

      <Typography variant="body">{post.caption}</Typography>

      <PhotoCarousel
        photoIdxs={post.photoIdxs}
        photos={post.photos}
        overlay={
          <Row gap={spacing.xl}>
            <LikeButton initialCount={post.likes} tint={colors.white} snapId={post.id} />
            <AnimatedPress
              style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}
              scale={0.9}
              haptic={false}
            >
              <Icon icon={Comment01Icon} size={18} color={colors.white} strokeWidth={1.7} />
              <Typography variant="meta" color={colors.white}>
                {post.comments}
              </Typography>
            </AnimatedPress>
          </Row>
        }
      />
    </Stack>
  );
}

function GroupPost({ post }: { post: GroupPostData }) {
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
            paddingHorizontal: spacing.md,
            paddingVertical: 5,
            borderRadius: radius.pill,
            backgroundColor: colors.fg,
          }}
        >
          <Typography
            color={colors.bg}
            style={{
              fontFamily: fonts.bodyBold,
              fontSize: 11,
              lineHeight: 14,
              letterSpacing: 0.2,
            }}
          >
            Group
          </Typography>
        </View>
      </Row>

      {post.promptText ? (
        <Typography variant="metaItalic" color={colors.fgMuted}>
          {"\u2728"} {post.promptText}
        </Typography>
      ) : null}

      <Typography variant="body">{post.caption}</Typography>

      <PhotoCarousel
        photoIdxs={post.photoIdxs}
        photos={post.photos}
        overlay={
          <Row gap={spacing.xl}>
            <LikeButton initialCount={post.likes} tint={colors.white} snapId={post.id} />
            <AnimatedPress
              style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}
              scale={0.9}
              haptic={false}
            >
              <Icon icon={Comment01Icon} size={18} color={colors.white} strokeWidth={1.7} />
              <Typography variant="meta" color={colors.white}>
                {post.comments}
              </Typography>
            </AnimatedPress>
          </Row>
        }
      />

      <Row gap={spacing.sm} style={{ flexWrap: "wrap" }}>
        {post.participants.map((participant) => (
          <StreakMiniChip
            key={participant.name}
            letter={participant.letter}
            color={participant.color}
            days={participant.streak}
            name={participant.name}
          />
        ))}
      </Row>
    </Stack>
  );
}

function StreakMiniChip({
  letter,
  color,
  days,
  name,
}: {
  letter: string;
  color: string;
  days: number;
  name: string;
}) {
  return (
    <Row
      gap={6}
      style={{
        paddingRight: spacing.md,
        paddingLeft: 4,
        paddingVertical: 4,
        borderRadius: radius.pill,
        backgroundColor: `${color}18`,
      }}
    >
      <Avatar color={color} letter={letter} size={22} ring={false} />
      <Typography
        style={{
          fontFamily: fonts.bodyBold,
          fontSize: 12,
          lineHeight: 14,
          color,
        }}
      >
        {name} · {days}
      </Typography>
    </Row>
  );
}
