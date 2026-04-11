import { colors } from "@/lib/theme";

export type MockUser = {
  id: string;
  name: string;
  handle: string;
  color: string;
  letter: string;
};

/**
 * Pool of fake users for the social feed.
 * Generic names, random accent colors, single-letter avatars.
 */
export const MOCK_USERS: MockUser[] = [
  { id: "a0000000-0000-0000-0000-000000000001", name: "Sarah K.", handle: "@sarahk", color: colors.blue, letter: "S" },
  { id: "a0000000-0000-0000-0000-000000000002", name: "Mia Chen", handle: "@miachen", color: colors.green, letter: "M" },
  { id: "a0000000-0000-0000-0000-000000000003", name: "Jae Park", handle: "@jaepark", color: colors.cyan, letter: "J" },
  { id: "a0000000-0000-0000-0000-000000000004", name: "Theo Vinci", handle: "@theov", color: colors.orange, letter: "T" },
  { id: "a0000000-0000-0000-0000-000000000005", name: "Nina Ray", handle: "@ninaray", color: colors.magenta, letter: "N" },
  { id: "a0000000-0000-0000-0000-000000000006", name: "Omar H.", handle: "@omarh", color: colors.yellow, letter: "O" },
  { id: "a0000000-0000-0000-0000-000000000007", name: "Kai Lo", handle: "@kailo", color: colors.purple, letter: "K" },
  { id: "a0000000-0000-0000-0000-000000000008", name: "Ava Lin", handle: "@avalin", color: colors.red, letter: "A" },
  { id: "a0000000-0000-0000-0000-000000000009", name: "Leo Cruz", handle: "@leocruz", color: colors.orange, letter: "L" },
  { id: "a0000000-0000-0000-0000-000000000010", name: "Zoe Kim", handle: "@zoekim", color: colors.cyan, letter: "Z" },
  { id: "a0000000-0000-0000-0000-000000000011", name: "Ravi S.", handle: "@ravis", color: colors.green, letter: "R" },
  { id: "a0000000-0000-0000-0000-000000000012", name: "Ella Wu", handle: "@ellawu", color: colors.magenta, letter: "E" },
];

