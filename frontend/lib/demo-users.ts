import { type ImageSourcePropType } from "react-native";
import { colors } from "@/lib/theme";

export type DemoUserStats = {
  habits: number;
  bestStreak: number;
  friends: number;
  circles: number;
  weeklyConsistency: number;
};

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  color: string;
  avatar: ImageSourcePropType | null;
  stats: DemoUserStats;
};

export const DEMO_USERS: DemoUser[] = [
  {
    id: "d0000000-0000-0000-0000-000000000001",
    name: "Jack",
    email: "jack@demo.presence.club",
    password: "demo2026",
    color: colors.primary,
    avatar: require("@/images/avatars/jack.png"),
    stats: { habits: 6, bestStreak: 47, friends: 124, circles: 4, weeklyConsistency: 0.72 },
  },
  {
    id: "d0000000-0000-0000-0000-000000000002",
    name: "Ryan",
    email: "ryan@demo.presence.club",
    password: "demo2026",
    color: colors.orange,
    avatar: require("@/images/avatars/ryan.jpeg"),
    stats: { habits: 5, bestStreak: 31, friends: 89, circles: 3, weeklyConsistency: 0.85 },
  },
  {
    id: "d0000000-0000-0000-0000-000000000003",
    name: "Emily",
    email: "emily@demo.presence.club",
    password: "demo2026",
    color: colors.green,
    avatar: require("@/images/avatars/emily.png"),
    stats: { habits: 8, bestStreak: 63, friends: 156, circles: 5, weeklyConsistency: 0.91 },
  },
  {
    id: "d0000000-0000-0000-0000-000000000004",
    name: "Joel",
    email: "joel@demo.presence.club",
    password: "demo2026",
    color: colors.blue,
    avatar: require("@/images/avatars/joel.png"),
    stats: { habits: 4, bestStreak: 22, friends: 67, circles: 2, weeklyConsistency: 0.58 },
  },
];

/** Look up a demo user by their Supabase user ID. */
export function getDemoUserById(userId: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.id === userId);
}
