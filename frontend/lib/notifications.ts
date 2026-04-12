import * as Notifications from "expo-notifications";
import { fetchHabits, type HabitView } from "@/lib/habits";

// ---------------------------------------------------------------------------
// Handler — show banner even when app is foregrounded
// ---------------------------------------------------------------------------

export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

export async function requestNotificationPermissions(): Promise<boolean> {
  const existing =
    (await Notifications.getPermissionsAsync()) as unknown as { status: string };
  if (existing.status === "granted") return true;

  const result =
    (await Notifications.requestPermissionsAsync()) as unknown as { status: string };
  return result.status === "granted";
}

// ---------------------------------------------------------------------------
// Demo trigger — fires a notification in `delaySec` seconds for any habit
// ---------------------------------------------------------------------------

const DEMO_PROMPTS: Record<string, string> = {
  gym: "Show us your warm-up — flex or stretch, you pick.",
  running: "Throw a peace sign mid-stride on your run.",
  cooking: "Show what's on the cutting board right now.",
  meal_prep: "Open the fridge — let us see today's prep.",
  reading: "Hold up the book — reveal the cover.",
  meditation: "Show your peaceful meditation corner.",
  water: "Show your water bottle — how full is it right now?",
  morning: "Capture the view from your morning spot.",
};

function promptForHabit(habit: HabitView): string {
  return DEMO_PROMPTS[habit.category] ?? "Show us something honest.";
}

/**
 * Schedule a demo notification that fires after `delaySec` seconds.
 * If `habit` is provided, uses that habit. Otherwise picks the first
 * un-done habit from the database (requires `userId`).
 */
export async function triggerDemoNotification(
  delaySec = 5,
  habit?: HabitView | null,
  userId?: string,
): Promise<string | null> {
  const granted = await requestNotificationPermissions();
  if (!granted) return null;

  let target = habit;
  if (!target && userId) {
    const habits = await fetchHabits(userId);
    target = habits.find((h) => !h.done) ?? habits[0] ?? null;
  }

  if (!target) return null;

  const prompt = promptForHabit(target);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Time to prove: ${target.name}`,
      body: prompt,
      data: { habitId: target.id, screen: "camera" },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: delaySec,
    },
  });

  return id;
}
