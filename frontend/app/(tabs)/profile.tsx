import { Share, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ArrowDown01Icon, PencilEdit02Icon, Settings02Icon, Share08Icon } from "@hugeicons/core-free-icons";
import { Avatar } from "@/components/avatar";
import { AnimatedPress } from "@/components/animated-press";
import { Icon } from "@/components/icon";
import { Screen, Row, Stack } from "@/components/layout";
import { Typography } from "@/components/typography";
import { pickPhoto } from "@/lib/mock";
import { colors, fonts, radius, spacing } from "@/lib/theme";

const STATS = [
  { label: "Habits", value: "8" },
  { label: "Best streak", value: "47" },
  { label: "Friends", value: "124" },
  { label: "Circles", value: "6" },
];

const POSTS = Array.from({ length: 9 }).map((_, i) => i);

const shareProfile = async () => {
  try {
    await Share.share({
      message: "Check out @budi on presence! https://presence.app/budi",
    });
  } catch {}
};

export default function Profile() {
  const header = (
    <Row style={{ justifyContent: "space-between" }}>
      <AnimatedPress
        style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
        haptic="light"
      >
        <Typography
          style={{
            fontFamily: fonts.heading,
            fontSize: 20,
            lineHeight: 24,
            color: colors.fg,
          }}
        >
          @budi
        </Typography>
        <Icon icon={ArrowDown01Icon} size={18} color={colors.fgDim} strokeWidth={2} />
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

        <Row gap={spacing.sm} style={{ width: "100%", paddingHorizontal: spacing.sm }}>
          <AnimatedPress
            style={[profileStyles.actionBtn, profileStyles.actionBtnFilled]}
            haptic="light"
            onPress={() => router.push("/edit-profile")}
          >
            <Icon icon={PencilEdit02Icon} size={16} color={colors.onPrimary} />
            <Typography style={[profileStyles.actionBtnText, { color: colors.onPrimary }]}>
              Edit profile
            </Typography>
          </AnimatedPress>

          <AnimatedPress
            style={[profileStyles.actionBtn, profileStyles.actionBtnOutline]}
            haptic="light"
            onPress={shareProfile}
          >
            <Icon icon={Share08Icon} size={16} color={colors.fg} />
            <Typography style={[profileStyles.actionBtnText, { color: colors.fg }]}>
              Share profile
            </Typography>
          </AnimatedPress>
        </Row>
      </Stack>

      <Row style={{ justifyContent: "space-between", paddingVertical: spacing.sm }}>
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

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        {POSTS.map((photoIdx) => (
          <View key={photoIdx} style={{ width: "31.8%" }}>
            <View
              style={{
                aspectRatio: 1,
                borderRadius: radius.sm,
                overflow: "hidden",
                backgroundColor: colors.bgSunk,
              }}
            >
              <Image
                source={pickPhoto(photoIdx)}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={240}
              />
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const profileStyles = StyleSheet.create({
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs + 2,
    height: 40,
    borderRadius: radius.sm,
  },
  actionBtnFilled: {
    backgroundColor: colors.fg,
  },
  actionBtnOutline: {
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
    lineHeight: 18,
  },
});
