import { Pressable, View } from "react-native";
import { Settings02Icon, Fire03Icon } from "@hugeicons/core-free-icons";
import { Screen, Card, Row, Stack } from "@/components/layout";
import { Typography, Eyebrow } from "@/components/typography";
import { Icon } from "@/components/icon";
import { colors, radius, spacing, fonts } from "@/lib/theme";

const STATS = [
  { label: "Habits", value: "8" },
  { label: "Best streak", value: "47" },
  { label: "Friends", value: "124" },
  { label: "Circles", value: "6" },
];

const GRID_ACCENTS = [
  colors.orange,
  colors.cyan,
  colors.green,
  colors.purple,
  colors.blue,
  colors.magenta,
  colors.yellow,
  colors.red,
  colors.orange,
];

export default function Profile() {
  return (
    <Screen>
      <Row style={{ justifyContent: "flex-end" }}>
        <Pressable
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.pill,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon icon={Settings02Icon} size={22} color={colors.fg} />
        </Pressable>
      </Row>

      <Stack gap={spacing.md} style={{ alignItems: "center" }}>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: radius.pill,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 3,
            borderColor: colors.card,
          }}
        >
          <Typography style={{ fontFamily: fonts.heading, fontSize: 40, color: colors.onPrimary }}>
            B
          </Typography>
        </View>
        <View style={{ alignItems: "center" }}>
          <Typography style={{ fontFamily: fonts.heading, fontSize: 26, color: colors.fg }}>
            Budi Hartono
          </Typography>
          <Typography variant="caption">@budi · joined Apr 2026</Typography>
        </View>
      </Stack>

      <Card>
        <Row style={{ justifyContent: "space-between" }}>
          {STATS.map((stat, i) => (
            <View key={i} style={{ alignItems: "center", flex: 1 }}>
              <Typography style={{ fontFamily: fonts.heading, fontSize: 22, color: colors.fg }}>
                {stat.value}
              </Typography>
              <Typography variant="caption">{stat.label}</Typography>
            </View>
          ))}
        </Row>
      </Card>

      <Card>
        <Eyebrow>Bio</Eyebrow>
        <Typography variant="bodyMuted">
          Building small habits into rituals. Currently chasing 100 days of morning walks.
        </Typography>
      </Card>

      <Card>
        <Row style={{ justifyContent: "space-between" }}>
          <Eyebrow>Weekly consistency</Eyebrow>
          <Row gap={spacing.xs}>
            <Icon icon={Fire03Icon} size={16} color={colors.primary} />
            <Typography variant="caption" color={colors.primary} style={{ fontFamily: fonts.bodyBold }}>
              72%
            </Typography>
          </Row>
        </Row>
        <View
          style={{
            height: 10,
            borderRadius: radius.pill,
            backgroundColor: colors.ui,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: "72%",
              height: "100%",
              borderRadius: radius.pill,
              backgroundColor: colors.primary,
            }}
          />
        </View>
      </Card>

      <Stack gap={spacing.sm}>
        <Eyebrow>Recent proofs</Eyebrow>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {GRID_ACCENTS.map((accent, i) => (
            <View
              key={i}
              style={{
                width: "31.5%",
                aspectRatio: 1,
                borderRadius: radius.md,
                backgroundColor: colors.ui,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: radius.pill,
                  backgroundColor: accent,
                }}
              />
            </View>
          ))}
        </View>
      </Stack>
    </Screen>
  );
}
