import { DEMO_USERS } from "@/lib/demo-users";
import { MOCK_USERS } from "@/lib/mock-users";
import { colors } from "@/lib/theme";
import {
  SunriseIcon,
  DropletIcon,
  BookOpen01Icon,
  Yoga01Icon,
  RunningShoesIcon,
  Coffee02Icon,
} from "@hugeicons/core-free-icons";
import type { CircleRow } from "@/lib/mock";

/**
 * Per-user circle data, mirroring the per-user feed pattern from feed.ts.
 *
 * Circle visibility per demo user (matching their stats.circles counts):
 *   Jack (4): Morning Crew, 5K Club, Mindful Minutes, Slow Mornings
 *   Ryan (3): Morning Crew, 5K Club, Hydration Squad
 *   Emily (5): Morning Crew, 5K Club, Mindful Minutes, Hydration Squad, Page Turners
 *   Joel (2): Morning Crew, Slow Mornings
 */

const JACK = DEMO_USERS[0].id;
const RYAN = DEMO_USERS[1].id;
const EMILY = DEMO_USERS[2].id;
const JOEL = DEMO_USERS[3].id;
const ALL = [JACK, RYAN, EMILY, JOEL];

// ── Member type ──────────────────────────────────────────────

export type CircleMember = {
  id: string;
  name: string;
  letter: string;
  color: string;
  streak: number;
};

// Helpers to build members from demo / mock user pools
const demo = (i: number, streak: number): CircleMember => ({
  id: DEMO_USERS[i].id,
  name: DEMO_USERS[i].name,
  letter: DEMO_USERS[i].name[0],
  color: DEMO_USERS[i].color,
  streak,
});

const mock = (i: number, streak: number): CircleMember => ({
  id: MOCK_USERS[i].id,
  name: MOCK_USERS[i].name,
  letter: MOCK_USERS[i].letter,
  color: MOCK_USERS[i].color,
  streak,
});

// ── Circle definitions ───────────────────────────────────────

type CircleWithMeta = {
  circle: CircleRow;
  members: CircleMember[];
  visibleTo: string[];
};

const CIRCLE_DATA: CircleWithMeta[] = [
  // ── 1. Morning Crew — all 4 demo users + randoms ──────────
  {
    visibleTo: ALL,
    circle: {
      id: "c1",
      name: "Morning Crew",
      habit: "Morning walk",
      members: 23,
      streak: 12,
      icon: SunriseIcon,
      accent: colors.orange,
      description:
        "We greet the sun every morning. A walk, a run, or just standing outside — the point is showing up before the world gets loud.",
    },
    members: [
      demo(0, 12), // Jack
      demo(2, 18), // Emily
      demo(1, 9),  // Ryan
      demo(3, 6),  // Joel
      mock(0, 34), // Sarah
      mock(1, 19), // Mia
      mock(2, 14), // Jae
      mock(4, 21), // Nina
      mock(3, 17), // Theo
    ],
  },

  // ── 2. 5K Club — Jack, Ryan, Emily + randoms ─────────────
  {
    visibleTo: [JACK, RYAN, EMILY],
    circle: {
      id: "c2",
      name: "5K Every Day",
      habit: "Run 5 kilometers",
      members: 142,
      streak: 9,
      icon: RunningShoesIcon,
      accent: colors.red,
      description:
        "We lace up every morning, rain or shine. Five kilometers a day keeps the couch away.",
    },
    members: [
      mock(9, 28),  // Zoe
      demo(1, 31),  // Ryan
      demo(0, 14),  // Jack
      demo(2, 22),  // Emily
      mock(8, 9),   // Leo
      mock(3, 17),  // Theo
      mock(10, 8),  // Ravi
      mock(5, 12),  // Omar
    ],
  },

  // ── 3. Mindful Minutes — Jack, Emily + randoms ────────────
  {
    visibleTo: [JACK, EMILY],
    circle: {
      id: "c3",
      name: "Mindful Minutes",
      habit: "10 minutes of meditation",
      members: 47,
      streak: 23,
      icon: Yoga01Icon,
      accent: colors.purple,
      description:
        "A gentle daily pause. Ten minutes, eyes closed, no phone. Show up and breathe.",
    },
    members: [
      demo(2, 63),  // Emily
      demo(0, 23),  // Jack
      mock(4, 21),  // Nina
      mock(6, 23),  // Kai
      mock(1, 15),  // Mia
      mock(11, 44), // Ella
    ],
  },

  // ── 4. Hydration Squad — Ryan, Emily + randoms ────────────
  {
    visibleTo: [RYAN, EMILY],
    circle: {
      id: "c4",
      name: "Hydration Squad",
      habit: "Drink 2L of water",
      members: 89,
      streak: 5,
      icon: DropletIcon,
      accent: colors.cyan,
      description:
        "Two litres a day. Proof by bottle, ideally mid-sip. Stay hydrated, stay accountable.",
    },
    members: [
      demo(2, 11),  // Emily
      demo(1, 5),   // Ryan
      mock(1, 19),  // Mia
      mock(2, 14),  // Jae
      mock(7, 8),   // Ava
      mock(8, 6),   // Leo
      mock(9, 28),  // Zoe
    ],
  },

  // ── 5. Page Turners — Emily only (+ randoms) ─────────────
  {
    visibleTo: [EMILY],
    circle: {
      id: "c5",
      name: "Page Turners",
      habit: "Read 10 pages",
      members: 31,
      streak: 15,
      icon: BookOpen01Icon,
      accent: colors.green,
      description:
        "Ten pages a day, any book. Fiction, non-fiction, manga — if it has pages, it counts.",
    },
    members: [
      mock(2, 47),  // Jae
      demo(2, 15),  // Emily
      mock(11, 44), // Ella
      mock(5, 30),  // Omar
      mock(0, 22),  // Sarah
    ],
  },

  // ── 6. Slow Mornings — Jack + Joel (just the two of them) ─
  {
    visibleTo: [JACK, JOEL],
    circle: {
      id: "c6",
      name: "Slow Mornings",
      habit: "A mindful coffee",
      members: 2,
      streak: 8,
      icon: Coffee02Icon,
      accent: colors.yellow,
      description:
        "Phones down, coffee up. Ten quiet minutes before the day begins. Just the two of us keeping each other honest.",
    },
    members: [
      demo(0, 8),  // Jack
      demo(3, 8),  // Joel
    ],
  },
];

// ── Per-circle feed posts ────────────────────────────────────
// Same habit, but each member gets a unique prompt + matching Unsplash photo.

const img = (id: string) => ({
  uri: `https://images.unsplash.com/${id}?w=800&h=800&fit=crop&q=80`,
});

function memberSnap(m: CircleMember) {
  return { memberId: m.id, name: m.name, letter: m.letter, color: m.color, streak: m.streak };
}

export type CircleFeedPost = {
  memberId: string;
  name: string;
  letter: string;
  color: string;
  streak: number;
  when: string;
  promptText: string;
  photos: { uri: string }[];
  caption: string;
  likes: number;
  comments: number;
};

const CIRCLE_FEED: Record<string, CircleFeedPost[]> = {
  // ── Morning Crew (morning walk) ─────────────────────────
  c1: [
    {
      ...memberSnap(mock(0, 34)),
      when: "45m ago",
      promptText: "Throw a peace sign mid-stride on your walk.",
      photos: [img("photo-1551632811-561732d1e306")],
      caption: "Golden hour hit different today. Had the whole trail to myself.",
      likes: 24, comments: 3,
    },
    {
      ...memberSnap(mock(4, 21)),
      when: "1h ago",
      promptText: "Show us the sky — what colour is sunrise today?",
      photos: [img("photo-1500382017468-9049fed747ef")],
      caption: "The kind of pink that makes you forgive the alarm. Worth every lost minute of sleep.",
      likes: 31, comments: 5,
    },
    {
      ...memberSnap(mock(3, 17)),
      when: "2h ago",
      promptText: "Snap your shadow on the path — how long is it?",
      photos: [img("photo-1504384308090-c894fdcc538d"), img("photo-1506748686214-e9df14d4d9d0")],
      caption: "My shadow's taller than me at 6 AM. That's the only time I'll ever be 6'4\".",
      likes: 18, comments: 2,
    },
  ],

  // ── 5K Every Day (running) ──────────────────────────────
  c2: [
    {
      ...memberSnap(mock(9, 28)),
      when: "1h ago",
      promptText: "Snap a selfie at the halfway mark — show us that runner's glow.",
      photos: [img("photo-1483721310020-03333e577078")],
      caption: "28 days straight. My shoes are begging for mercy but my legs finally stopped complaining.",
      likes: 71, comments: 9,
    },
    {
      ...memberSnap(mock(8, 9)),
      when: "2h ago",
      promptText: "Show your running shoes — how worn are they getting?",
      photos: [img("photo-1542291026-7eec264c27ff"), img("photo-1460353581641-37baddab0fa2")],
      caption: "New PB! 23:41. Shaved off 12 seconds from last week. The consistency is finally compounding.",
      likes: 67, comments: 9,
    },
    {
      ...memberSnap(mock(3, 17)),
      when: "3h ago",
      promptText: "Thumbs up at the finish — prove you made it.",
      photos: [img("photo-1552674605-db6ffd4facb5")],
      caption: "Nobody wanted to go but we all showed up anyway. That's the circle magic.",
      likes: 42, comments: 6,
    },
  ],

  // ── Mindful Minutes (meditation) ────────────────────────
  c3: [
    {
      ...memberSnap(mock(4, 21)),
      when: "1h ago",
      promptText: "Show your peaceful meditation corner.",
      photos: [img("photo-1506126613408-eca07ce68773")],
      caption: "21 days in a row. The quiet is starting to feel natural.",
      likes: 31, comments: 4,
    },
    {
      ...memberSnap(mock(6, 23)),
      when: "3h ago",
      promptText: "Eyes closed, palms up — capture the stillness.",
      photos: [img("photo-1593811167562-9cef47bfc4d7")],
      caption: "Ten minutes of nothing. Somehow it's the hardest and easiest part of the day.",
      likes: 22, comments: 3,
    },
    {
      ...memberSnap(mock(11, 44)),
      when: "5h ago",
      promptText: "Show us what you see when you open your eyes after meditating.",
      photos: [img("photo-1507003211169-0a1dd7228f2d"), img("photo-1499209974431-9dddcece7f88")],
      caption: "Day 44. The first thing I see is always the light through the window. It never gets old.",
      likes: 29, comments: 5,
    },
  ],

  // ── Hydration Squad (drink water) ───────────────────────
  c4: [
    {
      ...memberSnap(mock(1, 19)),
      when: "2h ago",
      promptText: "Cheers! Hold up your water bottle mid-sip.",
      photos: [img("photo-1553531384-cc64ac80f931")],
      caption: "Mid-run hydration check. Miraculously remembered the bottle today.",
      likes: 42, comments: 7,
    },
    {
      ...memberSnap(mock(7, 8)),
      when: "4h ago",
      promptText: "Show us the bottle — how much is left?",
      photos: [img("photo-1559839914-17aae19cec71")],
      caption: "Half a litre down before 9 AM. The secret is a bottle you actually like looking at.",
      likes: 19, comments: 2,
    },
    {
      ...memberSnap(mock(2, 14)),
      when: "5h ago",
      promptText: "Refill station selfie — where are you filling up today?",
      photos: [img("photo-1548839140-29a749e1cf4d")],
      caption: "Kitchen sink, as always. Not glamorous but it gets the job done.",
      likes: 15, comments: 3,
    },
  ],

  // ── Page Turners (reading) ──────────────────────────────
  c5: [
    {
      ...memberSnap(mock(2, 47)),
      when: "2h ago",
      promptText: "Hold up the book — reveal the cover.",
      photos: [img("photo-1544947950-fa07a98d237f")],
      caption: "Finally started the new Ishiguro. It's slow in the best way.",
      likes: 18, comments: 5,
    },
    {
      ...memberSnap(mock(11, 44)),
      when: "4h ago",
      promptText: "Show your reading spot — where do the pages turn?",
      photos: [img("photo-1512820790803-83ca734da794"), img("photo-1517842645767-c639042777db")],
      caption: "Same corner of the couch every night. The cushion has my shape now.",
      likes: 25, comments: 4,
    },
    {
      ...memberSnap(mock(5, 30)),
      when: "6h ago",
      promptText: "Bookmark check — how far in are you?",
      photos: [img("photo-1476275466078-4007374efbbe")],
      caption: "Page 247. The plot twist hit so hard I read 30 pages instead of 10.",
      likes: 33, comments: 7,
    },
  ],

  // ── Slow Mornings (mindful coffee) ──────────────────────
  c6: [
    {
      ...memberSnap(demo(0, 8)),
      when: "1h ago",
      promptText: "Show us the mug — what are you sipping today?",
      photos: [img("photo-1495474472287-4d71bcdd2085")],
      caption: "Pour-over this morning. Phone's in the drawer. Ten minutes of just steam and silence.",
      likes: 12, comments: 1,
    },
    {
      ...memberSnap(demo(3, 8)),
      when: "2h ago",
      promptText: "Phones down proof — show the empty table, just the cup.",
      photos: [img("photo-1509042239860-f550ce710b93"), img("photo-1497935586351-b67a49e012bf")],
      caption: "Day 8. Still wild how much longer mornings feel when you're not scrolling.",
      likes: 9, comments: 2,
    },
  ],
};

// ── Public API ───────────────────────────────────────────────

/** All circle definitions (for lookups by ID). */
export const ALL_CIRCLES = CIRCLE_DATA;

/** Return circles visible to a specific demo user, in display order. */
export function getCirclesForUser(userId?: string): CircleRow[] {
  if (!userId) return CIRCLE_DATA.map((c) => c.circle);
  return CIRCLE_DATA.filter((c) => c.visibleTo.includes(userId)).map((c) => c.circle);
}

/** Return the member list for a specific circle. */
export function getCircleMembers(circleId: string): CircleMember[] {
  return CIRCLE_DATA.find((c) => c.circle.id === circleId)?.members ?? [];
}

/** Find a circle by ID. */
export function getCircleById(circleId: string): CircleRow | undefined {
  return CIRCLE_DATA.find((c) => c.circle.id === circleId)?.circle;
}

/** Return feed posts for a specific circle. */
export function getCircleFeedPosts(circleId: string): CircleFeedPost[] {
  return CIRCLE_FEED[circleId] ?? [];
}
