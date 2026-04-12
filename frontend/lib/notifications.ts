import * as Notifications from "expo-notifications";
import { Dumbbell01Icon } from "@hugeicons/core-free-icons";
import { fetchHabits, type HabitView } from "@/lib/habits";
import { supabase } from "@/lib/supabase";
import { CHAT_THREADS } from "@/lib/mock";
import { colors } from "@/lib/theme";

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

const DEMO_GYM_HABIT: HabitView = {
  id: "demo-gym-habit",
  name: "Gym",
  icon: Dumbbell01Icon,
  accent: colors.orange,
  streak: 0,
  time: "6:00 PM",
  targetTime: "18:00:00",
  done: false,
  category: "gym",
  circleId: "demo-circle",
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
  _habit?: HabitView | null,
  _userId?: string,
): Promise<string | null> {
  const granted = await requestNotificationPermissions();
  if (!granted) return null;

  const target = DEMO_GYM_HABIT;

  const prompt = promptForHabit(target);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Stay present, Time to prove it: ${target.name}`,
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

// ---------------------------------------------------------------------------
// Real habit notification scheduling — fires at each habit's target_time daily
// ---------------------------------------------------------------------------

/** Adds `addMinutes` to an hour:minute pair, wrapping at 24h. */
function offsetHM(hour: number, minute: number, addMinutes: number) {
  const total = hour * 60 + minute + addMinutes;
  const wrapped = ((total % 1440) + 1440) % 1440; // keep in 0-1439
  return { hour: Math.floor(wrapped / 60), minute: wrapped % 60 };
}

/**
 * Cancel all previously scheduled habit notifications and reschedule
 * for every habit passed in. Call this whenever habits change.
 *
 * Per habit we schedule TWO notifications:
 *  1. At target_time — "Time to prove it: {name}"
 *  2. At target_time + 28 min — "2 minutes left, prove it now or lose your streak: {name}"
 */
export async function scheduleHabitNotifications(
  habits: HabitView[],
): Promise<void> {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  // Cancel all existing scheduled notifications (habit + demo) and re-create
  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const habit of habits) {
    if (habit.done) continue; // no point notifying for already-done today

    const [hStr, mStr] = habit.targetTime.split(":");
    const hour = Number(hStr);
    const minute = Number(mStr);
    if (Number.isNaN(hour) || Number.isNaN(minute)) continue;

    const prompt = DEMO_PROMPTS[habit.category] ?? "Time to prove it.";

    // 1. Main notification at target time
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time to prove it: ${habit.name}`,
        body: prompt,
        data: { habitId: habit.id, screen: "camera" },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      },
    });

    // 2. Urgency notification 2 min before window closes (target + 28 min)
    const warn = offsetHM(hour, minute, 28);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `2 minutes left, prove it now or lose your streak: ${habit.name}`,
        body: "Your window closes in 2 minutes!",
        data: { habitId: habit.id, screen: "camera" },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: warn.hour,
        minute: warn.minute,
        repeats: true,
      },
    });

    console.log(
      `[notifications] scheduled "${habit.name}" at ${hour}:${String(minute).padStart(2, "0")} + warning at ${warn.hour}:${String(warn.minute).padStart(2, "0")}`,
    );
  }
}

/**
 * Schedule a single habit's two notifications (main + 2-min warning).
 * Used right after creating or editing a habit.
 */
export async function scheduleOneHabitNotification(
  habit: { id: string; name: string; category: string; targetTime: string },
): Promise<string | null> {
  const granted = await requestNotificationPermissions();
  if (!granted) return null;

  const [hStr, mStr] = habit.targetTime.split(":");
  const hour = Number(hStr);
  const minute = Number(mStr);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;

  const prompt = DEMO_PROMPTS[habit.category] ?? "Time to prove it.";

  // 1. Main notification
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Time to prove it: ${habit.name}`,
      body: prompt,
      data: { habitId: habit.id, screen: "camera" },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    },
  });

  // 2. Urgency warning at target + 28 min
  const warn = offsetHM(hour, minute, 28);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `2 minutes left, prove it now or lose your streak: ${habit.name}`,
      body: "Your window closes in 2 minutes!",
      data: { habitId: habit.id, screen: "camera" },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: warn.hour,
      minute: warn.minute,
      repeats: true,
    },
  });

  console.log(
    `[notifications] scheduled "${habit.name}" at ${hour}:${String(minute).padStart(2, "0")} + warning at ${warn.hour}:${String(warn.minute).padStart(2, "0")}`,
  );
  return id;
}

// ---------------------------------------------------------------------------
// Test helpers — fire real habit notifications immediately for testing
// ---------------------------------------------------------------------------

/**
 * Fire ONLY the 2-min warning notification for every un-done habit.
 * Use the existing "Send test notification" button for the main one.
 */
export async function testWarningNotifications(
  userId: string,
): Promise<number> {
  const granted = await requestNotificationPermissions();
  if (!granted) return 0;

  const habits = await fetchHabits(userId);
  const pending = habits.filter((h) => !h.done);
  if (pending.length === 0) return 0;

  let delaySec = 3;

  for (const habit of pending) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `2 minutes left, prove it now or lose your streak: ${habit.name}`,
        body: "Your window closes in 2 minutes!",
        data: { habitId: habit.id, screen: "camera" },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delaySec,
      },
    });

    console.log(`[test-notif] warning for "${habit.name}" at +${delaySec}s`);
    delaySec += 8;
  }

  return pending.length;
}

// ---------------------------------------------------------------------------
// Message push notifications (Instagram-style)
// ---------------------------------------------------------------------------

/** The conversation the user is currently viewing (set by chat screen) */
let activeConversationId: string | null = null;

export function setActiveConversation(id: string | null) {
  activeConversationId = id;
}

/**
 * Fire a local notification for an incoming message.
 * Instagram-style: sender name, message preview, "now".
 */
async function triggerMessageNotification(
  senderName: string,
  body: string,
  conversationId: string,
  isGroup: boolean,
) {
  const thread = CHAT_THREADS.find((t) => t.id === conversationId);
  const name = isGroup && thread ? thread.name : senderName;
  const preview = isGroup ? `${senderName}: ${body}` : body;
  const trimmed = preview.length > 100 ? preview.slice(0, 97) + "..." : preview;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: name,
      body: trimmed,
      data: { conversationId, screen: "chat" },
      sound: "default",
      ...(conversationId ? { threadId: conversationId } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
    },
  });
}

/**
 * Subscribe to all new messages globally and fire push notifications
 * for messages from other users. Call once at app startup.
 * Returns an unsubscribe function.
 */
export function subscribeToMessageNotifications(currentUserId: string) {
  const channel = supabase
    .channel("global-msg-notifications")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => {
        const msg = payload.new as {
          sender_id: string;
          sender_name: string;
          body: string;
          conversation_id: string;
        };

        // Don't notify for own messages
        if (msg.sender_id === currentUserId) return;

        // Don't notify if user is already viewing that conversation
        if (msg.conversation_id === activeConversationId) return;

        const thread = CHAT_THREADS.find((t) => t.id === msg.conversation_id);
        const isGroup = thread?.isGroup ?? false;

        console.log("[msg-notif] incoming from", msg.sender_name, "→ firing notification");
        triggerMessageNotification(
          msg.sender_name,
          msg.body,
          msg.conversation_id,
          isGroup,
        );
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
