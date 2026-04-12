import {
  SunriseIcon,
  DropletIcon,
  BookOpen01Icon,
  Yoga01Icon,
  RunningShoesIcon,
  PaintBoardIcon,
} from "@hugeicons/core-free-icons";
import { Dumbbell01Icon, CookBookIcon } from "@hugeicons/core-free-icons";
import type { HugeiconsProps } from "@hugeicons/react-native";
import { buildCircleVariation } from "@/lib/circle-variation";
import { mergeCircleSnapsForFeed, resolveCircleSnapPhoto } from "./circle-snap-utils";
import { colors } from "@/lib/theme";
import { supabase } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CircleAnalytics = {
  todayRate: number;
  avgStreak: number;
  topStreak: number;
  weekDaily: number[];
  trendLine: number[];
};

export type CircleView = {
  id: string;
  name: string;
  habit: string;
  description: string | null;
  about: string;
  memberLabel: string;
  members: number;
  myStreak: number;
  icon: HugeiconsProps["icon"];
  accent: string;
  analytics: CircleAnalytics;
};

export type CircleMemberView = {
  id: string;
  name: string;
  handle: string;
  vibe?: string;
  letter: string;
  color: string;
  streak: number;
  avatarUrl: string | null;
};

export type CircleSnapView = {
  id: string;
  userId: string;
  name: string;
  letter: string;
  color: string;
  streak: number;
  promptText: string;
  caption: string | null;
  photos: { uri: string }[];
  when: string;
  isGroup: boolean;
};

// ---------------------------------------------------------------------------
// Circle → icon / accent config (not stored in DB)
// ---------------------------------------------------------------------------

type CircleConfigEntry = { icon: HugeiconsProps["icon"]; accent: string; habit: string };

const CIRCLE_CONFIG: Record<string, CircleConfigEntry> = {
  "c0000000-0000-0000-0000-000000000001": { icon: RunningShoesIcon, accent: colors.orange, habit: "Run 5 kilometers" },
  "c0000000-0000-0000-0000-000000000002": { icon: Yoga01Icon, accent: colors.purple, habit: "10 minutes of yoga" },
  "c0000000-0000-0000-0000-000000000003": { icon: DropletIcon, accent: colors.cyan, habit: "Cold plunge" },
  "c0000000-0000-0000-0000-000000000004": { icon: BookOpen01Icon, accent: colors.green, habit: "Read 10 pages" },
  "c0000000-0000-0000-0000-000000000005": { icon: SunriseIcon, accent: colors.yellow, habit: "No phone after 9pm" },
  "c0000000-0000-0000-0000-000000000006": { icon: PaintBoardIcon, accent: colors.red, habit: "Sketch daily" },
  "c0000000-0000-0000-0000-000000000007": { icon: CookBookIcon, accent: colors.orange, habit: "Cook dinner" },
  "c0000000-0000-0000-0000-000000000008": { icon: BookOpen01Icon, accent: colors.magenta, habit: "Morning pages" },
  "c0000000-0000-0000-0000-000000000009": { icon: BookOpen01Icon, accent: colors.blue, habit: "Study 1 hour" },
  "c0000000-0000-0000-0000-000000000010": { icon: PaintBoardIcon, accent: colors.purple, habit: "15 min guitar" },
  "c0000000-0000-0000-0000-000000000011": { icon: Dumbbell01Icon, accent: colors.red, habit: "Hit the gym" },
  "c0000000-0000-0000-0000-000000000012": { icon: DropletIcon, accent: colors.cyan, habit: "Drink 2L of water" },
  "c0000000-0000-0000-0000-000000000013": { icon: Yoga01Icon, accent: colors.purple, habit: "10 min meditation" },
  "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee": { icon: SunriseIcon, accent: colors.orange, habit: "Morning walk" },
};

const DEFAULT_CONFIG: CircleConfigEntry = { icon: SunriseIcon, accent: colors.primary, habit: "Daily habit" };

function circleConfig(id: string) {
  return CIRCLE_CONFIG[id] ?? DEFAULT_CONFIG;
}

// ---------------------------------------------------------------------------
// Per-circle preview photos (shown on the circles list)
// ---------------------------------------------------------------------------

const img = (id: string) =>
  `https://images.unsplash.com/${id}?w=400&h=400&fit=crop&q=80`;

// IMPORTANT: Only use Unsplash photo IDs already proven to load in feed.ts.
const CIRCLE_PHOTOS: Record<string, string[]> = {
  "c0000000-0000-0000-0000-000000000001": [ // 5K Every Day
    img("photo-1552674605-db6ffd4facb5"),
    img("photo-1483721310020-03333e577078"),
    img("photo-1542291026-7eec264c27ff"),
    img("photo-1460353581641-37baddab0fa2"),
  ],
  "c0000000-0000-0000-0000-000000000002": [ // Morning Flow
    img("photo-1544367567-0f2fcb009e0b"),
    img("photo-1599901860904-17e6ed7083a0"),
    img("photo-1575052814086-f385e2e2ad33"),
    img("photo-1518611012118-696072aa579a"),
  ],
  "c0000000-0000-0000-0000-000000000003": [ // Cold Plunge Club
    img("photo-1504309092620-4d0ec726efa4"),
    img("photo-1507003211169-0a1dd7228f2d"),
    img("photo-1499209974431-9dddcece7f88"),
    img("photo-1551632811-561732d1e306"),
  ],
  "c0000000-0000-0000-0000-000000000004": [ // Page Turners
    img("photo-1544947950-fa07a98d237f"),
    img("photo-1512820790803-83ca734da794"),
    img("photo-1517842645767-c639042777db"),
    img("photo-1507842217343-583bb7270b66"),
  ],
  "c0000000-0000-0000-0000-000000000005": [ // Digital Sunset
    img("photo-1507842217343-583bb7270b66"),
    img("photo-1499209974431-9dddcece7f88"),
    img("photo-1512820790803-83ca734da794"),
    img("photo-1517842645767-c639042777db"),
  ],
  "c0000000-0000-0000-0000-000000000006": [ // Sketch & Create
    img("photo-1513364776144-60967b0f800f"),
    img("photo-1544947950-fa07a98d237f"),
    img("photo-1507003211169-0a1dd7228f2d"),
    img("photo-1512820790803-83ca734da794"),
  ],
  "c0000000-0000-0000-0000-000000000007": [ // Kitchen Collective
    img("photo-1556910103-1c02745aae4d"),
    img("photo-1547592180-85f173990554"),
    img("photo-1504384308090-c894fdcc538d"),
    img("photo-1500382017468-9049fed747ef"),
  ],
  "c0000000-0000-0000-0000-000000000008": [ // Morning Pages
    img("photo-1517842645767-c639042777db"),
    img("photo-1512820790803-83ca734da794"),
    img("photo-1544947950-fa07a98d237f"),
    img("photo-1507842217343-583bb7270b66"),
  ],
  "c0000000-0000-0000-0000-000000000009": [ // Study Squad
    img("photo-1512820790803-83ca734da794"),
    img("photo-1544947950-fa07a98d237f"),
    img("photo-1517842645767-c639042777db"),
    img("photo-1507003211169-0a1dd7228f2d"),
  ],
  "c0000000-0000-0000-0000-000000000010": [ // Guitar Daily
    img("photo-1510915361894-db8b60106cb1"),
    img("photo-1511671782779-c97d3d27a1d4"),
    img("photo-1507003211169-0a1dd7228f2d"),
    img("photo-1499209974431-9dddcece7f88"),
  ],
  "c0000000-0000-0000-0000-000000000011": [ // Gym Rats
    img("photo-1571008887538-b36bb32f4571"),
    img("photo-1552674605-db6ffd4facb5"),
    img("photo-1476480862126-209bfaa8edc8"),
    img("photo-1460353581641-37baddab0fa2"),
  ],
  "c0000000-0000-0000-0000-000000000012": [ // Hydration Club
    img("photo-1553531384-cc64ac80f931"),
    img("photo-1559839914-17aae19cec71"),
    img("photo-1548839140-29a749e1cf4d"),
    img("photo-1506748686214-e9df14d4d9d0"),
  ],
  "c0000000-0000-0000-0000-000000000013": [ // Meditation Circle
    img("photo-1506126613408-eca07ce68773"),
    img("photo-1593811167562-9cef47bfc4d7"),
    img("photo-1499209974431-9dddcece7f88"),
    img("photo-1544367567-0f2fcb009e0b"),
  ],
  "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee": [ // Morning Crew
    img("photo-1551632811-561732d1e306"),
    img("photo-1500382017468-9049fed747ef"),
    img("photo-1506748686214-e9df14d4d9d0"),
    img("photo-1504384308090-c894fdcc538d"),
  ],
};

/** Get 4 preview photos for a circle (used on the circles list). */
export function circlePhotos(circleId: string): string[] {
  return CIRCLE_PHOTOS[circleId] ?? [
    img("photo-1551632811-561732d1e306"),
    img("photo-1500382017468-9049fed747ef"),
    img("photo-1506748686214-e9df14d4d9d0"),
    img("photo-1504384308090-c894fdcc538d"),
  ];
}

// ---------------------------------------------------------------------------
// User color mapping (matches demo-users.ts and mock-users.ts)
// ---------------------------------------------------------------------------

const USER_COLORS: Record<string, string> = {
  "d0000000-0000-0000-0000-000000000001": colors.primary, // Jack
  "d0000000-0000-0000-0000-000000000002": colors.orange,  // Ryan
  "d0000000-0000-0000-0000-000000000003": colors.green,   // Emily
  "d0000000-0000-0000-0000-000000000004": colors.blue,    // Joel
  "a0000000-0000-0000-0000-000000000001": colors.blue,    // Sarah
  "a0000000-0000-0000-0000-000000000002": colors.green,   // Mia
  "a0000000-0000-0000-0000-000000000003": colors.cyan,    // Jae
  "a0000000-0000-0000-0000-000000000004": colors.orange,  // Theo
  "a0000000-0000-0000-0000-000000000005": colors.magenta, // Nina
  "a0000000-0000-0000-0000-000000000006": colors.yellow,  // Omar
  "a0000000-0000-0000-0000-000000000007": colors.purple,  // Kai
  "a0000000-0000-0000-0000-000000000008": colors.red,     // Ava
  "a0000000-0000-0000-0000-000000000009": colors.orange,  // Leo
  "a0000000-0000-0000-0000-000000000010": colors.cyan,    // Zoe
  "a0000000-0000-0000-0000-000000000011": colors.green,   // Ravi
  "a0000000-0000-0000-0000-000000000012": colors.magenta, // Ella
};

function userColor(id: string): string {
  return USER_COLORS[id] ?? colors.primary;
}

// ---------------------------------------------------------------------------
// Relative time helper
// ---------------------------------------------------------------------------

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const FALLBACK_MEMBER_COLORS = [
  colors.blue,
  colors.green,
  colors.orange,
  colors.purple,
  colors.cyan,
  colors.magenta,
];

function buildVariationInput({
  circleId,
  name,
  habit,
  memberCount,
}: {
  circleId: string;
  name: string;
  habit: string;
  memberCount: number;
}) {
  return buildCircleVariation({
    circleId,
    name,
    habit,
    memberCount,
  });
}

function hasUsefulDescription(description: string | null | undefined): description is string {
  if (!description) return false;
  const normalized = description.trim();
  if (normalized.length < 28) return false;
  return !/daily habit|habit group|show up daily/i.test(normalized);
}

function buildCircleView({
  circleId,
  name,
  description,
  memberCount,
  myStreak,
}: {
  circleId: string;
  name: string;
  description: string | null;
  memberCount: number;
  myStreak: number;
}): CircleView {
  const config = circleConfig(circleId);
  const variation = buildVariationInput({
    circleId,
    name,
    habit: config.habit,
    memberCount,
  });

  return {
    id: circleId,
    name,
    habit: config.habit,
    description: hasUsefulDescription(description) ? description.trim() : variation.description,
    about: variation.about,
    memberLabel: variation.memberLabel,
    members: memberCount,
    myStreak,
    icon: config.icon,
    accent: config.accent,
    analytics: variation.analytics,
  };
}

function buildFallbackMembers({
  circleId,
  habit,
  memberCount,
  existingMembers,
}: {
  circleId: string;
  habit: string;
  memberCount: number;
  existingMembers: CircleMemberView[];
}): CircleMemberView[] {
  if (existingMembers.length === 0) {
    return existingMembers;
  }

  const variation = buildVariationInput({
    circleId,
    name: circleId,
    habit,
    memberCount,
  });
  return existingMembers.map((member, index) => {
    const flavor = variation.fallbackMemberFlavor[index % variation.fallbackMemberFlavor.length];
    return {
      ...member,
      handle: member.handle || (flavor ? `@${flavor.archetype.replace(/\s+/g, "-")}-${index + 1}` : ""),
      vibe: member.vibe ?? flavor?.vibe,
      color: member.color || FALLBACK_MEMBER_COLORS[index % FALLBACK_MEMBER_COLORS.length] || colors.primary,
    };
  });
}

function buildFallbackSnaps({
  circleId,
  habit,
  realCount,
}: {
  circleId: string;
  habit: string;
  realCount: number;
}): CircleSnapView[] {
  const variation = buildVariationInput({
    circleId,
    name: circleId,
    habit,
    memberCount: realCount,
  });
  const photos = circlePhotos(circleId);

  return variation.fallbackPosts.map((post, index): CircleSnapView => {
    const isGroup = index === 1;
    const photoIndex = index % photos.length;
    const primaryPhoto = photos[photoIndex] ?? photos[0];
    const secondaryPhoto = photos[(photoIndex + 1) % photos.length] ?? photos[0];

    return {
      id: post.id,
      userId: `${circleId}-fallback-user-${index + 1}`,
      name: post.name,
      letter: post.name[0]?.toUpperCase() ?? "?",
      color: FALLBACK_MEMBER_COLORS[index % FALLBACK_MEMBER_COLORS.length] ?? colors.primary,
      streak: Math.max(2, variation.analytics.avgStreak - index * 3),
      promptText: post.promptText,
      caption: post.caption,
      photos: isGroup ? [{ uri: primaryPhoto }, { uri: secondaryPhoto }] : [{ uri: primaryPhoto }],
      when: post.when,
      isGroup,
    };
  });
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Fetch all circles the current user belongs to.
 */
export async function fetchMyCircles(userId: string): Promise<CircleView[]> {
  // Get user's circle memberships
  const { data: memberships, error } = await supabase
    .from("circle_members")
    .select("circle_id, current_streak")
    .eq("user_id", userId);

  if (error || !memberships || memberships.length === 0) {
    if (error) console.warn("[circles] membership fetch error:", error.message);
    return [];
  }

  const circleIds = memberships.map((m: { circle_id: string }) => m.circle_id);
  const streakMap = new Map(
    memberships.map((m: { circle_id: string; current_streak: number }) => [m.circle_id, m.current_streak])
  );

  // Get circle details
  const { data: circlesData, error: circlesError } = await supabase
    .from("circles")
    .select("id, name, description")
    .in("id", circleIds);

  if (circlesError || !circlesData) {
    console.warn("[circles] circles fetch error:", circlesError?.message);
    return [];
  }

  // Get member counts
  const { data: counts } = await supabase
    .from("circle_members")
    .select("circle_id")
    .in("circle_id", circleIds);

  const countMap = new Map<string, number>();
  (counts ?? []).forEach((row: { circle_id: string }) => {
    countMap.set(row.circle_id, (countMap.get(row.circle_id) ?? 0) + 1);
  });

  return circlesData.map((c: { id: string; name: string; description: string | null }): CircleView => {
    const memberCount = countMap.get(c.id) ?? 0;
    return buildCircleView({
      circleId: c.id,
      name: c.name,
      description: c.description,
      memberCount,
      myStreak: streakMap.get(c.id) ?? 0,
    });
  });
}

/**
 * Fetch a single circle by ID with its display config.
 */
export async function fetchCircle(circleId: string): Promise<CircleView | null> {
  const { data, error } = await supabase
    .from("circles")
    .select("id, name, description")
    .eq("id", circleId)
    .single();

  if (error || !data) return null;

  const { count } = await supabase
    .from("circle_members")
    .select("*", { count: "exact", head: true })
    .eq("circle_id", circleId);

  const memberCount = count ?? 0;
  return buildCircleView({
    circleId,
    name: data.name,
    description: data.description,
    memberCount,
    myStreak: 0,
  });
}

/**
 * Fetch all members of a circle, sorted by streak (descending).
 */
export async function fetchCircleMembers(circleId: string): Promise<CircleMemberView[]> {
  const config = circleConfig(circleId);
  const { data, error } = await supabase
    .from("circle_members")
    .select("user_id, current_streak, profiles(id, display_name, handle, avatar_url)")
    .eq("circle_id", circleId)
    .order("current_streak", { ascending: false });

  if (error || !data) {
    if (error) console.warn("[circles] members fetch error:", error.message);
    return [];
  }

  const members = data.map((row: any): CircleMemberView => {
    const profile = row.profiles;
    const name = profile?.display_name ?? "Unknown";
    return {
      id: row.user_id,
      name,
      handle: profile?.handle ? `@${profile.handle}` : "",
      vibe: undefined,
      letter: name[0]?.toUpperCase() ?? "?",
      color: userColor(row.user_id),
      streak: row.current_streak,
      avatarUrl: profile?.avatar_url ?? null,
    };
  });

  return buildFallbackMembers({
    circleId,
    habit: config.habit,
    memberCount: members.length,
    existingMembers: members,
  });
}

/**
 * Fetch snaps (feed posts) for a circle.
 * Uses two queries to avoid PostgREST FK ambiguity
 * (snaps→profiles direct vs snaps→circles→profiles).
 */
export async function fetchCircleSnaps(circleId: string): Promise<CircleSnapView[]> {
  const config = circleConfig(circleId);
  const { data: snapRows, error } = await supabase
    .from("snaps")
    .select("id, user_id, prompt_text, caption, storage_path, streak_after_completion, is_group_post, created_at")
    .eq("circle_id", circleId)
    .order("created_at", { ascending: false });

  if (error) {
    if (error) console.warn("[circles] snaps fetch error:", error.message);
    return buildFallbackSnaps({
      circleId,
      habit: config.habit,
      realCount: 0,
    });
  }

  // Batch-fetch profiles for all snap authors
  const userIds = [...new Set((snapRows ?? []).map((s: any) => s.user_id))];
  const { data: profiles } = userIds.length === 0
    ? { data: [] }
    : await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
  const realSnaps = (snapRows ?? []).map((snap: any): CircleSnapView => {
    const profile = profileMap.get(snap.user_id);
    const name = profile?.display_name ?? "Unknown";
    const storagePublicUrl = supabase.storage
      .from("snaps")
      .getPublicUrl(snap.storage_path).data.publicUrl;
    return {
      id: snap.id,
      userId: snap.user_id,
      name,
      letter: name[0]?.toUpperCase() ?? "?",
      color: userColor(snap.user_id),
      streak: snap.streak_after_completion,
      promptText: snap.prompt_text,
      caption: snap.caption,
      photos: [resolveCircleSnapPhoto(snap.storage_path, storagePublicUrl)],
      when: timeAgo(snap.created_at),
      isGroup: snap.is_group_post,
    };
  });
  const fallbackSnaps = buildFallbackSnaps({
    circleId,
    habit: config.habit,
    realCount: realSnaps.length,
  }).filter((fallbackSnap) => !realSnaps.some((realSnap) => realSnap.id === fallbackSnap.id));

  return mergeCircleSnapsForFeed(realSnaps, fallbackSnaps);
}
