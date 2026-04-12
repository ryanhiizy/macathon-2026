export type CircleVariationInput = {
  circleId: string;
  name: string;
  habit: string;
  memberCount: number;
};

export type CircleAnalytics = {
  todayRate: number;
  avgStreak: number;
  topStreak: number;
  weekDaily: number[];
  trendLine: number[];
};

export type CircleCopy = {
  description: string;
  about: string;
};

export type FallbackMemberFlavor = {
  id: string;
  name: string;
  archetype: string;
  vibe: string;
};

export type FallbackCircleFeedPost = {
  id: string;
  name: string;
  when: string;
  promptText: string;
  caption: string;
};

export type CircleVariation = {
  analytics: CircleAnalytics;
  description: string;
  about: string;
  memberLabel: string;
  fallbackMemberFlavor: FallbackMemberFlavor[];
  fallbackPosts: FallbackCircleFeedPost[];
};

const ABOUT_TONES = {
  run: [
    "A fast-talking crew that treats consistency like a sport.",
    "Pace talk, shoe talk, and too much pride in split times.",
  ],
  cold: [
    "A tiny, intense group that celebrates terrible ideas with discipline.",
    "Short messages, cold water, and a weird amount of pride.",
  ],
  read: [
    "Quiet people who still somehow make a leaderboard feel dramatic.",
    "Slow, thoughtful energy with a surprising amount of streak jealousy.",
  ],
  gym: [
    "Loud, competitive, and deeply committed to proving they actually showed up.",
    "A circle built on reps, ego, and receipts.",
  ],
  default: [
    "A circle with its own rhythm, inside jokes, and a serious streak culture.",
    "Equal parts accountability group and social ritual.",
  ],
} as const;

const PROMPT_BANK = {
  run: [
    "Show the sweat, the shoes, or the finish line.",
    "Catch your post-run face before you recover.",
  ],
  cold: [
    "Show the water, the shiver, or the brave face after.",
    "Catch the exact second regret turns into pride.",
  ],
  read: [
    "Show the page, the margin note, or the reading corner.",
    "Give us the line that made you stop for a second.",
  ],
  gym: [
    "Show the rack, the rep, or the proof you touched a weight.",
    "Catch the set mid-lift or the aftermath right after.",
  ],
  default: [
    "Show the habit in motion, not just the setup.",
    "Catch the proof before it turns into a memory.",
  ],
} as const;

const CAPTION_BANK = {
  run: [
    "No masterpiece, just another honest run in the bag.",
    "Legs complained, streak stayed alive.",
  ],
  cold: [
    "Awful idea. Great streak decision.",
    "Still hate it. Still did it.",
  ],
  read: [
    "Nothing flashy, just pages turning again.",
    "The book won. I stayed with it.",
  ],
  gym: [
    "Not pretty, but the set happened.",
    "Proof of life, sweat, and questionable form.",
  ],
  default: [
    "Not dramatic, just done.",
    "Tiny proof. Real follow-through.",
  ],
} as const;

const MEMBER_ARCHETYPES = {
  run: [
    "sunrise pacer",
    "split-time goblin",
    "route collector",
  ],
  cold: [
    "ice-bath evangelist",
    "shiver comedian",
    "breathing coach",
  ],
  read: [
    "margin note hoarder",
    "quiet page grinder",
    "late-night chapter closer",
  ],
  gym: [
    "rack regular",
    "rep chaser",
    "set finisher",
  ],
  default: [
    "streak protector",
    "consistency merchant",
    "habit realist",
  ],
} as const;

const MEMBER_VIBES = {
  run: [
    "Always talking pace, form, and one more sunrise run.",
    "Treats every route like a small race against yesterday.",
  ],
  cold: [
    "Acts calm for exactly two seconds before the shiver hits.",
    "Turns a bad idea into a personality trait.",
  ],
  read: [
    "Has strong opinions about one page turning into ten more.",
    "Quiet until the book gets good, then impossible to stop.",
  ],
  gym: [
    "Lives for the extra rep and will mention the last set twice.",
    "Treats touching the rack like a moral victory.",
  ],
  default: [
    "Shows up with low drama and annoyingly solid follow-through.",
    "Makes consistency look less glamorous and more real.",
  ],
} as const;

const MEMBER_LABELS = {
  run: [
    "pace pack",
    "sunrise crew",
    "route regulars",
  ],
  cold: [
    "plunge crew",
    "shiver squad",
    "cold-water weirdos",
  ],
  read: [
    "page turners",
    "quiet crew",
    "chapter club",
  ],
  gym: [
    "rack crew",
    "rep squad",
    "lift circle",
  ],
  default: [
    "streak crew",
    "habit crew",
    "daily regulars",
  ],
} as const;

const POST_NAMES = ["Mia", "Theo", "Nina", "Jae", "Zoe", "Ravi", "Ella", "Kai"];
const WHEN_LABELS = ["12m ago", "28m ago", "1h ago", "2h ago", "4h ago"];

export function buildCircleVariation(input: CircleVariationInput): CircleVariation {
  const analytics = buildCircleAnalytics(input);
  const copy = buildCircleCopy(input);
  const fallbackMemberFlavor = buildFallbackMemberFlavor(input);
  const fallbackPosts = buildFallbackCircleFeedPosts(input);

  return {
    analytics,
    description: copy.description,
    about: copy.about,
    memberLabel: buildCircleMemberLabel(input),
    fallbackMemberFlavor,
    fallbackPosts,
  };
}

export function createSeededValueGenerator(seedKey: string) {
  const baseSeed = hash(seedKey);

  return (offset: number, min = 0, max = 1) => {
    const normalized = ((Math.sin(baseSeed + offset) + 1) / 2) % 1;
    return min + normalized * (max - min);
  };
}

export function buildCircleAnalytics(input: CircleVariationInput): CircleAnalytics {
  const pick = createSeededValueGenerator(`${input.circleId}:analytics`);
  const avgStreak = 7 + Math.round(pick(11, 0, 18));

  return {
    todayRate: round2(clamp(pick(0, 0.32, 0.82), 0.32, 0.92)),
    avgStreak,
    topStreak: avgStreak + 7 + Math.round(pick(23, 0, 19)),
    weekDaily: buildSeries(pick, 7, 31, 0.38, 0.94),
    trendLine: buildSeries(pick, 14, 59, 0.35, 0.96),
  };
}

export function buildCircleCopy(input: CircleVariationInput): CircleCopy {
  const tone = classifyHabit(input.habit);
  const pick = createSeededValueGenerator(`${input.circleId}:copy`);
  const aboutPool = ABOUT_TONES[tone];

  return {
    description: `${input.name} is built around ${input.habit.toLowerCase()} with ${input.memberCount} members keeping each other honest.`,
    about: aboutPool[Math.floor(pick(7, 0, aboutPool.length))] ?? ABOUT_TONES.default[0],
  };
}

export function buildFallbackMemberFlavor(input: CircleVariationInput): FallbackMemberFlavor[] {
  const tone = classifyHabit(input.habit);
  const pick = createSeededValueGenerator(`${input.circleId}:members`);
  const archetypePool = MEMBER_ARCHETYPES[tone];
  const vibePool = MEMBER_VIBES[tone];

  return Array.from({ length: 3 }, (_, index) => ({
    id: `${input.circleId}-member-${index + 1}`,
    name: POST_NAMES[Math.floor(pick(101 + index, 0, POST_NAMES.length))] ?? "Presence User",
    archetype:
      archetypePool[Math.floor(pick(151 + index, 0, archetypePool.length))] ??
      MEMBER_ARCHETYPES.default[0],
    vibe: vibePool[Math.floor(pick(201 + index, 0, vibePool.length))] ?? MEMBER_VIBES.default[0],
  }));
}

export function buildCircleMemberLabel(input: CircleVariationInput): string {
  const tone = classifyHabit(input.habit);
  const pick = createSeededValueGenerator(`${input.circleId}:member-label`);
  const labelPool = MEMBER_LABELS[tone];

  return labelPool[Math.floor(pick(231, 0, labelPool.length))] ?? MEMBER_LABELS.default[0];
}

export function buildFallbackCircleFeedPosts(
  input: CircleVariationInput,
): FallbackCircleFeedPost[] {
  const tone = classifyHabit(input.habit);
  const pick = createSeededValueGenerator(`${input.circleId}:posts`);
  const promptPool = PROMPT_BANK[tone];
  const captionPool = CAPTION_BANK[tone];
  const members = buildFallbackMemberFlavor(input);

  return Array.from({ length: 3 }, (_, index) => ({
    id: `${input.circleId}-fallback-${index + 1}`,
    name: members[index]?.name ?? "Presence User",
    when: WHEN_LABELS[Math.floor(pick(251 + index, 0, WHEN_LABELS.length))] ?? "1h ago",
    promptText: promptPool[index % promptPool.length] ?? PROMPT_BANK.default[0],
    caption: captionPool[index % captionPool.length] ?? CAPTION_BANK.default[0],
  }));
}

function classifyHabit(habit: string): keyof typeof ABOUT_TONES {
  const value = habit.toLowerCase();
  if (value.includes("run") || value.includes("5k")) return "run";
  if (value.includes("cold") || value.includes("plunge")) return "cold";
  if (value.includes("read") || value.includes("book") || value.includes("page")) return "read";
  if (value.includes("gym") || value.includes("lift") || value.includes("rack")) return "gym";
  return "default";
}

function buildSeries(
  pick: ReturnType<typeof createSeededValueGenerator>,
  length: number,
  baseOffset: number,
  min: number,
  max: number,
) {
  return Array.from({ length }, (_, index) =>
    round2(clamp(pick(baseOffset + index * 17, min, max), min, max)),
  );
}

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}
