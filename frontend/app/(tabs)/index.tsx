import { useState } from "react";
import { Pressable, View } from "react-native";
import { Host, Picker } from "@expo/ui/swift-ui";
import {
  BellDotIcon,
  MessageAdd01Icon,
  FavouriteIcon,
  Comment01Icon,
  Fire03Icon,
} from "@hugeicons/core-free-icons";
import { Screen, Card, Row, Stack } from "@/components/layout";
import { Typography, Eyebrow } from "@/components/typography";
import { Icon } from "@/components/icon";
import { colors, radius, spacing, fonts } from "@/lib/theme";

const FEED_TABS = ["Friends", "Circles"];

export default function Home() {
  const [feedIdx, setFeedIdx] = useState(0);

  return (
    <Screen>
      <Row style={{ justifyContent: "space-between" }}>
        <Typography style={{ fontFamily: fonts.heading, fontSize: 34, color: colors.fg }}>
          presence
        </Typography>
        <Row gap={spacing.md}>
          <Pressable>
            <Icon icon={BellDotIcon} size={26} color={colors.fg} />
          </Pressable>
          <Pressable>
            <Icon icon={MessageAdd01Icon} size={26} color={colors.fg} />
          </Pressable>
        </Row>
      </Row>

      <Host matchContents>
        <Picker
          options={FEED_TABS}
          selectedIndex={feedIdx}
          onOptionSelected={(e) => setFeedIdx(e.nativeEvent.index)}
          variant="segmented"
        />
      </Host>

      <SoloPost />
      <MilestoneCard />
      <GroupPost />
    </Screen>
  );
}

function SoloPost() {
  return (
    <Card>
      <Row style={{ justifyContent: "space-between" }}>
        <Row gap={spacing.sm}>
          <Avatar color={colors.blue} letter="S" />
          <View>
            <Typography variant="label">Sarah K.</Typography>
            <Typography variant="caption">Morning walk · 2h ago</Typography>
          </View>
        </Row>
        <StreakPill days={12} />
      </Row>
      <View
        style={{
          aspectRatio: 1,
          borderRadius: radius.md,
          backgroundColor: colors.ui,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="caption">[photo placeholder]</Typography>
      </View>
      <Card style={{ padding: spacing.md, backgroundColor: colors.bgRaised, borderColor: colors.borderStrong }}>
        <Eyebrow>AI prompt</Eyebrow>
        <Typography variant="body">Throw a peace sign mid-stride on your morning walk.</Typography>
      </Card>
      <Typography variant="bodyMuted">Golden hour hit different today.</Typography>
      <Row gap={spacing.lg}>
        <Row gap={spacing.xs}>
          <Icon icon={FavouriteIcon} size={20} />
          <Typography variant="caption">24</Typography>
        </Row>
        <Row gap={spacing.xs}>
          <Icon icon={Comment01Icon} size={20} />
          <Typography variant="caption">3</Typography>
        </Row>
      </Row>
    </Card>
  );
}

function GroupPost() {
  return (
    <Card>
      <Row style={{ justifyContent: "space-between" }}>
        <Row gap={spacing.sm}>
          <Row gap={-10}>
            <Avatar color={colors.purple} letter="Y" />
            <Avatar color={colors.green} letter="M" />
            <Avatar color={colors.cyan} letter="J" />
          </Row>
          <View>
            <Typography variant="label">You, Mia + 1</Typography>
            <Typography variant="caption">Water check · 5h ago</Typography>
          </View>
        </Row>
        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.uiActive }}>
          <Typography variant="caption" style={{ fontFamily: fonts.bodySemibold }}>Group</Typography>
        </View>
      </Row>
      <View
        style={{
          aspectRatio: 1,
          borderRadius: radius.md,
          backgroundColor: colors.ui,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="caption">[group photo placeholder]</Typography>
      </View>
      <Card style={{ padding: spacing.md, backgroundColor: colors.bgRaised, borderColor: colors.borderStrong }}>
        <Eyebrow>Group prompt</Eyebrow>
        <Typography variant="body">Cheers! Clink your water bottles together.</Typography>
      </Card>
    </Card>
  );
}

function MilestoneCard() {
  return (
    <Card style={{ backgroundColor: colors.bgRaised, borderColor: colors.primarySoft }}>
      <Row gap={spacing.md}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: radius.pill,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon icon={Fire03Icon} size={30} color={colors.onPrimary} />
        </View>
        <Stack gap={spacing.xs} style={{ flex: 1 }}>
          <Eyebrow>Milestone</Eyebrow>
          <Typography variant="label">Sarah hit 50 days of running</Typography>
        </Stack>
      </Row>
    </Card>
  );
}

function StreakPill({ days }: { days: number }) {
  return (
    <Row
      gap={spacing.xs}
      style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: radius.pill,
        backgroundColor: colors.bgRaised,
        borderWidth: 1,
        borderColor: colors.primarySoft,
      }}
    >
      <Icon icon={Fire03Icon} size={16} color={colors.primary} />
      <Typography variant="caption" color={colors.primary} style={{ fontFamily: fonts.bodyBold }}>
        {days}
      </Typography>
    </Row>
  );
}

function Avatar({ color, letter }: { color: string; letter: string }) {
  return (
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: radius.pill,
        backgroundColor: color,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: colors.card,
      }}
    >
      <Typography color={colors.onPrimary} style={{ fontFamily: fonts.bodyBold }}>
        {letter}
      </Typography>
    </View>
  );
}
