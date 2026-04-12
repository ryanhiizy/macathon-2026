import { MOCK_USERS } from "@/lib/mock-users";
import type { FeedPost } from "@/lib/mock";
import { DEMO_USERS } from "@/lib/demo-users";
import { colors } from "@/lib/theme";
import { supabase } from "@/lib/supabase";

/**
 * Per-user social feeds. Each demo account sees a different mix:
 * - Some posts are shared across ALL users (mutual friends)
 * - Some posts overlap between 2-3 users
 * - Some posts are unique to one user
 *
 * Each post has a prompt_text (the challenge the user responded to)
 * and unique photos that match the prompt.
 */

// Sized Unsplash image helper
const img = (id: string) => ({
  uri: `https://images.unsplash.com/${id}?w=800&h=800&fit=crop&q=80`,
});

// --- Visibility setup ---

type TaggedPost = { post: FeedPost; visibleTo: string[] };

const JACK = DEMO_USERS[0].id;
const RYAN = DEMO_USERS[1].id;
const EMILY = DEMO_USERS[2].id;
const JOEL = DEMO_USERS[3].id;
const ALL = [JACK, RYAN, EMILY, JOEL];

const TAGGED_FEED: TaggedPost[] = [
  // === SHARED BY ALL (mutual friends: Sarah, Mia, Jae) ===
  {
    visibleTo: ALL,
    post: {
      id: "f0000000-0000-0000-0000-000000000001",
      kind: "solo",
      name: MOCK_USERS[0].name, // Sarah
      handle: "Morning walk",
      when: "12m ago",
      streak: 34,
      color: MOCK_USERS[0].color,
      letter: MOCK_USERS[0].letter,
      promptText: "Throw a peace sign mid-stride on your morning walk.",
      photos: [img("photo-1551632811-561732d1e306")],
      caption:
        "Golden hour hit different today. Woke up at 6, made it to the river by 6:30. Had the whole trail to myself.",
      likes: 24,
      comments: 3,
    },
  },
  {
    visibleTo: ALL,
    post: {
      id: "f0000000-0000-0000-0000-000000000002",
      kind: "solo",
      name: MOCK_USERS[1].name, // Mia
      handle: "Yoga flow",
      when: "1h ago",
      streak: 19,
      color: MOCK_USERS[1].color,
      letter: MOCK_USERS[1].letter,
      promptText: "Show your most peaceful stretch — ground level.",
      photos: [img("photo-1544367567-0f2fcb009e0b")],
      caption:
        "Morning flow before anyone else was awake. My mat, the sunrise, and ten uninterrupted minutes.",
      likes: 33,
      comments: 5,
    },
  },
  {
    visibleTo: ALL,
    post: {
      id: "f0000000-0000-0000-0000-000000000003",
      kind: "group",
      name: "Sarah, Mia + 1",
      handle: "Water check",
      when: "2h ago",
      promptText: "Cheers! Clink your water bottles together.",
      photos: [
        img("photo-1553531384-cc64ac80f931"),
        img("photo-1559839914-17aae19cec71"),
        img("photo-1548839140-29a749e1cf4d"),
      ],
      caption: "Mid-run hydration check. Miraculously all three of us remembered.",
      likes: 42,
      comments: 7,
      participants: [
        { color: MOCK_USERS[0].color, letter: MOCK_USERS[0].letter, name: "Sarah", streak: 34 },
        { color: MOCK_USERS[1].color, letter: MOCK_USERS[1].letter, name: "Mia", streak: 19 },
        { color: MOCK_USERS[2].color, letter: MOCK_USERS[2].letter, name: "Jae", streak: 14 },
      ],
    },
  },
  {
    visibleTo: ALL,
    post: {
      id: "f0000000-0000-0000-0000-000000000004",
      kind: "solo",
      name: MOCK_USERS[2].name, // Jae
      handle: "10 pages",
      when: "3h ago",
      streak: 47,
      color: MOCK_USERS[2].color,
      letter: MOCK_USERS[2].letter,
      promptText: "Hold up the book — reveal the cover.",
      photos: [img("photo-1544947950-fa07a98d237f"), img("photo-1512820790803-83ca734da794")],
      caption:
        "Finally started the new Ishiguro. It's slow in the best way — like the book is teaching me how to read it.",
      likes: 18,
      comments: 5,
    },
  },

  // === SHARED: Jack + Ryan (they follow Nina & Theo) ===
  {
    visibleTo: [JACK, RYAN],
    post: {
      id: "f0000000-0000-0000-0000-000000000005",
      kind: "solo",
      name: MOCK_USERS[4].name, // Nina
      handle: "Meditate",
      when: "2h ago",
      streak: 21,
      color: MOCK_USERS[4].color,
      letter: MOCK_USERS[4].letter,
      promptText: "Show your peaceful meditation corner.",
      photos: [img("photo-1506126613408-eca07ce68773")],
      caption:
        "21 days in a row. Didn't think I'd make it past day 5 honestly. The quiet is starting to feel natural.",
      likes: 31,
      comments: 4,
    },
  },
  {
    visibleTo: [JACK, RYAN],
    post: {
      id: "fp06",
      kind: "dispatch",
      name: "Nina",
      handle: "Meditate",
      when: "1h ago",
      color: MOCK_USERS[4].color,
      letter: MOCK_USERS[4].letter,
      streak: 21,
      value: "21",
      unit: "days of meditation",
      caption: "Three full weeks without missing. The calm is contagious.",
      likes: 18,
      comments: 4,
    },
  },
  {
    visibleTo: [JACK, RYAN],
    post: {
      id: "f0000000-0000-0000-0000-000000000007",
      kind: "solo",
      name: MOCK_USERS[3].name, // Theo
      handle: "Cold plunge",
      when: "4h ago",
      streak: 17,
      color: MOCK_USERS[3].color,
      letter: MOCK_USERS[3].letter,
      promptText: "Thumbs up from the cold — show us you survived.",
      photos: [img("photo-1504309092620-4d0ec726efa4")],
      caption:
        "Day 17 and I still hate getting in. But the 30 seconds after? Unmatched. Brain goes completely silent.",
      likes: 56,
      comments: 12,
    },
  },

  // === SHARED: Jack + Emily (they follow Ava & Leo) ===
  {
    visibleTo: [JACK, EMILY],
    post: {
      id: "f0000000-0000-0000-0000-000000000008",
      kind: "solo",
      name: MOCK_USERS[7].name, // Ava
      handle: "Sketch daily",
      when: "3h ago",
      streak: 15,
      color: MOCK_USERS[7].color,
      letter: MOCK_USERS[7].letter,
      promptText: "Hold up today's sketch — let us see the progress.",
      photos: [img("photo-1513364776144-60967b0f800f")],
      caption:
        "Quick gesture drawing at the cafe. The barista was a very patient subject (she didn't know).",
      likes: 42,
      comments: 8,
    },
  },
  {
    visibleTo: [JACK, EMILY],
    post: {
      id: "f0000000-0000-0000-0000-000000000009",
      kind: "solo",
      name: MOCK_USERS[8].name, // Leo
      handle: "Run 5K",
      when: "5h ago",
      streak: 9,
      color: MOCK_USERS[8].color,
      letter: MOCK_USERS[8].letter,
      promptText: "Show your running shoes — how worn are they getting?",
      photos: [img("photo-1542291026-7eec264c27ff"), img("photo-1460353581641-37baddab0fa2")],
      caption:
        "New PB! 23:41. Shaved off 12 seconds from last week. The consistency is finally compounding.",
      likes: 67,
      comments: 9,
    },
  },

  // === SHARED: Ryan + Emily (they follow Zoe & Kai) ===
  {
    visibleTo: [RYAN, EMILY],
    post: {
      id: "f0000000-0000-0000-0000-000000000010",
      kind: "solo",
      name: MOCK_USERS[9].name, // Zoe
      handle: "Run 5K",
      when: "4h ago",
      streak: 28,
      color: MOCK_USERS[9].color,
      letter: MOCK_USERS[9].letter,
      promptText: "Snap a selfie at the halfway mark — show us that runner's glow.",
      photos: [img("photo-1483721310020-03333e577078"), img("photo-1483721310020-03333e577078")],
      caption:
        "28 days straight. My shoes are begging for mercy but my legs finally stopped complaining.",
      likes: 71,
      comments: 9,
    },
  },
  {
    visibleTo: [RYAN, EMILY],
    post: {
      id: "fp11",
      kind: "dispatch",
      name: "Zoe",
      handle: "Run 5K",
      when: "3h ago",
      color: MOCK_USERS[9].color,
      letter: MOCK_USERS[9].letter,
      streak: 28,
      value: "28",
      unit: "days of running",
      caption: "A full month of 5Ks. Her longest streak yet — and she's still going.",
      likes: 42,
      comments: 7,
    },
  },
  {
    visibleTo: [RYAN, EMILY],
    post: {
      id: "f0000000-0000-0000-0000-000000000012",
      kind: "group",
      name: "Kai, Zoe + 2",
      handle: "Morning yoga",
      when: "5h ago",
      promptText: "All four — tree pose together, no wobbling!",
      photos: [
        img("photo-1599901860904-17e6ed7083a0"),
        img("photo-1588286840104-8957b019727f"),
        img("photo-1575052814086-f385e2e2ad33"),
        img("photo-1518611012118-696072aa579a"),
      ],
      caption: "Sunday morning flow in the park. Kai nearly fell asleep in savasana (again).",
      likes: 53,
      comments: 11,
      participants: [
        { color: MOCK_USERS[6].color, letter: MOCK_USERS[6].letter, name: "Kai", streak: 23 },
        { color: MOCK_USERS[9].color, letter: MOCK_USERS[9].letter, name: "Zoe", streak: 28 },
        { color: MOCK_USERS[4].color, letter: MOCK_USERS[4].letter, name: "Nina", streak: 21 },
        { color: MOCK_USERS[10].color, letter: MOCK_USERS[10].letter, name: "Ravi", streak: 8 },
      ],
    },
  },

  // === SHARED: Emily + Joel (they follow Ravi & Ella) ===
  {
    visibleTo: [EMILY, JOEL],
    post: {
      id: "f0000000-0000-0000-0000-000000000013",
      kind: "solo",
      name: MOCK_USERS[10].name, // Ravi
      handle: "Cook dinner",
      when: "6h ago",
      streak: 11,
      color: MOCK_USERS[10].color,
      letter: MOCK_USERS[10].letter,
      promptText: "Show the pot — what's bubbling tonight?",
      photos: [img("photo-1556910103-1c02745aae4d"), img("photo-1547592180-85f173990554")],
      caption:
        "Made dal from scratch tonight. My grandma's recipe, or at least my best guess at it from memory.",
      likes: 38,
      comments: 6,
    },
  },
  {
    visibleTo: [EMILY, JOEL],
    post: {
      id: "f0000000-0000-0000-0000-000000000014",
      kind: "solo",
      name: MOCK_USERS[11].name, // Ella
      handle: "Journal",
      when: "7h ago",
      streak: 44,
      color: MOCK_USERS[11].color,
      letter: MOCK_USERS[11].letter,
      promptText: "Open to today's page — just a peek.",
      photos: [img("photo-1517842645767-c639042777db")],
      caption:
        "44 days of morning pages. Most of it is garbage but occasionally I surprise myself. That's the deal.",
      likes: 29,
      comments: 3,
    },
  },
  {
    visibleTo: [EMILY, JOEL],
    post: {
      id: "fp15",
      kind: "dispatch",
      name: "Ella",
      handle: "Journal",
      when: "6h ago",
      color: MOCK_USERS[11].color,
      letter: MOCK_USERS[11].letter,
      streak: 44,
      value: "44",
      unit: "days of journaling",
      caption: "Morning pages, every single day. Proof that showing up is the whole game.",
      likes: 27,
      comments: 5,
    },
  },

  // === SHARED: Jack + Joel (they follow Omar) ===
  {
    visibleTo: [JACK, JOEL],
    post: {
      id: "f0000000-0000-0000-0000-000000000016",
      kind: "solo",
      name: MOCK_USERS[5].name, // Omar
      handle: "No phone hour",
      when: "3h ago",
      streak: 30,
      color: MOCK_USERS[5].color,
      letter: MOCK_USERS[5].letter,
      promptText: "Show us the phone in the drawer — prove it's locked away.",
      photos: [img("photo-1507842217343-583bb7270b66")],
      caption:
        "A whole month of putting the phone in a drawer after 9pm. I've read more books in 30 days than the last 6 months.",
      likes: 45,
      comments: 7,
    },
  },
  {
    visibleTo: [JACK, JOEL],
    post: {
      id: "fp17",
      kind: "dispatch",
      name: "Omar",
      handle: "No phone hour",
      when: "2h ago",
      color: MOCK_USERS[5].color,
      letter: MOCK_USERS[5].letter,
      streak: 30,
      value: "30",
      unit: "phone-free evenings",
      caption: "Digital sunset, every single night. His screen time is down 60%.",
      likes: 35,
      comments: 6,
    },
  },

  // === JOEL only (follows Kai) ===
  {
    visibleTo: [JOEL],
    post: {
      id: "f0000000-0000-0000-0000-000000000018",
      kind: "solo",
      name: MOCK_USERS[6].name, // Kai
      handle: "Guitar practice",
      when: "5h ago",
      streak: 23,
      color: MOCK_USERS[6].color,
      letter: MOCK_USERS[6].letter,
      promptText: "Show your fingers on the fretboard — chord of the day.",
      photos: [img("photo-1510915361894-db8b60106cb1"), img("photo-1511671782779-c97d3d27a1d4")],
      caption:
        "Finally nailed the barre chord transition. 23 days of 15 minutes doesn't sound like much until it suddenly clicks.",
      likes: 34,
      comments: 6,
    },
  },

  // === RYAN only (group run with Leo & Theo) ===
  {
    visibleTo: [RYAN],
    post: {
      id: "f0000000-0000-0000-0000-000000000019",
      kind: "group",
      name: "Leo, Theo + 1",
      handle: "5K club",
      when: "6h ago",
      promptText: "All three — throw your hands up at the finish line.",
      photos: [
        img("photo-1552674605-db6ffd4facb5"),
        img("photo-1476480862126-209bfaa8edc8"),
        img("photo-1571008887538-b36bb32f4571"),
      ],
      caption: "Nobody wanted to go but we all showed up anyway. That's the circle magic.",
      likes: 71,
      comments: 14,
      participants: [
        { color: MOCK_USERS[8].color, letter: MOCK_USERS[8].letter, name: "Leo", streak: 9 },
        { color: MOCK_USERS[3].color, letter: MOCK_USERS[3].letter, name: "Theo", streak: 17 },
        { color: colors.purple, letter: "R", name: "Ryan", streak: 31 },
      ],
    },
  },
];

/**
 * Per-user feed ordering. The first few posts are unique/different per account
 * so switching users immediately looks distinct. Shared posts come later.
 */
const S = (n: string) => `f0000000-0000-0000-0000-0000000000${n}`;

const FEED_ORDER: Record<string, string[]> = {
  [JACK]: [
    S("05"), // Nina meditate
    S("08"), // Ava sketch
    S("16"), // Omar no phone
    S("01"), // Sarah walk (all)
    S("03"), // group water check (all)
    "fp06", // Nina milestone
    S("02"), // Mia yoga (all)
    S("07"), // Theo cold plunge
    S("09"), // Leo run
    S("04"), // Jae 10 pages (all)
    "fp17", // Omar milestone
  ],
  [RYAN]: [
    S("07"), // Theo cold plunge
    S("19"), // Leo+Theo+Ryan group run
    S("10"), // Zoe run
    S("01"), // Sarah walk (all)
    S("05"), // Nina meditate
    S("03"), // group water check (all)
    "fp11", // Zoe milestone
    "fp06", // Nina milestone
    S("02"), // Mia yoga (all)
    S("12"), // Kai+Zoe group yoga
    S("04"), // Jae 10 pages (all)
  ],
  [EMILY]: [
    S("10"), // Zoe run
    S("13"), // Ravi cook
    S("08"), // Ava sketch
    S("01"), // Sarah walk (all)
    S("12"), // Kai+Zoe group yoga
    "fp11", // Zoe milestone
    S("02"), // Mia yoga (all)
    S("14"), // Ella journal
    S("03"), // group water check (all)
    S("09"), // Leo run
    "fp15", // Ella milestone
    S("04"), // Jae 10 pages (all)
  ],
  [JOEL]: [
    S("18"), // Kai guitar
    S("16"), // Omar no phone
    S("13"), // Ravi cook
    S("01"), // Sarah walk (all)
    "fp17", // Omar milestone
    S("14"), // Ella journal
    S("03"), // group water check (all)
    S("02"), // Mia yoga (all)
    "fp15", // Ella milestone
    S("04"), // Jae 10 pages (all)
  ],
};

/**
 * Returns feed posts for a specific demo user in their custom order.
 * First few posts are always different per account.
 */
export function getFeedPosts(userId?: string): FeedPost[] {
  const postMap = new Map(TAGGED_FEED.map((t) => [t.post.id, t.post]));

  if (!userId) {
    return TAGGED_FEED.filter((t) => t.visibleTo.length === 4).map((t) => t.post);
  }

  const order = FEED_ORDER[userId];
  if (order) {
    return order.map((id) => postMap.get(id)).filter((p): p is FeedPost => p !== undefined);
  }

  // Unknown user: show all visible posts in default order
  return TAGGED_FEED.filter((t) => t.visibleTo.includes(userId)).map((t) => t.post);
}

type SnapRow = {
  id: string;
  user_id: string;
  habit_instance_id: string;
  storage_path: string;
  prompt_text: string;
  caption: string | null;
  streak_after_completion: number;
  created_at: string;
  is_group_post: boolean;
};

type ProfileRow = {
  id: string;
  display_name: string;
  handle: string;
};

type HabitInstanceFeedRow = {
  id: string;
  habit_id: string;
};

type HabitRow = {
  id: string;
  name: string;
};

const REAL_FEED_COLORS = [
  colors.blue,
  colors.green,
  colors.cyan,
  colors.orange,
  colors.purple,
  colors.magenta,
];

function colorForUser(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return REAL_FEED_COLORS[hash % REAL_FEED_COLORS.length];
}

function formatWhen(timestamp: string) {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.max(1, Math.floor(diffMs / (60 * 1000)));

  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

async function fetchRecentRealFeedPosts(userId?: string): Promise<FeedPost[]> {
  if (!userId) {
    return [];
  }

  const { data: snaps, error: snapError } = await supabase
    .from("snaps")
    .select(
      "id, user_id, habit_instance_id, storage_path, prompt_text, caption, streak_after_completion, created_at, is_group_post",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (snapError || !snaps?.length) {
    return [];
  }

  const snapRows = snaps as SnapRow[];
  const habitInstanceIds = [...new Set(snapRows.map((snap) => snap.habit_instance_id))];
  const profileIds = [...new Set(snapRows.map((snap) => snap.user_id))];

  const [{ data: profiles }, { data: habitInstances }] = await Promise.all([
    supabase.from("profiles").select("id, display_name, handle").in("id", profileIds),
    supabase.from("habit_instances").select("id, habit_id").in("id", habitInstanceIds),
  ]);

  const habitIds = [...new Set((habitInstances ?? []).map((item) => item.habit_id))];
  const { data: habits } = await supabase.from("habits").select("id, name").in("id", habitIds);

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile as ProfileRow]));
  const habitInstanceMap = new Map(
    (habitInstances ?? []).map((instance) => [instance.id, instance as HabitInstanceFeedRow]),
  );
  const habitMap = new Map((habits ?? []).map((habit) => [habit.id, habit as HabitRow]));

  return snapRows
    .filter((snap) => !snap.is_group_post)
    .map((snap) => {
      const profile = profileMap.get(snap.user_id);
      const habitInstance = habitInstanceMap.get(snap.habit_instance_id);
      const habit = habitInstance ? habitMap.get(habitInstance.habit_id) : null;
      const displayName = profile?.display_name || "Presence User";
      const publicUrl = supabase.storage.from("snaps").getPublicUrl(snap.storage_path).data.publicUrl;

      return {
        id: snap.id,
        kind: "solo" as const,
        name: displayName,
        handle: habit?.name || "Habit check-in",
        when: formatWhen(snap.created_at),
        streak: snap.streak_after_completion,
        color: colorForUser(snap.user_id),
        letter: displayName.slice(0, 1).toUpperCase() || "P",
        photos: [{ uri: publicUrl }],
        promptText: snap.prompt_text || undefined,
        caption: snap.caption || `Checked in for ${habit?.name ?? "your habit"}.`,
        likes: 0,
        comments: 0,
      };
    });
}

export async function loadFeedPosts(userId?: string): Promise<FeedPost[]> {
  const [realPosts, mockPosts] = await Promise.all([
    fetchRecentRealFeedPosts(userId),
    Promise.resolve(getFeedPosts(userId)),
  ]);

  return [...realPosts, ...mockPosts];
}
