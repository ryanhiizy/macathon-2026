import {
  SunriseIcon,
  DropletIcon,
  BookOpen01Icon,
  Yoga01Icon,
  RunningShoesIcon,
  Coffee02Icon,
  Plant01Icon,
  PaintBoardIcon,
  Moon02Icon,
  Dumbbell01Icon,
  MusicNote01Icon,
  Camera01Icon,
  Bicycle01Icon,
  OrganicFoodIcon,
  Brain01Icon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons";
import type { HugeiconsProps } from "@hugeicons/react-native";
import { colors } from "@/lib/theme";

export const photos = {
  walk: require("../assets/mock/photo-1015.jpg"),
  companion: require("../assets/mock/photo-1025.jpg"),
  outdoors: require("../assets/mock/photo-1036.jpg"),
  portrait: require("../assets/mock/photo-1056.jpg"),
  quiet: require("../assets/mock/photo-1074.jpg"),
  reading: require("../assets/mock/photo-1084.jpg"),
} as const;

export type PhotoKey = keyof typeof photos;

export const photoList = Object.values(photos);

export const pickPhoto = (i: number) => photoList[i % photoList.length];

export type TimeOfDay = "morning" | "afternoon" | "evening";

export type Habit = {
  id: string;
  name: string;
  icon: HugeiconsProps["icon"];
  accent: string;
  streak: number;
  bestStreak: number;
  time: string;
  timeOfDay: TimeOfDay;
  done: boolean;
  // Last 7 days, oldest → newest. true = completed.
  history: boolean[];
};

export const HABITS: Habit[] = [
  {
    id: "1",
    name: "Morning walk",
    icon: SunriseIcon,
    accent: colors.orange,
    streak: 12,
    bestStreak: 34,
    time: "7:00 AM",
    timeOfDay: "morning",
    done: true,
    history: [true, true, false, true, true, true, true],
  },
  {
    id: "3",
    name: "Meditate",
    icon: Yoga01Icon,
    accent: colors.purple,
    streak: 23,
    bestStreak: 47,
    time: "8:30 AM",
    timeOfDay: "morning",
    done: false,
    history: [true, true, true, true, true, true, false],
  },
  {
    id: "2",
    name: "Drink water",
    icon: DropletIcon,
    accent: colors.cyan,
    streak: 5,
    bestStreak: 18,
    time: "All day",
    timeOfDay: "afternoon",
    done: false,
    history: [true, false, true, true, true, false, false],
  },
  {
    id: "4",
    name: "Read 10 pages",
    icon: BookOpen01Icon,
    accent: colors.green,
    streak: 3,
    bestStreak: 12,
    time: "9:00 PM",
    timeOfDay: "evening",
    done: false,
    history: [false, true, true, true, false, true, false],
  },
];

export type SoloPost = {
  id: string;
  kind: "solo";
  name: string;
  handle: string;
  when: string;
  streak: number;
  color: string;
  letter: string;
  photoIdxs?: number[];
  photos?: { uri: string }[];
  promptText?: string;
  caption: string;
  likes: number;
  comments: number;
};

export type GroupPost = {
  id: string;
  kind: "group";
  name: string;
  handle: string;
  when: string;
  photoIdxs?: number[];
  photos?: { uri: string }[];
  promptText?: string;
  caption: string;
  likes: number;
  comments: number;
  participants: { color: string; letter: string; name: string; streak: number }[];
};

export type DispatchPost = {
  id: string;
  kind: "dispatch";
  name: string;
  handle: string;
  when: string;
  color: string;
  letter: string;
  streak: number;
  value: string;
  unit: string;
  caption: string;
  likes: number;
  comments: number;
};

export type FeedPost = SoloPost | GroupPost | DispatchPost;

export const FEED_POSTS: FeedPost[] = [
  {
    id: "p1",
    kind: "solo",
    name: "Sarah K.",
    handle: "Morning walk",
    when: "2h ago",
    streak: 12,
    color: colors.blue,
    letter: "S",
    photoIdxs: [0],
    caption:
      "Golden hour hit different today. Woke up at 6, made it to the river by 6:30. Had the whole trail to myself for a bit — there's something almost sacred about that quiet.",
    likes: 24,
    comments: 3,
  },
  {
    id: "d1",
    kind: "dispatch",
    name: "Sarah K.",
    handle: "Running",
    when: "just now",
    color: colors.blue,
    letter: "S",
    streak: 50,
    value: "50",
    unit: "days of running",
    caption: "Her longest streak yet — and she's still going. Give her the flowers.",
    likes: 31,
    comments: 8,
  },
  {
    id: "p2",
    kind: "group",
    name: "You, Mia + 1",
    handle: "Water check",
    when: "5h ago",
    photoIdxs: [1, 2, 3],
    caption: "Mid-run hydration check. Miraculously all three of us remembered.",
    likes: 42,
    comments: 7,
    participants: [
      { color: colors.purple, letter: "B", name: "You", streak: 23 },
      { color: colors.green, letter: "M", name: "Mia", streak: 19 },
      { color: colors.cyan, letter: "J", name: "Jae", streak: 14 },
    ],
  },
  {
    id: "p3",
    kind: "solo",
    name: "Jae Park",
    handle: "10 pages",
    when: "6h ago",
    streak: 47,
    color: colors.cyan,
    letter: "J",
    photoIdxs: [5, 4],
    caption:
      "Finally started the new Ishiguro. It's slow in the best way — like the book is teaching me how to read it.",
    likes: 18,
    comments: 5,
  },
];

export type Comment = {
  id: string;
  name: string;
  handle: string;
  color: string;
  letter: string;
  text: string;
  when: string;
  likes: number;
};

export const COMMENTS: Record<string, Comment[]> = {
  p1: [
    { id: "c1", name: "Mia Chen", handle: "@miachen", color: colors.green, letter: "M", text: "This is so peaceful. I need to start waking up earlier.", when: "1h", likes: 4 },
    { id: "c2", name: "Jae Park", handle: "@jaepark", color: colors.cyan, letter: "J", text: "The river trail is underrated. Going tomorrow morning.", when: "45m", likes: 2 },
    { id: "c3", name: "Theo Vinci", handle: "@theov", color: colors.orange, letter: "T", text: "Golden hour walks hit different fr", when: "30m", likes: 1 },
  ],
  p2: [
    { id: "c4", name: "Sarah K.", handle: "@sarahk", color: colors.blue, letter: "S", text: "The fact all three of you remembered is genuinely impressive", when: "4h", likes: 8 },
    { id: "c5", name: "Nina Ray", handle: "@ninaray", color: colors.magenta, letter: "N", text: "Where's my invite??", when: "3h", likes: 5 },
    { id: "c6", name: "Omar H.", handle: "@omarh", color: colors.yellow, letter: "O", text: "Mid-run hydration is so underrated", when: "2h", likes: 3 },
    { id: "c7", name: "Kai Lo", handle: "@kailo", color: colors.purple, letter: "K", text: "Need to join this circle immediately", when: "1h", likes: 2 },
    { id: "c8", name: "Theo Vinci", handle: "@theov", color: colors.orange, letter: "T", text: "Okay this is wholesome. Adding water check to my habits now.", when: "45m", likes: 6 },
    { id: "c9", name: "Mia Chen", handle: "@miachen", color: colors.green, letter: "M", text: "We're building something beautiful here 🥹", when: "30m", likes: 4 },
    { id: "c10", name: "Jae Park", handle: "@jaepark", color: colors.cyan, letter: "J", text: "Best squad. No notes.", when: "15m", likes: 1 },
  ],
  p3: [
    { id: "c11", name: "Sarah K.", handle: "@sarahk", color: colors.blue, letter: "S", text: "Which Ishiguro? I've been looking for something exactly like this.", when: "5h", likes: 3 },
    { id: "c12", name: "Mia Chen", handle: "@miachen", color: colors.green, letter: "M", text: "47 day streak is insane. Respect.", when: "4h", likes: 7 },
    { id: "c13", name: "Omar H.", handle: "@omarh", color: colors.yellow, letter: "O", text: "\"Teaching me how to read it\" — that's such a perfect way to put it", when: "3h", likes: 5 },
    { id: "c14", name: "Nina Ray", handle: "@ninaray", color: colors.magenta, letter: "N", text: "Adding this to my list immediately", when: "2h", likes: 2 },
    { id: "c15", name: "Theo Vinci", handle: "@theov", color: colors.orange, letter: "T", text: "Love the reading nook setup btw", when: "1h", likes: 1 },
  ],
};

export type CircleAnalytics = {
  todayRate: number;       // 0–1, fraction of members who checked in today
  avgStreak: number;
  topStreak: number;
  weekDaily: number[];     // 7 values (Mon→Sun), each 0–1 completion rate
  trendLine: number[];     // ~14 data points for sparkline
};

export type CircleRow = {
  id: string;
  name: string;
  habit: string;
  members: number;
  streak: number;
  icon: HugeiconsProps["icon"];
  accent: string;
  description: string;
  analytics: CircleAnalytics;
};

export const CIRCLES: CircleRow[] = [
  {
    id: "1",
    name: "5K Every Day",
    habit: "Run 5 kilometers",
    members: 142,
    streak: 12,
    icon: RunningShoesIcon,
    accent: colors.orange,
    description:
      "We lace up every morning, rain or shine. Five kilometers a day keeps the couch away.",
    analytics: {
      todayRate: 0.78,
      avgStreak: 18,
      topStreak: 47,
      weekDaily: [0.82, 0.79, 0.65, 0.88, 0.91, 0.73, 0.78],
      trendLine: [0.6, 0.62, 0.58, 0.65, 0.7, 0.68, 0.72, 0.74, 0.71, 0.78, 0.82, 0.79, 0.85, 0.78],
    },
  },
  {
    id: "2",
    name: "Hydration Club",
    habit: "Drink 2L of water",
    members: 89,
    streak: 5,
    icon: DropletIcon,
    accent: colors.cyan,
    description: "Two liters a day. Proof by bottle, ideally mid-sip.",
    analytics: {
      todayRate: 0.62,
      avgStreak: 9,
      topStreak: 31,
      weekDaily: [0.71, 0.68, 0.55, 0.60, 0.72, 0.58, 0.62],
      trendLine: [0.45, 0.48, 0.52, 0.50, 0.55, 0.58, 0.54, 0.60, 0.57, 0.63, 0.59, 0.65, 0.62, 0.62],
    },
  },
  {
    id: "3",
    name: "Morning Flow",
    habit: "10 minutes of yoga",
    members: 47,
    streak: 23,
    icon: Yoga01Icon,
    accent: colors.purple,
    description: "A gentle morning routine to unfold into the day.",
    analytics: {
      todayRate: 0.91,
      avgStreak: 26,
      topStreak: 52,
      weekDaily: [0.89, 0.92, 0.87, 0.94, 0.90, 0.88, 0.91],
      trendLine: [0.72, 0.75, 0.78, 0.80, 0.82, 0.85, 0.83, 0.87, 0.89, 0.88, 0.91, 0.90, 0.93, 0.91],
    },
  },
  {
    id: "4",
    name: "Slow Mornings",
    habit: "A mindful coffee",
    members: 31,
    streak: 8,
    icon: Coffee02Icon,
    accent: colors.yellow,
    description: "Phones down, coffee up. Ten quiet minutes before the day begins.",
    analytics: {
      todayRate: 0.84,
      avgStreak: 14,
      topStreak: 38,
      weekDaily: [0.77, 0.84, 0.80, 0.87, 0.74, 0.81, 0.84],
      trendLine: [0.55, 0.58, 0.62, 0.60, 0.67, 0.70, 0.68, 0.73, 0.76, 0.78, 0.80, 0.82, 0.84, 0.84],
    },
  },
];

export type DiscoverCircle = {
  id: string;
  name: string;
  habit: string;
  members: number;
  icon: HugeiconsProps["icon"];
  accent: string;
  description: string;
  tags: string[];
  friendsIn: number;
  trending?: boolean;
};

export const DISCOVER_CIRCLES: DiscoverCircle[] = [
  {
    id: "d1",
    name: "No Phone Till 9",
    habit: "Screen-free morning",
    members: 2841,
    icon: SmartPhone01Icon,
    accent: colors.red,
    description: "Phone stays in a drawer until 9am. You'd be surprised how long mornings actually are.",
    tags: ["mindfulness", "morning"],
    friendsIn: 3,
  },
  {
    id: "d2",
    name: "Page Turners",
    habit: "Read 20 pages",
    members: 1203,
    icon: BookOpen01Icon,
    accent: colors.green,
    description: "Twenty pages a day. That's a book every two weeks and a better brain by Tuesday.",
    tags: ["reading", "evening"],
    friendsIn: 2,
    trending: true,
  },
  {
    id: "d3",
    name: "Iron Hour",
    habit: "Lift weights",
    members: 967,
    icon: Dumbbell01Icon,
    accent: colors.orange,
    description: "One hour. Heavy things go up, they come back down. Repeat until strong.",
    tags: ["fitness", "strength"],
    friendsIn: 1,
    trending: true,
  },
  {
    id: "d4",
    name: "Sleep by 11",
    habit: "Lights out by 11pm",
    members: 3412,
    icon: Moon02Icon,
    accent: colors.purple,
    description: "The most powerful habit nobody respects. We're changing that.",
    tags: ["sleep", "evening"],
    friendsIn: 5,
  },
  {
    id: "d5",
    name: "Daily Sketch",
    habit: "Draw something",
    members: 418,
    icon: PaintBoardIcon,
    accent: colors.magenta,
    description: "Doesn't have to be good, just has to exist. Pen meets paper, every single day.",
    tags: ["creative", "art"],
    friendsIn: 0,
  },
  {
    id: "d6",
    name: "Pedal Club",
    habit: "Bike to work",
    members: 634,
    icon: Bicycle01Icon,
    accent: colors.cyan,
    description: "Two wheels, no excuses. Rain gear encouraged.",
    tags: ["fitness", "commute"],
    friendsIn: 1,
    trending: true,
  },
  {
    id: "d7",
    name: "Plant Parents",
    habit: "Tend your plants",
    members: 289,
    icon: Plant01Icon,
    accent: colors.green,
    description: "Water, prune, talk to them if that's your thing. Keep something alive.",
    tags: ["nature", "home"],
    friendsIn: 0,
  },
  {
    id: "d8",
    name: "Breathwork",
    habit: "5 min breathing",
    members: 1589,
    icon: Brain01Icon,
    accent: colors.blue,
    description: "Box breathing, Wim Hof, whatever works. Five minutes of intentional breath.",
    tags: ["mindfulness", "health"],
    friendsIn: 4,
  },
  {
    id: "d9",
    name: "One Song a Day",
    habit: "Learn an instrument",
    members: 203,
    icon: MusicNote01Icon,
    accent: colors.yellow,
    description: "Pick up the guitar, sit at the piano, bang the drums. Just play one song.",
    tags: ["creative", "music"],
    friendsIn: 0,
  },
  {
    id: "d10",
    name: "Cook Real Food",
    habit: "Home-cooked meal",
    members: 756,
    icon: OrganicFoodIcon,
    accent: colors.orange,
    description: "At least one real meal from scratch. Your future self will thank you.",
    tags: ["health", "cooking"],
    friendsIn: 2,
  },
  {
    id: "d11",
    name: "Golden Hour",
    habit: "Photograph sunset",
    members: 521,
    icon: Camera01Icon,
    accent: colors.yellow,
    description: "Chase the light every evening. One photo of the sun going down.",
    tags: ["creative", "outdoors"],
    friendsIn: 1,
  },
  {
    id: "d12",
    name: "Cold Plunge Crew",
    habit: "Cold exposure",
    members: 1102,
    icon: DropletIcon,
    accent: colors.cyan,
    description: "Two minutes of cold water. Screaming optional but common.",
    tags: ["health", "challenge"],
    friendsIn: 3,
  },
];

export type Friend = {
  id: string;
  name: string;
  handle: string;
  color: string;
  letter: string;
};

export const FRIENDS: Friend[] = [
  { id: "joel", name: "Joel", handle: "@joel", color: colors.blue, letter: "J" },
  { id: "emily", name: "Emily", handle: "@emily", color: colors.green, letter: "E" },
  { id: "ryan", name: "Ryan", handle: "@ryan", color: colors.orange, letter: "R" },
  { id: "mu04", name: "Theo Vinci", handle: "@theov", color: colors.cyan, letter: "T" },
  { id: "mu05", name: "Nina Ray", handle: "@ninaray", color: colors.magenta, letter: "N" },
  { id: "mu06", name: "Omar H.", handle: "@omarh", color: colors.yellow, letter: "O" },
  { id: "mu07", name: "Kai Lo", handle: "@kailo", color: colors.purple, letter: "K" },
  { id: "mu08", name: "Ava Lin", handle: "@avalin", color: colors.red, letter: "A" },
  { id: "mu09", name: "Leo Cruz", handle: "@leocruz", color: colors.orange, letter: "L" },
  { id: "mu10", name: "Zoe Kim", handle: "@zoekim", color: colors.cyan, letter: "Z" },
  { id: "mu11", name: "Ravi S.", handle: "@ravis", color: colors.green, letter: "R" },
  { id: "mu12", name: "Ella Wu", handle: "@ellawu", color: colors.magenta, letter: "E" },
];

export const CIRCLE_MEMBERS = [
  { id: "joel", name: "Joel", handle: "@joel", letter: "J", color: colors.blue, streak: 34 },
  { id: "you", name: "You", handle: "@jack", letter: "J", color: colors.purple, streak: 23 },
  { id: "emily", name: "Emily", handle: "@emily", letter: "E", color: colors.green, streak: 19 },
  { id: "ryan", name: "Ryan", handle: "@ryan", letter: "R", color: colors.orange, streak: 47 },
  { id: "mu04", name: "Theo Vinci", handle: "@theov", letter: "T", color: colors.cyan, streak: 17 },
  { id: "mu05", name: "Nina Ray", handle: "@ninaray", letter: "N", color: colors.magenta, streak: 21 },
  { id: "mu09", name: "Leo Cruz", handle: "@leocruz", letter: "L", color: colors.orange, streak: 9 },
  { id: "mu10", name: "Zoe Kim", handle: "@zoekim", letter: "Z", color: colors.cyan, streak: 28 },
  { id: "mu07", name: "Kai Lo", handle: "@kailo", letter: "K", color: colors.purple, streak: 23 },
];

export const HABIT_ICONS: { icon: HugeiconsProps["icon"]; label: string }[] = [
  { icon: SunriseIcon, label: "Sunrise" },
  { icon: DropletIcon, label: "Water" },
  { icon: Yoga01Icon, label: "Yoga" },
  { icon: BookOpen01Icon, label: "Book" },
  { icon: RunningShoesIcon, label: "Run" },
  { icon: Coffee02Icon, label: "Coffee" },
  { icon: Plant01Icon, label: "Plant" },
  { icon: PaintBoardIcon, label: "Create" },
];

export const ACCENT_OPTIONS = [
  colors.orange,
  colors.cyan,
  colors.purple,
  colors.green,
  colors.blue,
  colors.magenta,
  colors.yellow,
  colors.red,
];

// Last 7 weekdays — overall consistency. Newest day last.
export const WEEK_DAYS: { label: string; done: boolean }[] = [
  { label: "Mo", done: true },
  { label: "Tu", done: true },
  { label: "We", done: false },
  { label: "Th", done: true },
  { label: "Fr", done: true },
  { label: "Sa", done: true },
  { label: "Su", done: true },
];

// ── Notifications ──────────────────────────────────────────────

export type NotificationType =
  | "like"
  | "comment"
  | "follow"
  | "streak"
  | "circle_invite"
  | "mention";

export type Notification = {
  id: string;
  type: NotificationType;
  name: string;
  color: string;
  letter: string;
  body: string;
  when: string;
  read: boolean;
  photoIndex?: number;
};

export const NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "like", name: "Sarah K.", color: colors.blue, letter: "S", body: "liked your photo.", when: "2m", read: false, photoIndex: 0 },
  { id: "n2", type: "comment", name: "Mia Chen", color: colors.green, letter: "M", body: "commented: \"This is so peaceful!\"", when: "15m", read: false, photoIndex: 0 },
  { id: "n3", type: "follow", name: "Kai Lo", color: colors.purple, letter: "K", body: "started following you.", when: "1h", read: false },
  { id: "n4", type: "streak", name: "Jae Park", color: colors.cyan, letter: "J", body: "just hit a 50-day streak on Morning walk!", when: "2h", read: true },
  { id: "n5", type: "circle_invite", name: "Theo Vinci", color: colors.orange, letter: "T", body: "invited you to join Iron Hour.", when: "3h", read: true },
  { id: "n6", type: "like", name: "Nina Ray", color: colors.magenta, letter: "N", body: "liked your photo.", when: "4h", read: true, photoIndex: 1 },
  { id: "n7", type: "mention", name: "Omar H.", color: colors.yellow, letter: "O", body: "mentioned you in a comment.", when: "5h", read: true, photoIndex: 2 },
  { id: "n8", type: "comment", name: "Sarah K.", color: colors.blue, letter: "S", body: "commented: \"Golden hour walks hit different\"", when: "6h", read: true, photoIndex: 3 },
  { id: "n9", type: "follow", name: "Mia Chen", color: colors.green, letter: "M", body: "started following you.", when: "1d", read: true },
  { id: "n10", type: "like", name: "Jae Park", color: colors.cyan, letter: "J", body: "and 4 others liked your photo.", when: "1d", read: true, photoIndex: 4 },
  { id: "n11", type: "circle_invite", name: "Nina Ray", color: colors.magenta, letter: "N", body: "invited you to join Page Turners.", when: "2d", read: true },
  { id: "n12", type: "streak", name: "Theo Vinci", color: colors.orange, letter: "T", body: "just hit a 30-day streak on Cold plunge!", when: "2d", read: true },
  { id: "n13", type: "like", name: "Kai Lo", color: colors.purple, letter: "K", body: "liked your photo.", when: "3d", read: true, photoIndex: 5 },
  { id: "n14", type: "comment", name: "Omar H.", color: colors.yellow, letter: "O", body: "commented: \"Respect the consistency\"", when: "3d", read: true, photoIndex: 0 },
  { id: "n15", type: "follow", name: "Theo Vinci", color: colors.orange, letter: "T", body: "started following you.", when: "4d", read: true },
];

// ── Direct Messages ────────────────────────────────────────────

export type ChatThread = {
  id: string;
  name: string;
  color: string;
  letter: string;
  lastMessage: string;
  when: string;
  unread: boolean;
  online: boolean;
  isGroup?: boolean;
  groupIcon?: HugeiconsProps["icon"];
  groupMembers?: { color: string; letter: string }[];
};

export const CHAT_THREADS: ChatThread[] = [
  { id: "dm-joel", name: "Joel", color: colors.blue, letter: "J", lastMessage: "Bro did you push the camera fix yet", when: "2m", unread: true, online: true },
  { id: "dm-emily", name: "Emily", color: colors.green, letter: "E", lastMessage: "The design looks so clean now", when: "15m", unread: true, online: true },
  { id: "dm-ryan", name: "Ryan", color: colors.orange, letter: "R", lastMessage: "YOLO model is detecting everything now", when: "30m", unread: true, online: true },
  { id: "group-team", name: "Macathon Team", color: colors.purple, letter: "M", lastMessage: "Ryan: Let's ship it", when: "1h", unread: false, online: false, isGroup: true, groupIcon: RunningShoesIcon, groupMembers: [{ color: colors.purple, letter: "J" }, { color: colors.blue, letter: "J" }, { color: colors.green, letter: "E" }, { color: colors.orange, letter: "R" }] },
  { id: "dm4", name: "Theo Vinci", color: colors.cyan, letter: "T", lastMessage: "Have you tried the new prompt system?", when: "3h", unread: false, online: false },
  { id: "group-morning", name: "Morning Crew", color: colors.magenta, letter: "M", lastMessage: "Nina: See everyone at 6am!", when: "6h", unread: false, online: false, isGroup: true, groupIcon: Yoga01Icon, groupMembers: [{ color: colors.magenta, letter: "N" }, { color: colors.cyan, letter: "T" }, { color: colors.purple, letter: "J" }] },
  { id: "dm7", name: "Nina Ray", color: colors.magenta, letter: "N", lastMessage: "That cold plunge was brutal lol", when: "1d", unread: false, online: false },
  { id: "dm8", name: "Omar H.", color: colors.yellow, letter: "O", lastMessage: "Check out this recipe I found", when: "1d", unread: false, online: false },
  { id: "dm9", name: "Kai Lo", color: colors.purple, letter: "K", lastMessage: "You coming to the meetup?", when: "2d", unread: false, online: false },
];

export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  senderLetter: string;
  text: string;
  when: string;
  isMe: boolean;
};

export const CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  "dm-joel": [
    { id: "m1", senderId: "joel", senderName: "Joel", senderColor: colors.blue, senderLetter: "J", text: "Yo did you see the circles page?", when: "9:02 AM", isMe: false },
    { id: "m2", senderId: "me", senderName: "You", senderColor: colors.purple, senderLetter: "J", text: "Yeah it looks fire, Emily went off on the design", when: "9:03 AM", isMe: true },
    { id: "m3", senderId: "joel", senderName: "Joel", senderColor: colors.blue, senderLetter: "J", text: "Fr. I'm almost done with the backend routes", when: "9:04 AM", isMe: false },
    { id: "m4", senderId: "me", senderName: "You", senderColor: colors.purple, senderLetter: "J", text: "Nice I'm wiring up the messaging rn", when: "9:05 AM", isMe: true },
    { id: "m5", senderId: "joel", senderName: "Joel", senderColor: colors.blue, senderLetter: "J", text: "Let's get it. We shipping tonight", when: "9:06 AM", isMe: false },
    { id: "m6", senderId: "me", senderName: "You", senderColor: colors.purple, senderLetter: "J", text: "100%. I'll push the camera fix after this", when: "9:08 AM", isMe: true },
    { id: "m7", senderId: "joel", senderName: "Joel", senderColor: colors.blue, senderLetter: "J", text: "Bro did you push the camera fix yet", when: "9:30 AM", isMe: false },
  ],
  "dm-emily": [
    { id: "m8", senderId: "emily", senderName: "Emily", senderColor: colors.green, senderLetter: "E", text: "Hey can you check the new feed layout?", when: "8:30 AM", isMe: false },
    { id: "m9", senderId: "me", senderName: "You", senderColor: colors.purple, senderLetter: "J", text: "Just looked, the spacing is perfect", when: "8:32 AM", isMe: true },
    { id: "m10", senderId: "emily", senderName: "Emily", senderColor: colors.green, senderLetter: "E", text: "Thanks! I also updated the profile page", when: "8:33 AM", isMe: false },
    { id: "m11", senderId: "me", senderName: "You", senderColor: colors.purple, senderLetter: "J", text: "The avatar component is so smooth now", when: "8:34 AM", isMe: true },
    { id: "m12", senderId: "emily", senderName: "Emily", senderColor: colors.green, senderLetter: "E", text: "The design looks so clean now", when: "8:45 AM", isMe: false },
  ],
  "dm-ryan": [
    { id: "m13", senderId: "ryan", senderName: "Ryan", senderColor: colors.orange, senderLetter: "R", text: "I trained the model on more classes", when: "8:00 AM", isMe: false },
    { id: "m14", senderId: "me", senderName: "You", senderColor: colors.purple, senderLetter: "J", text: "How's the accuracy looking?", when: "8:02 AM", isMe: true },
    { id: "m15", senderId: "ryan", senderName: "Ryan", senderColor: colors.orange, senderLetter: "R", text: "Way better, detecting water bottles, yoga mats, running shoes", when: "8:03 AM", isMe: false },
    { id: "m16", senderId: "me", senderName: "You", senderColor: colors.purple, senderLetter: "J", text: "That's huge for the demo", when: "8:04 AM", isMe: true },
    { id: "m17", senderId: "ryan", senderName: "Ryan", senderColor: colors.orange, senderLetter: "R", text: "YOLO model is detecting everything now", when: "8:30 AM", isMe: false },
  ],
  "group-team": [
    { id: "m18", senderId: "joel", senderName: "Joel", senderColor: colors.blue, senderLetter: "J", text: "Alright team, status update?", when: "7:00 AM", isMe: false },
    { id: "m19", senderId: "emily", senderName: "Emily", senderColor: colors.green, senderLetter: "E", text: "Design system is done, all components are styled", when: "7:02 AM", isMe: false },
    { id: "m20", senderId: "ryan", senderName: "Ryan", senderColor: colors.orange, senderLetter: "R", text: "YOLO server is running stable, prompt gen is working", when: "7:03 AM", isMe: false },
    { id: "m21", senderId: "me", senderName: "You", senderColor: colors.purple, senderLetter: "J", text: "Messaging and camera flow are almost done", when: "7:05 AM", isMe: true },
    { id: "m22", senderId: "joel", senderName: "Joel", senderColor: colors.blue, senderLetter: "J", text: "We're actually gonna make it", when: "7:06 AM", isMe: false },
    { id: "m23", senderId: "emily", senderName: "Emily", senderColor: colors.green, senderLetter: "E", text: "The app looks so good honestly", when: "7:08 AM", isMe: false },
    { id: "m24", senderId: "ryan", senderName: "Ryan", senderColor: colors.orange, senderLetter: "R", text: "Let's ship it", when: "7:10 AM", isMe: false },
  ],
  dm4: [
    { id: "m25", senderId: "mu04", senderName: "Theo Vinci", senderColor: colors.cyan, senderLetter: "T", text: "Have you tried the new prompt system?", when: "4:18 PM", isMe: false },
    { id: "m26", senderId: "me", senderName: "You", senderColor: colors.purple, senderLetter: "J", text: "Yeah it's actually really creative with the prompts", when: "4:20 PM", isMe: true },
  ],
  "group-morning": [
    { id: "m27", senderId: "mu05", senderName: "Nina Ray", senderColor: colors.magenta, senderLetter: "N", text: "See everyone at 6am!", when: "9:12 PM", isMe: false },
    { id: "m28", senderId: "mu04", senderName: "Theo Vinci", senderColor: colors.cyan, senderLetter: "T", text: "I'll be there, setting my alarm now", when: "9:14 PM", isMe: false },
    { id: "m29", senderId: "me", senderName: "You", senderColor: colors.purple, senderLetter: "J", text: "Perfect. I'm setting three alarms.", when: "9:15 PM", isMe: true },
  ],
  dm7: [
    { id: "m30", senderId: "mu05", senderName: "Nina Ray", senderColor: colors.magenta, senderLetter: "N", text: "That cold plunge was brutal lol", when: "Yesterday", isMe: false },
    { id: "m31", senderId: "me", senderName: "You", senderColor: colors.purple, senderLetter: "J", text: "You looked way calmer than I felt.", when: "Yesterday", isMe: true },
  ],
  dm8: [
    { id: "m32", senderId: "mu06", senderName: "Omar H.", senderColor: colors.yellow, senderLetter: "O", text: "Check out this recipe I found", when: "Yesterday", isMe: false },
    { id: "m33", senderId: "me", senderName: "You", senderColor: colors.purple, senderLetter: "J", text: "Saving this for meal prep night.", when: "Yesterday", isMe: true },
  ],
  dm9: [
    { id: "m34", senderId: "mu07", senderName: "Kai Lo", senderColor: colors.purple, senderLetter: "K", text: "You coming to the meetup?", when: "Tuesday", isMe: false },
    { id: "m35", senderId: "me", senderName: "You", senderColor: colors.purple, senderLetter: "J", text: "Yep, I'll be there after work.", when: "Tuesday", isMe: true },
  ],
};
