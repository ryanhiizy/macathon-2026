import {
  SunriseIcon,
  DropletIcon,
  BookOpen01Icon,
  Yoga01Icon,
  RunningShoesIcon,
  Coffee02Icon,
  PaintBoardIcon,
} from "@hugeicons/core-free-icons";
import { Dumbbell01Icon, CookBookIcon } from "@hugeicons/core-free-icons";
import type { HugeiconsProps } from "@hugeicons/react-native";
import { colors } from "@/lib/theme";
import { supabase } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CircleView = {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  myStreak: number;
  icon: HugeiconsProps["icon"];
  accent: string;
};

export type CircleMemberView = {
  id: string;
  name: string;
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

const CIRCLE_CONFIG: Record<string, { icon: HugeiconsProps["icon"]; accent: string }> = {
  "c0000000-0000-0000-0000-000000000001": { icon: RunningShoesIcon, accent: colors.orange },  // 5K Every Day
  "c0000000-0000-0000-0000-000000000002": { icon: Yoga01Icon, accent: colors.purple },         // Morning Flow
  "c0000000-0000-0000-0000-000000000003": { icon: DropletIcon, accent: colors.cyan },           // Cold Plunge Club
  "c0000000-0000-0000-0000-000000000004": { icon: BookOpen01Icon, accent: colors.green },       // Page Turners
  "c0000000-0000-0000-0000-000000000005": { icon: SunriseIcon, accent: colors.yellow },         // Digital Sunset
  "c0000000-0000-0000-0000-000000000006": { icon: PaintBoardIcon, accent: colors.red },         // Sketch & Create
  "c0000000-0000-0000-0000-000000000007": { icon: CookBookIcon, accent: colors.orange },        // Kitchen Collective
  "c0000000-0000-0000-0000-000000000008": { icon: BookOpen01Icon, accent: colors.magenta },     // Morning Pages
  "c0000000-0000-0000-0000-000000000009": { icon: BookOpen01Icon, accent: colors.blue },        // Study Squad
  "c0000000-0000-0000-0000-000000000010": { icon: PaintBoardIcon, accent: colors.purple },      // Guitar Daily
  "c0000000-0000-0000-0000-000000000011": { icon: Dumbbell01Icon, accent: colors.red },         // Gym Rats
  "c0000000-0000-0000-0000-000000000012": { icon: DropletIcon, accent: colors.cyan },           // Hydration Club
  "c0000000-0000-0000-0000-000000000013": { icon: Yoga01Icon, accent: colors.purple },          // Meditation Circle
  "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee": { icon: SunriseIcon, accent: colors.orange },        // Morning Crew
};

const DEFAULT_CONFIG = { icon: SunriseIcon, accent: colors.primary };

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
    img("photo-1461896836934-bd45ba688b20"),
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
// Mock storage_path → Unsplash photo URL mapping
// ---------------------------------------------------------------------------

const PHOTO_MAP: Record<string, string> = {
  "mock/sarah-walk.jpg":    "photo-1551632811-561732d1e306",
  "mock/mia-yoga.jpg":      "photo-1544367567-0f2fcb009e0b",
  "mock/water-group.jpg":   "photo-1553531384-cc64ac80f931",
  "mock/nina-meditate.jpg": "photo-1506126613408-eca07ce68773",
  "mock/jae-book.jpg":      "photo-1544947950-fa07a98d237f",
  "mock/theo-plunge.jpg":   "photo-1504309092620-4d0ec726efa4",
  "mock/ava-sketch.jpg":    "photo-1513364776144-60967b0f800f",
  "mock/leo-run.jpg":       "photo-1542291026-7eec264c27ff",
  "mock/zoe-run.jpg":       "photo-1461896836934-bd45ba688b20",
  "mock/omar-nophone.jpg":  "photo-1507842217343-583bb7270b66",
  "mock/kai-guitar.jpg":    "photo-1510915361894-db8b60106cb1",
  "mock/ravi-cook.jpg":     "photo-1556910103-1c02745aae4d",
  "mock/ella-journal.jpg":  "photo-1517842645767-c639042777db",
  "mock/group-yoga.jpg":    "photo-1599901860904-17e6ed7083a0",
  "mock/group-run.jpg":     "photo-1552674605-db6ffd4facb5",
};

function storageToPhoto(path: string): { uri: string } {
  const unsplashId = PHOTO_MAP[path];
  if (unsplashId) {
    return { uri: `https://images.unsplash.com/${unsplashId}?w=800&h=800&fit=crop&q=80` };
  }
  // Fallback: use a proven working photo
  return { uri: `https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=800&fit=crop&q=80` };
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
    const config = circleConfig(c.id);
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      memberCount: countMap.get(c.id) ?? 0,
      myStreak: streakMap.get(c.id) ?? 0,
      icon: config.icon,
      accent: config.accent,
    };
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

  const config = circleConfig(circleId);
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    memberCount: count ?? 0,
    myStreak: 0,
    icon: config.icon,
    accent: config.accent,
  };
}

/**
 * Fetch all members of a circle, sorted by streak (descending).
 */
export async function fetchCircleMembers(circleId: string): Promise<CircleMemberView[]> {
  const { data, error } = await supabase
    .from("circle_members")
    .select("user_id, current_streak, profiles(id, display_name, avatar_url)")
    .eq("circle_id", circleId)
    .order("current_streak", { ascending: false });

  if (error || !data) {
    if (error) console.warn("[circles] members fetch error:", error.message);
    return [];
  }

  return data.map((row: any): CircleMemberView => {
    const profile = row.profiles;
    const name = profile?.display_name ?? "Unknown";
    return {
      id: row.user_id,
      name,
      letter: name[0]?.toUpperCase() ?? "?",
      color: userColor(row.user_id),
      streak: row.current_streak,
      avatarUrl: profile?.avatar_url ?? null,
    };
  });
}

/**
 * Fetch snaps (feed posts) for a circle.
 * Uses two queries to avoid PostgREST FK ambiguity
 * (snaps→profiles direct vs snaps→circles→profiles).
 */
export async function fetchCircleSnaps(circleId: string): Promise<CircleSnapView[]> {
  const { data: snapRows, error } = await supabase
    .from("snaps")
    .select("id, user_id, prompt_text, caption, storage_path, streak_after_completion, is_group_post, created_at")
    .eq("circle_id", circleId)
    .order("created_at", { ascending: false });

  if (error || !snapRows || snapRows.length === 0) {
    if (error) console.warn("[circles] snaps fetch error:", error.message);
    return [];
  }

  // Batch-fetch profiles for all snap authors
  const userIds = [...new Set(snapRows.map((s: any) => s.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", userIds);

  const profileMap = new Map(
    (profiles ?? []).map((p: any) => [p.id, p])
  );

  return snapRows.map((snap: any): CircleSnapView => {
    const profile = profileMap.get(snap.user_id);
    const name = profile?.display_name ?? "Unknown";
    return {
      id: snap.id,
      userId: snap.user_id,
      name,
      letter: name[0]?.toUpperCase() ?? "?",
      color: userColor(snap.user_id),
      streak: snap.streak_after_completion,
      promptText: snap.prompt_text,
      caption: snap.caption,
      photos: [storageToPhoto(snap.storage_path)],
      when: timeAgo(snap.created_at),
      isGroup: snap.is_group_post,
    };
  });
}
