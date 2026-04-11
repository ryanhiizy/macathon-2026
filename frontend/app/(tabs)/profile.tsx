import { View } from "react-native";
import { Image } from "expo-image";
import { Fire03Icon, Settings02Icon } from "@hugeicons/core-free-icons";
import { Avatar } from "@/components/avatar";
import { AnimatedPress } from "@/components/animated-press";
import { Icon } from "@/components/icon";
import { Screen, Divider, Row, Stack } from "@/components/layout";
import { ProgressBar } from "@/components/ui-controls";
import { Typography } from "@/components/typography";
import { pickPhoto } from "@/lib/mock";
import { colors, fonts, radius, spacing } from "@/lib/theme";

const STATS = [
  { label: "Habits", value: "8" },
  { label: "Best streak", value: "47" },
  { label: "Friends", value: "124" },
  { label: "Circles", value: "6" },
];

const POSTS = Array.from({ length: 9 }).map((_, i) => ({
  photoIdx: i,
  habit: ["Morning walk", "Hydrate", "Meditate", "Read", "Run"][i % 5],
}));

export default function Profile() {
  const header = (
    <Row style={{ justifyContent: "flex-end" }}>
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
        <Icon icon={Settings02Icon} size={20} color={colors.fg} strokeWidth={1.8} />
      </AnimatedPress>
    </Row>
  );

  return (
    <Screen stickyHeader={header}>
      <Stack gap={spacing.lg} style={{ alignItems: "center", paddingTop: spacing.sm }}>
        <Avatar color={colors.primary} letter="B" size={104} ring={false} />
        <Stack gap={spacing.xs} style={{ alignItems: "center" }}>
          <Typography
            style={{
              fontFamily: fonts.heading,
              fontSize: 30,
              lineHeight: 36,
              color: colors.fg,
            }}
          >
            Budi Hartono
          </Typography>
          <Typography variant="metaItalic">@budi — joined April 2026</Typography>
        </Stack>
        <Typography
          variant="lede"
          style={{ textAlign: "center", paddingHorizontal: spacing.lg }}
        >
          Stacking small habits into something bigger. Currently chasing 100 days of morning walks.
        </Typography>
      </Stack>

      <Row style={{ justifyContent: "space-between", paddingVertical: spacing.md }}>
        {STATS.map((stat) => (
          <View key={stat.label} style={{ alignItems: "center", flex: 1 }}>
            <Typography
              style={{
                fontFamily: fonts.heading,
                fontSize: 28,
                lineHeight: 32,
                color: colors.fg,
              }}
            >
              {stat.value}
            </Typography>
            <Typography variant="metaItalic">{stat.label}</Typography>
          </View>
        ))}
      </Row>

      <Divider />

      <Stack gap={spacing.sm}>
        <Row style={{ justifyContent: "space-between" }}>
          <Typography
            style={{
              fontFamily: fonts.heading,
              fontSize: 18,
              lineHeight: 22,
              color: colors.fg,
            }}
          >
            Weekly consistency
          </Typography>
          <Row gap={spacing.xs}>
            <Icon icon={Fire03Icon} size={16} color={colors.primary} />
            <Typography
              variant="caption"
              color={colors.primary}
              style={{ fontFamily: fonts.bodyBold }}
            >
              72%
            </Typography>
          </Row>
        </Row>
        <ProgressBar color={colors.primary} progress={0.72} />
      </Stack>

      <Divider />

      <Stack gap={spacing.md}>
        <Typography
          style={{
            fontFamily: fonts.heading,
            fontSize: 18,
            lineHeight: 22,
            color: colors.fg,
          }}
        >
          Recent proofs
        </Typography>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {POSTS.map((post, i) => (
            <View key={i} style={{ width: "31.8%" }}>
              <View
                style={{
                  aspectRatio: 1,
                  borderRadius: radius.sm,
                  overflow: "hidden",
                  backgroundColor: colors.bgSunk,
                }}
              >
                <Image
                  source={pickPhoto(post.photoIdx)}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                  transition={240}
                />
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: 6,
                    backgroundColor: `${colors.black}70`,
                  }}
                >
                  <Typography
                    color={colors.bg}
                    style={{
                      fontFamily: fonts.heading,
                      fontSize: 10.5,
                      lineHeight: 13,
                    }}
                  >
                    {post.habit}
                  </Typography>
                </View>
              </View>
            </View>
          ))}
        </View>
      </Stack>
    </Screen>
  );
}
