import { useEffect, useState } from "react";
import { Pressable, View, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AiMagicIcon, Cancel01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Card, Row, Stack } from "@/components/layout";
import { Typography, Eyebrow } from "@/components/typography";
import { Icon } from "@/components/icon";
import { colors, radius, spacing, fonts } from "@/lib/theme";

type Insight = {
  headline: string;
  detail: string;
  habit_name: string;
  insight_type: string;
};

// ── demo fallbacks ─────────────────────────────────────────────────────

const DEMO_INSIGHTS: Record<string, Insight[]> = {
  "1": [
    {
      headline: "Protect your streak on Thursday",
      detail: "Your last 2 streaks broke on a Thursday. Lay out your shoes tonight so there's zero friction tomorrow morning.",
      habit_name: "Morning walk",
      insight_type: "risk_alert",
    },
    {
      headline: "You're 6 days from your all-time best",
      detail: "Your record is 18 days and you broke it by sleeping in. Try a shorter route on tired days instead of skipping entirely.",
      habit_name: "Morning walk",
      insight_type: "streak_momentum",
    },
    {
      headline: "Invite a friend this weekend",
      detail: "You've never broken a streak after a Group Prove. Lock in Saturday with someone and you'll cruise into next week.",
      habit_name: "Morning walk",
      insight_type: "social_boost",
    },
  ],
  "2": [
    {
      headline: "Anchor it to an existing habit",
      detail: "You never miss on days you also do your morning walk. Try drinking a full glass right after you get back.",
      habit_name: "Drink water",
      insight_type: "cross_habit",
    },
    {
      headline: "Weekday dips are a cue, not a failure",
      detail: "You drop off Tue-Thu when work picks up. Keep a bottle at your desk so it's visible — out of sight, out of mind.",
      habit_name: "Drink water",
      insight_type: "risk_alert",
    },
  ],
  "3": [
    {
      headline: "You're entering automatic territory",
      detail: "Research says habits lock in around 66 days. At 23 days you're 35% there — this is the hardest stretch, and you're in it.",
      habit_name: "Meditate",
      insight_type: "streak_momentum",
    },
    {
      headline: "Saturday is your one blind spot",
      detail: "You've missed 3 of the last 4 Saturdays. Try a shorter 5-minute session on weekends — consistency beats duration.",
      habit_name: "Meditate",
      insight_type: "risk_alert",
    },
    {
      headline: "Group Prove doubles your follow-through",
      detail: "When you prove with friends, you haven't missed once. The accountability makes the difference — use it on shaky days.",
      habit_name: "Meditate",
      insight_type: "social_boost",
    },
  ],
  "4": [
    {
      headline: "Don't break the chain — you're past the hard part",
      detail: "Most people quit a new habit by day 2. You're at day 3, which means the initial resistance is behind you. Keep showing up.",
      habit_name: "Read 10 pages",
      insight_type: "streak_momentum",
    },
    {
      headline: "Stack it right after dinner",
      detail: "Your 9pm slot works because you're already winding down. Make it the bridge between dinner and bed — no willpower needed.",
      habit_name: "Read 10 pages",
      insight_type: "optimal_timing",
    },
  ],
};

const GLOBAL_DEMO: Insight[] = [
  {
    headline: "Protect your streak on Thursday",
    detail: "Your last 2 streaks broke on a Thursday. Lay out your shoes tonight so there's zero friction tomorrow morning.",
    habit_name: "Morning walk",
    insight_type: "risk_alert",
  },
  {
    headline: "You're entering automatic territory",
    detail: "Research says habits lock in around 66 days. At 23 days you're 35% there — this is when it starts getting easier.",
    habit_name: "Meditate",
    insight_type: "streak_momentum",
  },
  {
    headline: "Group Prove doubles your follow-through",
    detail: "When you prove with friends, you haven't missed once. Use it on days you're most likely to skip.",
    habit_name: "Meditate",
    insight_type: "social_boost",
  },
];

function getDismissKey(habitId?: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `coach_dismissed_${habitId ?? "global"}_${today}`;
}

function getDemoInsights(habitId?: string, habitName?: string): Insight[] {
  // IDs are Supabase UUIDs now, so pick demo insights by habit name instead
  if (habitName) {
    const lower = habitName.toLowerCase();
    for (const insights of Object.values(DEMO_INSIGHTS)) {
      if (insights[0]?.habit_name.toLowerCase() === lower) {
        return insights;
      }
    }
    return GLOBAL_DEMO.map((i) => ({ ...i, habit_name: habitName }));
  }
  return GLOBAL_DEMO;
}

const INSIGHT_TYPE_LABELS: Record<string, string> = {
  optimal_timing: "Try this",
  streak_momentum: "Keep going",
  risk_alert: "Watch out",
  social_boost: "Pro tip",
  recovery: "Bounce back",
  cross_habit: "Connection",
  general: "Coach says",
};

// ── Compact teaser card (for habits list) ──────────────────────────────

type CompactProps = {
  habitId?: string;
  habitName?: string;
  onPress?: () => void;
};

export function CoachInsightTeaser({ habitId, habitName, onPress }: CompactProps) {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!cancelled) {
        const demos = getDemoInsights(habitId, habitName);
        const dayIndex = new Date().getDate() % demos.length;
        setInsight(demos[dayIndex]);
      }
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }
    load();
    return () => { cancelled = true; };
  }, [fadeAnim, habitId, habitName]);

  if (loading || !insight) return null;

  const typeLabel = INSIGHT_TYPE_LABELS[insight.insight_type] ?? "Insight";

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Pressable onPress={onPress}>
        <View
          style={{
            backgroundColor: colors.bgRaised,
            borderRadius: radius.lg,
            padding: spacing.lg,
            gap: spacing.md,
          }}
        >
          <Row gap={spacing.sm} style={{ alignItems: "center" }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: radius.pill,
                backgroundColor: `${colors.purple}1a`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon icon={AiMagicIcon} size={16} color={colors.purple} />
            </View>
            <Typography
              style={{
                fontFamily: fonts.bodySemibold,
                fontSize: 13,
                lineHeight: 16,
                color: colors.purple,
                letterSpacing: 0.3,
              }}
            >
              AI Coach
            </Typography>
            <View style={{ flex: 1 }} />
            <View
              style={{
                backgroundColor: `${colors.purple}18`,
                borderRadius: radius.pill,
                paddingHorizontal: spacing.sm,
                paddingVertical: 3,
              }}
            >
              <Typography
                style={{
                  fontFamily: fonts.bodyMedium,
                  fontSize: 11,
                  lineHeight: 14,
                  color: colors.purple,
                }}
              >
                {typeLabel}
              </Typography>
            </View>
          </Row>

          <Typography
            style={{
              fontFamily: fonts.heading,
              fontSize: 16,
              lineHeight: 22,
              color: colors.fg,
            }}
          >
            {insight.headline}
          </Typography>
          <Typography
            style={{
              fontFamily: fonts.body,
              fontSize: 13.5,
              lineHeight: 20,
              color: colors.fgMuted,
            }}
            numberOfLines={2}
          >
            {insight.detail}
          </Typography>

          <Row gap={spacing.xs} style={{ alignItems: "center" }}>
            <Typography
              style={{
                fontFamily: fonts.bodySemibold,
                fontSize: 12.5,
                lineHeight: 16,
                color: colors.purple,
              }}
            >
              View more insights
            </Typography>
            <Icon icon={ArrowRight01Icon} size={14} color={colors.purple} />
          </Row>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ── Expanded deep-dive card (for habit detail page) ────────────────────

type DetailProps = {
  habitId?: string;
  habitName?: string;
  userId?: string;
  serverUrl?: string;
};

function useCoachInsights({ habitId, habitName, userId, serverUrl }: DetailProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const wasDismissed = await AsyncStorage.getItem(getDismissKey(habitId));
      if (wasDismissed) {
        setDismissed(true);
        setLoading(false);
        return;
      }

      if (serverUrl && habitId && userId) {
        try {
          const resp = await fetch(`${serverUrl}/coach-insight`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, habit_id: habitId }),
          });
          if (resp.ok) {
            const data = await resp.json();
            if (!cancelled) setInsights([data]);
            setLoading(false);
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
            return;
          }
        } catch {
          // fall through
        }
      }

      if (!cancelled) {
        setInsights(getDemoInsights(habitId, habitName));
      }
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }

    load();
    return () => { cancelled = true; };
  }, [fadeAnim, habitId, userId, serverUrl, habitName]);

  const dismiss = async () => {
    await AsyncStorage.setItem(getDismissKey(habitId), "1");
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setDismissed(true);
    });
  };

  return { insights, dismissed, loading, fadeAnim, dismiss };
}

export function CoachInsightCard({ habitId, habitName, userId, serverUrl }: DetailProps) {
  const { insights, dismissed, loading, fadeAnim, dismiss } = useCoachInsights({
    habitId, habitName, userId, serverUrl,
  });

  if (dismissed || loading || insights.length === 0) return null;

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Card
        style={{
          backgroundColor: colors.bgRaised,
          borderColor: colors.purple,
          borderWidth: 1,
        }}
      >
        {/* Header */}
        <Row style={{ justifyContent: "space-between" }}>
          <Row gap={spacing.sm}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: radius.md,
                backgroundColor: `${colors.purple}18`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon icon={AiMagicIcon} size={18} color={colors.purple} />
            </View>
            <Eyebrow>AI Coach</Eyebrow>
          </Row>
          <Pressable
            onPress={dismiss}
            hitSlop={12}
            style={{
              width: 28,
              height: 28,
              borderRadius: radius.pill,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon icon={Cancel01Icon} size={16} color={colors.fgMuted} />
          </Pressable>
        </Row>

        {/* Insight list */}
        <Stack gap={spacing.md}>
          {insights.map((insight, i) => (
            <View key={i}>
              {i > 0 && (
                <View
                  style={{
                    height: 1,
                    backgroundColor: colors.border,
                    marginBottom: spacing.md,
                  }}
                />
              )}
              <Row gap={spacing.sm} style={{ marginBottom: spacing.xs }}>
                <View
                  style={{
                    backgroundColor: `${colors.purple}14`,
                    borderRadius: radius.pill,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: 2,
                  }}
                >
                  <Typography
                    style={{ fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.purple }}
                  >
                    {INSIGHT_TYPE_LABELS[insight.insight_type] ?? "Insight"}
                  </Typography>
                </View>
              </Row>
              <Typography
                style={{
                  fontFamily: fonts.bodySemibold,
                  fontSize: 15,
                  color: colors.fg,
                }}
              >
                {insight.headline}
              </Typography>
              <Typography variant="caption" style={{ marginTop: 2 }}>
                {insight.detail}
              </Typography>
            </View>
          ))}
        </Stack>
      </Card>
    </Animated.View>
  );
}

// ── Subtle inline coach (restyled for habit detail page) ───────────────

export function CoachInsightInline({ habitId, habitName, userId, serverUrl }: DetailProps) {
  const { insights, dismissed, loading, fadeAnim, dismiss } = useCoachInsights({
    habitId, habitName, userId, serverUrl,
  });

  if (dismissed || loading || insights.length === 0) return null;

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View
        style={{
          backgroundColor: colors.bgRaised,
          borderRadius: radius.lg,
          padding: spacing.lg,
          gap: spacing.md,
        }}
      >
        <Row style={{ justifyContent: "space-between" }}>
          <Row gap={spacing.sm}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: radius.pill,
                backgroundColor: `${colors.purple}14`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon icon={AiMagicIcon} size={14} color={colors.purple} />
            </View>
            <Typography
              style={{
                fontFamily: fonts.bodySemibold,
                fontSize: 13,
                lineHeight: 16,
                color: colors.purple,
              }}
            >
              Coach
            </Typography>
          </Row>
          <Pressable
            onPress={dismiss}
            hitSlop={12}
            style={{
              width: 24,
              height: 24,
              borderRadius: radius.pill,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon icon={Cancel01Icon} size={14} color={colors.fgDim} />
          </Pressable>
        </Row>

        {insights.map((insight, i) => (
          <View key={i}>
            {i > 0 && (
              <View
                style={{
                  height: 1,
                  backgroundColor: colors.border,
                  marginBottom: spacing.md,
                }}
              />
            )}
            <Typography
              style={{
                fontFamily: fonts.bodySemibold,
                fontSize: 14,
                lineHeight: 19,
                color: colors.fg,
              }}
            >
              {insight.headline}
            </Typography>
            <Typography
              style={{
                fontFamily: fonts.body,
                fontSize: 13,
                lineHeight: 19,
                color: colors.fgMuted,
                marginTop: 2,
              }}
            >
              {insight.detail}
            </Typography>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}
