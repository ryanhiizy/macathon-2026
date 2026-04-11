# Feature: Streaks

A streak is the count of consecutive days a user has verified a habit within a Circle.

## Rules

- **+1** for each verified snap submitted before the window closes
- **Reset to 0** on any missed instance — no grace period, no streak freeze in V1
- **Per Circle**, not per user globally. A user can have streak 12 in "Morning Gym" and streak 0 in "Journalling" simultaneously.
- **Group Prove** counts as a verified snap for each participant — all streaks increment.

## Storage

`circle_members.current_streak` is the canonical value. `circle_members.best_streak` tracks the all-time high.

## Increment Path (client → server)

```
verified snap submitted
    │
    ▼
client-side update after successful snap insert (gated by RLS)
    │
    ▼
circle_members.current_streak += 1
circle_members.best_streak = max(best_streak, current_streak)
    │
    ▼
Realtime broadcast to all circle members
```

## Reset Path (server-side only)

The client is **never trusted** to reset streaks. A scheduled pg_cron job runs every minute:

1. Select all `habit_instances` where `status = 'pending'` AND `window_closes_at < now()`
2. Mark them `missed`
3. Reset `circle_members.current_streak = 0`
4. Insert a "streak broken" event → Realtime broadcasts to the Circle

See [`../infrastructure/supabase.md`](../infrastructure/supabase.md) for the cron job definition.

## Why Server-Side

- A user can kill the app to "freeze time" — client timers can't be trusted
- Realtime notifications to other members must fire even if the missing user's app is closed
- Streak integrity is the whole product mechanic — this must be bulletproof

## Milestone Celebrations

When a user hits a significant streak (50, 100 days), a **celebration card** appears in the Home feed:
- User's name and avatar
- Which habit and which Circle
- The streak milestone number
- "Celebrate" action button for friends to tap

Milestone thresholds: `[7, 14, 30, 50, 100]` days. Check client-side after each streak increment; if `new_streak` is in the list, insert a milestone event row (or just use the streak value on the snap row to drive the card in the feed).

## Display

- Streak count on habit cards (Habits page)
- Streak badge on solo post cards (Home feed + Circle feed)
- Individual streak chips on group post cards (one per participant)
- Leaderboard in Circle detail (All Time and Monthly tabs)
- Best streak in the Profile stats bar
- Streak counter animates on increment with a haptic pulse
- Streak reset triggers a "shatter" animation + danger-colored toast
