# Feature: Notifications

Two distinct notification paths. Both use the same `expo-notifications` module.

## 1. Habit prompt notifications (local, scheduled)

Every habit has a target time. When the user creates or enables a habit, the app schedules a **local notification** on-device for the next occurrence, with a random ±15 minute jitter.

```ts
import * as Notifications from 'expo-notifications';

const fireTime = computeJitteredFireTime(habit.targetTime); // ±15 min
await Notifications.scheduleNotificationAsync({
  content: {
    title: habit.name,
    body: "Your window just opened — tap to snap",
    data: { habitId: habit.id, type: 'habit_prompt' },
  },
  trigger: { date: fireTime },
});
```

When the user taps the notification, a listener routes them to `app/capture/[habitId].tsx`:

```ts
Notifications.addNotificationResponseReceivedListener(response => {
  const { habitId, type } = response.notification.request.content.data;
  if (type === 'habit_prompt') router.push(`/capture/${habitId}`);
});
```

### Scheduling window

- Schedule the **next 7 days** of instances at a time. When the user opens the app, top up the schedule so there's always a week of pending notifications.
- iOS hard cap: **64 pending scheduled notifications per app**. Math: 7 habits × 7 days = 49. Safe.
- When a habit is edited or deleted, cancel its pending notifications first via `Notifications.cancelScheduledNotificationAsync`.

## 2. Circle event notifications (in-app, Realtime)

When a circle member misses a habit or posts a verified snap, other members should see it immediately.

**In V1, these are in-app only** — delivered via Supabase Realtime subscriptions while the app is open. Users get a top-of-screen toast + the feed updates.

```ts
supabase
  .channel(`circle:${circleId}`)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'snaps' }, payload => {
    showToast(`${payload.new.user_name} just verified!`);
  })
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'habit_instances' }, payload => {
    if (payload.new.status === 'missed') {
      showToast(`${payload.new.user_name} missed their streak 💀`);
    }
  })
  .subscribe();
```

## Why no remote push?

Expo Go doesn't reliably support it. Local scheduling covers the demo — habit prompts fire on-device, circle events show up in-app via Realtime while the app is open. Good enough.

## Permission request timing

Ask for notification permission when the user creates their first habit, not at launch.
