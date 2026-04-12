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
import { HABITS as DEMO_HABITS } from "@/lib/mock";
import { colors } from "@/lib/theme";
import { supabase } from "@/lib/supabase";

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
  targetTime: string; // raw HH:MM:SS from DB
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
const CUSTOM_FREQUENCY_PREFIX = "custom:";
const WEEKDAY_LABELS: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

// ---------------------------------------------------------------------------
// Mock habits — times are relative to "now" so every state is always visible
// ---------------------------------------------------------------------------

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function offsetTime(minutesFromNow: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutesFromNow);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

function mockHabit(
  id: string,
  name: string,
  icon: typeof SunriseIcon,
  accent: string,
  streak: number,
  minutesFromNow: number,
  done: boolean,
  category: string,
  circleId: string,
): HabitView {
  const targetTime = offsetTime(minutesFromNow);
  return {
    id,
    name,
    icon,
    accent,
    streak,
    time: formatTime(targetTime),
    targetTime,
    done,
    category,
    circleId,
  };
}

export function generateMockHabits(): HabitView[] {
  return [
    mockHabit("1", "Morning walk", SunriseIcon, colors.orange, 12, -120, true, "morning", "mock-circle-1"),
    mockHabit("3", "Meditate", Yoga01Icon, colors.purple, 23, 15, false, "meditation", "mock-circle-3"),
    mockHabit("2", "Drink water", DropletIcon, colors.cyan, 5, -20, false, "water", "mock-circle-4"),
    mockHabit("4", "Read 10 pages", BookOpen01Icon, colors.blue, 3, 180, false, "reading", "mock-circle-2"),
  ];
}

export function categoryMeta(category: string) {
  return CATEGORY_MAP[category] ?? DEFAULT_CATEGORY;
}

/** Format a DB time string (HH:MM:SS) into "7:00 AM". */
export function formatTime(dbTime: string): string {
  const [h, m] = dbTime.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function formatFrequency(frequency: string): string {
  if (frequency === "daily") return "Daily";
  if (frequency === "weekdays") return "Weekdays";
  if (frequency === "weekends") return "Weekends";
  if (frequency.startsWith(CUSTOM_FREQUENCY_PREFIX)) {
    const labels = frequency
      .slice(CUSTOM_FREQUENCY_PREFIX.length)
      .split(",")
      .map((day) => WEEKDAY_LABELS[day])
      .filter(Boolean);
    return labels.length > 0 ? labels.join(" ") : "Custom";
  }
  return frequency;
}

// ---------------------------------------------------------------------------
// Demo time overrides — makes habits always show urgency states regardless of
// actual target_time. Cycles through: done → overdue → due soon → upcoming.
// ---------------------------------------------------------------------------

// Urgency offsets applied to not-yet-done habits so at least one is overdue,
// one is due-soon, and the rest are upcoming. Already-done habits keep their
// real status (avoids "already posted" errors) and get a past time.
const NOT_DONE_OFFSETS = [-20, 15, 180]; // overdue, due-soon, upcoming

function applyDemoTimes(habits: HabitView[]): HabitView[] {
  let notDoneIdx = 0;
  return habits.map((h) => {
    if (h.done) {
      // Already verified — keep done, just shift time to the past
      const targetTime = offsetTime(-120);
      return { ...h, targetTime, time: formatTime(targetTime) };
    }
    const mins = NOT_DONE_OFFSETS[notDoneIdx % NOT_DONE_OFFSETS.length];
    notDoneIdx++;
    const targetTime = offsetTime(mins);
    return { ...h, targetTime, time: formatTime(targetTime) };
  });
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

/**
 * Fetch all habits for a user, enriched with streak and today's status.
 */
export async function fetchHabits(userId: string): Promise<HabitView[]> {
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

  // Batch-fetch today's instances (use local day range to match how instances are created)
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const habitIds = habits.map((h: DbHabit) => h.id);
  const { data: instances } = await supabase
    .from("habit_instances")
    .select("habit_id, status")
    .in("habit_id", habitIds)
    .gte("scheduled_for", dayStart.toISOString())
    .lt("scheduled_for", dayEnd.toISOString());

  const statusMap = new Map<string, string>();
  (instances ?? []).forEach((i: { habit_id: string; status: string }) => {
    statusMap.set(i.habit_id, i.status);
  });

  const views = habits.map((h: DbHabit): HabitView => {
    const meta = categoryMeta(h.category);
    return {
      id: h.id,
      name: h.name,
      icon: meta.icon,
      accent: meta.accent,
      streak: streakMap.get(h.circle_id) ?? 0,
      time: formatTime(h.target_time),
      targetTime: h.target_time,
      done: statusMap.get(h.id) === "verified",
      category: h.category,
      circleId: h.circle_id,
    };
  });

  return views;
}

/** Extended view for the habit detail page. */
export type HabitDetailView = HabitView & {
  bestStreak: number;
  frequency: string;
  completionRate: number;
  totalCompleted: number;
  totalScheduled: number;
  history: { day: string; done: boolean }[];
  /** Last 30 days, oldest → newest. true = completed that day. */
  monthHistory: boolean[];
};

export function getMockHabitDetail(habitId: string): HabitDetailView | null {
  const habit = generateMockHabits().find((item) => item.id === habitId);
  const demoHabit = DEMO_HABITS.find((item) => item.id === habitId);

  if (!habit || !demoHabit) {
    return null;
  }

  const totalScheduled = demoHabit.history.length;
  const totalCompleted = demoHabit.history.filter(Boolean).length;
  const history = demoHabit.history.map((done, index) => ({
    day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index] ?? "Day",
    done,
  }));

  const monthHistory = generateMonthHistory(habitId);

  return {
    ...habit,
    bestStreak: demoHabit.bestStreak,
    frequency: formatFrequency("daily"),
    completionRate: totalScheduled > 0 ? totalCompleted / totalScheduled : 0,
    totalCompleted,
    totalScheduled,
    history,
    monthHistory,
  };
}

function generateMonthHistory(habitId: string): boolean[] {
  const patterns: Record<string, boolean[]> = {
    "1": [
      true,true,true,false,true,true,true,true,false,true,
      true,true,true,true,false,false,true,true,true,true,
      true,false,true,true,true,true,true,true,true,true,
    ],
    "2": [
      false,true,false,true,true,false,true,false,false,true,
      true,false,true,true,false,true,false,true,true,true,
      false,true,true,false,true,true,false,false,true,true,
    ],
    "3": [
      true,true,true,true,true,false,true,true,true,true,
      true,true,false,true,true,true,true,true,true,false,
      true,true,true,true,true,true,true,true,true,true,
    ],
    "4": [
      false,false,true,false,true,true,false,false,true,true,
      false,true,false,true,true,false,true,true,false,true,
      true,false,true,false,true,true,true,false,true,true,
    ],
  };
  return patterns[habitId] ?? patterns["1"]!;
}

/**
 * Fetch a single habit by ID with detail stats for the detail page.
 */
export async function fetchHabitDetail(
  habitId: string,
  userId: string,
): Promise<HabitDetailView | null> {
  const { data: habit, error } = await supabase
    .from("habits")
    .select("*")
    .eq("id", habitId)
    .single();

  if (error || !habit) {
    console.warn("[habits] detail fetch error:", error?.message);
    return null;
  }

  const h = habit as DbHabit;
  const meta = categoryMeta(h.category);

  // Streak
  const { data: member } = await supabase
    .from("circle_members")
    .select("current_streak, best_streak")
    .eq("circle_id", h.circle_id)
    .eq("user_id", userId)
    .single();

  const currentStreak = member?.current_streak ?? 0;
  const bestStreak = member?.best_streak ?? 0;

  // Today's status (use local day range to match how instances are created)
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const { data: todayInstance } = await supabase
    .from("habit_instances")
    .select("status")
    .eq("habit_id", habitId)
    .gte("scheduled_for", dayStart.toISOString())
    .lt("scheduled_for", dayEnd.toISOString())
    .limit(1)
    .single();

  // Last 30 days instances for stats
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const { data: instances } = await supabase
    .from("habit_instances")
    .select("status, scheduled_for")
    .eq("habit_id", habitId)
    .gte("scheduled_for", cutoff.toISOString())
    .order("scheduled_for", { ascending: true });

  const allInstances = instances ?? [];
  const totalScheduled = allInstances.length;
  const totalCompleted = allInstances.filter((i) => i.status === "verified").length;
  const completionRate = totalScheduled > 0 ? totalCompleted / totalScheduled : 0;

  // This week history (last 7 days)
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const history: { day: string; done: boolean }[] = [];
  for (let d = 6; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().slice(0, 10);
    const instance = allInstances.find((i) =>
      i.scheduled_for.startsWith(dateStr)
    );
    history.push({
      day: dayNames[date.getDay()],
      done: instance?.status === "verified",
    });
  }

  // Last 30 days for contribution graph
  const monthHistory: boolean[] = [];
  for (let d = 29; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().slice(0, 10);
    const instance = allInstances.find((i) =>
      i.scheduled_for.startsWith(dateStr)
    );
    monthHistory.push(instance?.status === "verified");
  }

  return {
    id: h.id,
    name: h.name,
    icon: meta.icon,
    accent: meta.accent,
    streak: currentStreak,
    bestStreak,
    time: formatTime(h.target_time),
    targetTime: h.target_time,
    done: todayInstance?.status === "verified",
    category: h.category,
    circleId: h.circle_id,
    frequency: formatFrequency(h.frequency),
    completionRate,
    totalCompleted,
    totalScheduled,
    history,
    monthHistory,
  };
}

/**
 * Create a new habit.
 */
export async function createHabit(habit: {
  name: string;
  category: string;
  verification_mode: "verifiable" | "trust";
  target_time: string; // HH:MM or HH:MM:SS
  frequency?: string;
  circle_id: string;
  user_id: string;
}) {
  const { data, error } = await supabase
    .from("habits")
    .insert({
      user_id: habit.user_id,
      circle_id: habit.circle_id,
      name: habit.name,
      category: habit.category,
      verification_mode: habit.verification_mode,
      target_time: habit.target_time,
      frequency: habit.frequency ?? "daily",
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
