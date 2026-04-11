# Feature: Streaks

A streak is the count of consecutive habit instances a user has verified in a row within a circle.

## Rules

- **+1** for each verified snap submitted before the window closes
- **Reset to 0** on any missed instance — no grace period, no streak freeze
- **Per circle**, not per user globally. A user can have streak 12 in "Morning Gym" and streak 0 in "Journalling" simultaneously.

## Storage

`circle_members.current_streak` is the canonical value. Incremented on verified snap, reset by the server-side cron.

## Increment path (client → server)

```
verified snap submitted
    │
    ▼
Postgres trigger or client-side update
    │
    ▼
circle_members.current_streak += 1
    │
    ▼
Realtime broadcast to all circle members
```

We implement this as a client-side update after a successful snap insert, gated by RLS. A DB trigger would be cleaner but not needed in V1.

## Reset path (server-side only)

This is the critical bit: **the client is never trusted to reset streaks**. A scheduled job runs every minute and:

1. Selects all `habit_instances` where `status = 'pending'` AND `window_closes_at < now()`
2. Marks them `missed`
3. Resets the corresponding `circle_members.current_streak = 0`
4. Inserts a "streak broken" event that Realtime broadcasts to the circle

Implemented via `pg_cron`. See [`../infrastructure/supabase.md`](../infrastructure/supabase.md).

## Why server-side

- A user can kill the app to "freeze time" — can't trust client timers
- Realtime notifications to other members need to fire even if the missing user's app is closed
- The streak integrity story is the whole product — this must be bulletproof

## Display

- Streak count on the circle feed next to each member's snap
- Streak badge on user profile (per circle)
- Streak counter animates on increment with a haptic
- Streak reset animates with a "snap" / shatter feel and a danger-colored toast

