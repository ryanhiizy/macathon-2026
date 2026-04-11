import {
  SunriseIcon,
  DropletIcon,
  BookOpen01Icon,
  Yoga01Icon,
  Dumbbell01Icon,
  RunningShoesIcon,
  CookBookIcon,
  NaturalFoodIcon,
} from "@hugeicons/core-free-icons";
import { colors } from "@/lib/theme";
import { supabase, getTestUserId } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Row shape from the `habits` table. */
export type DbHabit = {
  id: string;
  user_id: string;
  circle_id: string;
  name: string;
  category: string;
  verification_mode: "verifiable" | "trust";
  target_time: string; // HH:MM:SS
  frequency: string;
  created_at: string;
};

/** What the UI consumes — DB row enriched with derived display fields. */
export type HabitView = {
  id: string;
  name: string;
  icon: typeof SunriseIcon;
  accent: string;
  streak: number;
  time: string; // formatted, e.g. "7:00 AM"
  done: boolean;
  category: string;
  circleId: string;
};

// ---------------------------------------------------------------------------
// Category → icon / accent mapping
// ---------------------------------------------------------------------------

const CATEGORY_MAP: Record<string, { icon: typeof SunriseIcon; accent: string }> = {
  gym: { icon: Dumbbell01Icon, accent: colors.orange },
  running: { icon: RunningShoesIcon, accent: colors.green },
  cooking: { icon: CookBookIcon, accent: colors.red },
  meal_prep: { icon: NaturalFoodIcon, accent: colors.yellow },
  reading: { icon: BookOpen01Icon, accent: colors.blue },
  meditation: { icon: Yoga01Icon, accent: colors.purple },
  water: { icon: DropletIcon, accent: colors.cyan },
  morning: { icon: SunriseIcon, accent: colors.orange },
};

const DEFAULT_CATEGORY = { icon: SunriseIcon, accent: colors.primary };

function categoryMeta(category: string) {
  return CATEGORY_MAP[category] ?? DEFAULT_CATEGORY;
}

/** Format a DB time string (HH:MM:SS) into "7:00 AM". */
function formatTime(dbTime: string): string {
  const [h, m] = dbTime.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

/**
 * Fetch all habits for a user, enriched with streak and today's status.
 */
export async function fetchHabits(userId: string = getTestUserId()): Promise<HabitView[]> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const { data: habits, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .order("target_time", { ascending: true });

  if (error) {
    console.warn("[habits] fetch error:", error.message);
    return [];
  }

  if (!habits || habits.length === 0) return [];

  // Batch-fetch streaks from circle_members
  const circleIds = [...new Set(habits.map((h: DbHabit) => h.circle_id))];
  const { data: members } = await supabase
    .from("circle_members")
    .select("circle_id, current_streak")
    .eq("user_id", userId)
    .in("circle_id", circleIds);

  const streakMap = new Map<string, number>();
  (members ?? []).forEach((m: { circle_id: string; current_streak: number }) => {
    streakMap.set(m.circle_id, m.current_streak);
  });

  // Batch-fetch today's instances
  const habitIds = habits.map((h: DbHabit) => h.id);
  const { data: instances } = await supabase
    .from("habit_instances")
    .select("habit_id, status")
    .in("habit_id", habitIds)
    .gte("scheduled_for", `${today}T00:00:00`)
    .lt("scheduled_for", `${today}T23:59:59`);

  const statusMap = new Map<string, string>();
  (instances ?? []).forEach((i: { habit_id: string; status: string }) => {
    statusMap.set(i.habit_id, i.status);
  });

  return habits.map((h: DbHabit): HabitView => {
    const meta = categoryMeta(h.category);
    return {
      id: h.id,
      name: h.name,
      icon: meta.icon,
      accent: meta.accent,
      streak: streakMap.get(h.circle_id) ?? 0,
      time: formatTime(h.target_time),
      done: statusMap.get(h.id) === "verified",
      category: h.category,
      circleId: h.circle_id,
    };
  });
}

/**
 * Create a new habit.
 */
export async function createHabit(habit: {
  name: string;
  category: string;
  verification_mode: "verifiable" | "trust";
  target_time: string; // HH:MM or HH:MM:SS
  circle_id: string;
  user_id?: string;
}) {
  const { data, error } = await supabase
    .from("habits")
    .insert({
      user_id: habit.user_id ?? getTestUserId(),
      circle_id: habit.circle_id,
      name: habit.name,
      category: habit.category,
      verification_mode: habit.verification_mode,
      target_time: habit.target_time,
    })
    .select()
    .single();

  if (error) {
    console.warn("[habits] create error:", error.message);
    return null;
  }
  return data as DbHabit;
}

/**
 * Update an existing habit.
 */
export async function updateHabit(
  id: string,
  updates: Partial<Pick<DbHabit, "name" | "category" | "verification_mode" | "target_time">>
) {
  const { data, error } = await supabase
    .from("habits")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.warn("[habits] update error:", error.message);
    return null;
  }
  return data as DbHabit;
}

/**
 * Delete a habit.
 */
export async function deleteHabit(id: string) {
  const { error } = await supabase.from("habits").delete().eq("id", id);

  if (error) {
    console.warn("[habits] delete error:", error.message);
    return false;
  }
  return true;
}
