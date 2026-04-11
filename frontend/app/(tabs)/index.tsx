import { useEffect, useState } from "react";
import { View, Pressable, RefreshControl } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import {
  BellDotIcon,
  MessageAdd01Icon,
  Comment01Icon,
} from "@hugeicons/core-free-icons";
import { Screen, Row, Stack } from "@/components/layout";
import { Typography } from "@/components/typography";
import { Icon } from "@/components/icon";
import { Segmented } from "@/components/segmented";
import { StreakFlame } from "@/components/streak-flame";
import { Avatar, AvatarStack } from "@/components/avatar";
import { BragStat } from "@/components/brag-stat";
import { AnimatedPress } from "@/components/animated-press";
import { LikeButton } from "@/components/like-button";
import { PhotoCarousel } from "@/components/photo-carousel";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import {
  FEED_POSTS,
  type SoloPost as SoloPostData,
  type GroupPost as GroupPostData,
} from "@/lib/mock";

const PULL_MESSAGES = [
  "See who showed up today",
  "Listening for fresh proofs",
  "A quiet moment before new habits",
];

export default function Home() {
  const [feedIdx, setFeedIdx] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [pullMessageIdx, setPullMessageIdx] = useState(0);

  const onRefresh = () => {
    setRefreshing(true);
    setPullMessageIdx((i) => (i + 1) % PULL_MESSAGES.length);
    setTimeout(() => setRefreshing(false), 900);
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
      <Segmented
        options={["Friends", "Circles"]}
        value={feedIdx}
        onChange={setFeedIdx}
      />
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
        {FEED_POSTS.map((post) => {
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

      <Typography variant="body">{post.caption}</Typography>

      <PhotoCarousel
        photoIdxs={post.photoIdxs}
        overlay={
          <Row gap={spacing.xl}>
            <LikeButton initialCount={post.likes} tint={colors.white} />
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
  const avatars =
    post.participants?.map((p) => ({ color: p.color, letter: p.letter })) ?? [];
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

      <Typography variant="body">{post.caption}</Typography>

      <PhotoCarousel
        photoIdxs={post.photoIdxs}
        overlay={
          <Row gap={spacing.xl}>
            <LikeButton initialCount={post.likes} tint={colors.white} />
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

      {post.participants && (
        <Row gap={spacing.sm} style={{ flexWrap: "wrap" }}>
          {post.participants.map((p, i) => (
            <StreakMiniChip
              key={i}
              letter={p.letter}
              color={p.color}
              days={p.streak}
              name={p.name}
            />
          ))}
        </Row>
      )}
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
        backgroundColor: color + "18",
      }}
    >
      <Avatar color={color} letter={letter} size={22} ring={false} />
      <Typography
        style={{
          fontFamily: fonts.bodyBold,
          fontSize: 12,
          lineHeight: 14,
          color: color,
        }}
      >
        {name} · {days}
      </Typography>
    </Row>
  );
}
