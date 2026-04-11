import { type ImageSourcePropType } from "react-native";
import { colors } from "@/lib/theme";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  color: string;
  avatar: ImageSourcePropType | null;
};

export const DEMO_USERS: DemoUser[] = [
  {
    id: "d0000000-0000-0000-0000-000000000001",
    name: "Jack",
    email: "jack@demo.presence.club",
    password: "demo2026",
    color: colors.primary,
    avatar: require("@/images/avatars/jack.png"),
  },
  {
    id: "d0000000-0000-0000-0000-000000000002",
    name: "Ryan",
    email: "ryan@demo.presence.club",
    password: "demo2026",
    color: colors.orange,
    avatar: require("@/images/avatars/ryan.jpeg"),
  },
  {
    id: "d0000000-0000-0000-0000-000000000003",
    name: "Emily",
    email: "emily@demo.presence.club",
    password: "demo2026",
    color: colors.green,
    avatar: require("@/images/avatars/emily.png"),
  },
  {
    id: "d0000000-0000-0000-0000-000000000004",
    name: "Joel",
    email: "joel@demo.presence.club",
    password: "demo2026",
    color: colors.blue,
    avatar: require("@/images/avatars/joel.png"),
  },
];

/** Look up a demo user by their Supabase user ID. */
export function getDemoUserById(userId: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.id === userId);
}
