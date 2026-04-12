import * as Notifications from "expo-notifications";
import { fetchHabits, type HabitView } from "@/lib/habits";
import { supabase } from "@/lib/supabase";
import { CHAT_THREADS } from "@/lib/mock";

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
