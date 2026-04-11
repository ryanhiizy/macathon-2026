import { useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
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
import { Avatar } from "@/components/avatar";
import { StreakFlame } from "@/components/streak-flame";
import { AnimatedPress } from "@/components/animated-press";
import { LikeButton } from "@/components/like-button";
import { PhotoCarousel } from "@/components/photo-carousel";
import { colors, fonts, palette, radius, spacing, tintFor } from "@/lib/theme";
import { CIRCLES, CIRCLE_MEMBERS } from "@/lib/mock";
import type { HugeiconsProps } from "@hugeicons/react-native";

const TABS = ["Feed", "Leaderboard", "About"];

export default function CircleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const circle = CIRCLES.find((c) => c.id === id) ?? CIRCLES[0];
  const [tab, setTab] = useState(0);

  return (
    <Screen>
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
            {circle.members} members · {circle.habit.toLowerCase()}
          </Typography>
        </View>
      </Stack>

      <Segmented options={TABS} value={tab} onChange={setTab} />

      {tab === 0 && <FeedTab />}
      {tab === 1 && <LeaderboardTab accent={circle.accent} />}
      {tab === 2 && <AboutTab description={circle.description} />}
    </Screen>
  );
}

function FeedTab() {
  const items = [
    {
      name: "Sarah K.",
      letter: "S",
      color: colors.blue,
      when: "1h",
      streak: 47,
      photos: [0],
      caption: "Sun still low. The kind of morning that feels like a secret.",
    },
    {
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
        <Stack key={i} gap={spacing.md}>
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
            <Row gap={spacing.xs}>
              <Icon icon={Comment01Icon} size={18} color={colors.fg} strokeWidth={1.7} />
              <Typography variant="meta" color={colors.fg}>
                {2 + i}
              </Typography>
            </Row>
          </Row>
        </Stack>
      ))}
    </Stack>
  );
}

function LeaderboardTab({ accent }: { accent: string }) {
  const [scope, setScope] = useState(0);
  const ranks: HugeiconsProps["icon"][] = [Crown02Icon, Medal01Icon, Award01Icon];
  const rankColors = [colors.yellow, palette.base500, colors.orange] as string[];
  return (
    <Stack gap={spacing.lg}>
      <Segmented
        options={["All time", "This month"]}
        value={scope}
        onChange={setScope}
        align="compact"
      />
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
                      {m.streak} day streak
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
          The pact
        </Typography>
        <Typography variant="lede">{description}</Typography>
      </Stack>

      <Divider />

      <Stack gap={spacing.md}>
        <Typography variant="metaItalic" color={colors.fgFaint}>
          Members
        </Typography>
        <Stack gap={0}>
          {CIRCLE_MEMBERS.slice(0, 5).map((m, i) => (
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
                  <Typography variant="label">{m.name}</Typography>
                </Row>
                <StreakFlame days={m.streak} />
              </Row>
              {i < 4 && <Divider />}
            </View>
          ))}
        </Stack>
        <Typography
          variant="metaItalic"
          style={{ textAlign: "center", paddingTop: spacing.sm }}
        >
          + {CIRCLE_MEMBERS.length - 5} more
        </Typography>
      </Stack>
    </Stack>
  );
}
