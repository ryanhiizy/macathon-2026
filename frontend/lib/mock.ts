import {
  SunriseIcon,
  DropletIcon,
  BookOpen01Icon,
  Yoga01Icon,
  RunningShoesIcon,
  Coffee02Icon,
  Plant01Icon,
  PaintBoardIcon,
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
  photoIdxs: number[];
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
  photoIdxs: number[];
  caption: string;
  likes: number;
  comments: number;
  participants: { color: string; letter: string; name: string; streak: number }[];
};

export type DispatchPost = {
  id: string;
  kind: "dispatch";
  name: string;
  value: string;
  unit: string;
  caption: string;
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
    name: "Sarah",
    value: "50",
    unit: "days of running",
    caption: "Her longest streak yet — and she's still going. Give her the flowers.",
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

export type CircleRow = {
  id: string;
  name: string;
  habit: string;
  members: number;
  streak: number;
  icon: HugeiconsProps["icon"];
  accent: string;
  description: string;
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
  { id: "a", name: "Sarah K.", handle: "@sarahk", color: colors.blue, letter: "S" },
  { id: "b", name: "Mia Chen", handle: "@miachen", color: colors.green, letter: "M" },
  { id: "c", name: "Jae Park", handle: "@jaepark", color: colors.cyan, letter: "J" },
  { id: "d", name: "Theo Vinci", handle: "@theov", color: colors.orange, letter: "T" },
  { id: "e", name: "Nina Ray", handle: "@ninaray", color: colors.magenta, letter: "N" },
  { id: "f", name: "Omar H.", handle: "@omarh", color: colors.yellow, letter: "O" },
  { id: "g", name: "Kai Lo", handle: "@kailo", color: colors.purple, letter: "K" },
];

export const CIRCLE_MEMBERS = [
  { id: "1", name: "Sarah K.", letter: "S", color: colors.blue, streak: 47 },
  { id: "2", name: "You", letter: "B", color: colors.purple, streak: 23 },
  { id: "3", name: "Mia Chen", letter: "M", color: colors.green, streak: 19 },
  { id: "4", name: "Jae Park", letter: "J", color: colors.cyan, streak: 14 },
  { id: "5", name: "Theo Vinci", letter: "T", color: colors.orange, streak: 11 },
  { id: "6", name: "Nina Ray", letter: "N", color: colors.magenta, streak: 7 },
  { id: "7", name: "Omar H.", letter: "O", color: colors.yellow, streak: 4 },
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
  { label: "M", done: true },
  { label: "T", done: true },
  { label: "W", done: false },
  { label: "T", done: true },
  { label: "F", done: true },
  { label: "S", done: true },
  { label: "S", done: true },
];
