# Hackathon MVP Task Board

Use this board to keep the team on the shortest path to a working demo.
Every section is designed so tasks within it can be worked on in **parallel** by different people/agents once their dependencies are met.

## Status legend

- `todo` — not started
- `doing` — actively in progress
- `blocked` — waiting on another task
- `done` — complete and verified

## Decision: no YOLO / AI server for MVP

All verification is **trust-based** (photo submission = verified). Prompts come from a **static JSON bank** (`constants/prompts.json`). The FastAPI server is out of scope for the demo.

---

## 1. Database & Supabase (separate workspace)

All done in a separate worktree. Frontend work that needs Supabase depends on DB1.

| ID | Status | Depends on | Done when |
|---|---|---|---|
| DB1 | `todo` | none | Supabase project created, URL + anon key in `.env` |
| DB2 | `todo` | DB1 | All tables created: `profiles`, `circles`, `circle_members`, `habits`, `habit_instances`, `snaps`, `snap_participants`, `likes`, `follows` |
| DB3 | `todo` | DB2 | RLS policies applied (permissive `authenticated` read/write for demo) |
| DB4 | `todo` | DB1 | Public `snaps` storage bucket created, path convention `snaps/<circle_id>/<user_id>/<uuid>.jpg` |
| DB5 | `todo` | DB2 | Realtime enabled on `snaps` and `habit_instances` tables |
| DB6 | `todo` | DB2 | `pg_cron` extension enabled, `expire-habit-windows` job runs every minute (mark missed + reset streaks) |
| DB7 | `todo` | DB1 | Auth configured: magic link / OTP, redirect URL set to `exp://` for Expo Go |

> **Schema note:** `docs/infrastructure/supabase.md` SQL is missing `snap_participants`, `likes`, and `follows` tables that appear in `docs/architecture/data-model.md`. Whoever applies the schema should reconcile and include all tables.

---

## 2. Frontend infrastructure

These are the foundation blocks everything else depends on. Do them first, in order.

| ID | Status | Depends on | Done when |
|---|---|---|---|
| INF1 | `todo` | none | TypeScript types for all database tables (`types/database.ts`) |
| INF2 | `todo` | none | Design system constants: `constants/colors.ts` (palette from design-system.md), typography, spacing |
| INF3 | `todo` | none | Static prompt bank (`constants/prompts.json`) — solo + group prompts for each category, same shape as `/generate-prompt` response |
| INF4 | `todo` | DB1 | Supabase client initialised in `lib/supabase.ts` with env vars |
| INF5 | `todo` | INF4 | Auth context/provider — exposes session state, sign-in, sign-out |
| INF6 | `todo` | INF5 | Root layout (`app/_layout.tsx`) — auth gate wrapping the app, providers |
| INF7 | `todo` | INF6 | Tab navigation layout (`app/(tabs)/_layout.tsx`) — Home, Habits, Circles, Profile bottom tabs with icons |

### Parallel: INF1, INF2, INF3 can all start immediately with zero dependencies.

---

## 3. Auth screens

| ID | Status | Depends on | Done when |
|---|---|---|---|
| AUTH1 | `todo` | INF6, DB7 | Sign-in screen (`app/index.tsx`) — email input, triggers magic link / OTP |
| AUTH2 | `todo` | AUTH1 | Auth callback handler (`app/auth/callback.tsx`) — parses session from `exp://` redirect, calls `setSession` |
| AUTH3 | `todo` | AUTH2, DB2 | Profile creation on first sign-in — display name + handle form, inserts `profiles` row |

---

## 4. Habits page

| ID | Status | Depends on | Done when |
|---|---|---|---|
| HAB1 | `todo` | INF7, DB2 | Habits list screen (`app/(tabs)/habits.tsx`) — fetches user's habits from Supabase, renders list |
| HAB2 | `todo` | INF2 | Daily progress ring component — circular ring showing completed/total, text label |
| HAB3 | `todo` | INF2 | Habit card component — icon, name, streak count, scheduled time, Prove button, Invite button, completed check state |
| HAB4 | `todo` | INF7, DB2 | Create habit form (`app/habits/new.tsx`) — name, category picker (gym/running/cooking/meal_prep/reading/meditation/water), target time picker, frequency, circle selection |
| HAB5 | `todo` | HAB4 | Creating a habit also inserts the first `habit_instance` row with `scheduled_for` (target time ± 15 min jitter) and `window_closes_at` (+30 min) |

### Parallel: HAB2 and HAB3 are pure UI components — build them anytime after INF2.

---

## 5. Solo camera & capture

This is the centrepiece of the demo. Get this right first.

| ID | Status | Depends on | Done when |
|---|---|---|---|
| CAM1 | `todo` | INF7 | Camera permission request + denial handling (ask when user first taps Prove, not at launch) |
| CAM2 | `todo` | CAM1, INF3 | Solo camera screen (`app/capture/[habitId].tsx`) — full-bleed `<CameraView>`, prompt card floating above viewfinder, deadline countdown, controls (flip camera, flash, shutter with haptic) |
| CAM3 | `todo` | CAM2 | Capture flow — `takePictureAsync` → confirm/retake modal with photo preview |
| CAM4 | `todo` | CAM3, DB4 | Photo upload — upload confirmed photo to Supabase Storage at `snaps/<circle_id>/<user_id>/<uuid>.jpg` |
| CAM5 | `todo` | CAM4, DB2 | Snap submission — insert `snaps` row (verified=true for trust-based), update `habit_instances.status` to `verified`, increment `circle_members.current_streak` and `best_streak` |
| CAM6 | `todo` | CAM2 | Window enforcement — if `now() > window_closes_at`, block capture with "Window closed" message |

---

## 6. Group prove

| ID | Status | Depends on | Done when |
|---|---|---|---|
| GRP1 | `todo` | INF7, DB2 | Friend selection bottom sheet — search users, select friends, avatar stack preview ("You + 2 friends") |
| GRP2 | `todo` | CAM1, GRP1, INF3 | Group camera screen (`app/group-prove/[habitId].tsx`) — Group badge, avatar stack, group-tailored prompt from static bank, ready-status panel, camera controls |
| GRP3 | `todo` | GRP2, DB4, DB2 | Group submit — upload photo → insert `snaps` row with `is_group_post=true` → insert `snap_participants` rows → increment all participants' `current_streak` and `best_streak` |

---

## 7. Circles

| ID | Status | Depends on | Done when |
|---|---|---|---|
| CIR1 | `todo` | INF7, DB2 | Circles list screen (`app/(tabs)/circles.tsx`) — fetches user's circles, renders list |
| CIR2 | `todo` | INF2 | Circle card component — icon, name, member count, user's streak, thumbnail row of recent photos |
| CIR3 | `todo` | INF7, DB2 | Create circle form (`app/circles/new.tsx`) — name, description → generates unique `invite_code`, inserts `circles` + `circle_members` row |
| CIR4 | `todo` | CIR3 | Join circle page (`app/circles/join.tsx`) — invite link landing → look up circle by code → insert `circle_members` row |
| CIR5 | `todo` | CIR1 | Circle detail screen shell (`app/circles/[circleId].tsx`) — three-tab layout (Feed / Leaderboard / About) |
| CIR6 | `todo` | CIR5, DB2 | Circle feed tab — chronological solo + group posts from circle members |
| CIR7 | `todo` | CIR5, DB2 | Circle leaderboard tab — members ranked by streak, All Time / Monthly sub-filter toggle |
| CIR8 | `todo` | CIR5, DB2 | Circle about tab — description, member list with avatars and streaks |

### Parallel: CIR2 is a pure component. CIR3 and CIR4 are independent of the list screen. CIR6, CIR7, CIR8 are independent tabs.

---

## 8. Home feed

| ID | Status | Depends on | Done when |
|---|---|---|---|
| FEED1 | `todo` | INF7 | Home feed screen shell (`app/(tabs)/index.tsx`) — Friends / Circles segmented control at top |
| FEED2 | `todo` | INF2 | Solo post card component — avatar, name, habit name, time ago, streak badge, proof photo, prompt text, like button |
| FEED3 | `todo` | INF2 | Group post card component — stacked avatar row, Group badge, participant names, participant count overlay on photo, individual streak chips, like button |
| FEED4 | `todo` | FEED1, FEED2, DB2 | Friends tab — query snaps from followed users (via `follows` table), reverse-chronological |
| FEED5 | `todo` | FEED1, CIR2, DB2 | Circles tab — latest posts grouped by circle, shown as circle cards with thumbnail rows |
| FEED6 | `todo` | INF2 | Milestone celebration card component — name, avatar, habit, streak count, "Celebrate" action; thresholds: 7, 14, 30, 50, 100 |

### Parallel: FEED2, FEED3, FEED6 are pure components — build anytime. FEED4 and FEED5 are independent tabs.

---

## 9. Profile

| ID | Status | Depends on | Done when |
|---|---|---|---|
| PROF1 | `todo` | INF7, DB2 | Profile screen (`app/(tabs)/profile.tsx`) — avatar, display name, handle, join date, settings icon |
| PROF2 | `todo` | PROF1 | Stats bar — total habits, best streak, friends count, circles count |
| PROF3 | `todo` | PROF1, DB2 | Posts grid — 3-column grid of user's proof photos, habit name overlay, tap to expand |

---

## 10. Local notifications

| ID | Status | Depends on | Done when |
|---|---|---|---|
| NOT1 | `todo` | HAB4 | Permission request when user creates first habit |
| NOT2 | `todo` | NOT1 | Schedule local notifications for next 7 days of habit instances (±15 min jitter baked into `scheduled_for`) |
| NOT3 | `todo` | NOT2 | Notification tap listener routes to `app/capture/[habitId].tsx` |
| NOT4 | `todo` | NOT2 | Cancel and reschedule notifications when habit is edited or deleted |

---

## 11. Realtime & live updates

| ID | Status | Depends on | Done when |
|---|---|---|---|
| RT1 | `todo` | DB5, CIR6 | Circle feed updates live — subscribe to `snaps` INSERT filtered by `circle_id`, new posts appear without refresh |
| RT2 | `todo` | DB5, DB6 | Streak reset broadcast — when pg_cron marks instance missed, circle members see "X missed their habit" in feed |

---

## 12. Social features

| ID | Status | Depends on | Done when |
|---|---|---|---|
| SOC1 | `todo` | DB2 | Follow / unfollow users — toggle follow row in `follows` table (needed for Friends feed) |
| SOC2 | `todo` | FEED2, DB2 | Like on snaps — toggle `likes` row, show like count on post cards |

---

## 13. Demo polish

| ID | Status | Depends on | Done when |
|---|---|---|---|
| DEM1 | `todo` | CAM5, CIR6 | Seed data or manual setup flow — at least 2 users, 1 circle, sample habits + snaps with photos |
| DEM2 | `todo` | all screens | Empty / loading / error states don't stall the demo |
| DEM3 | `todo` | all screens | Smoke-test checklist run on physical iPhone in Expo Go |
| DEM4 | `todo` | DEM1 | Full demo loop verified: open habit → camera → capture → verified → feed updates → streak changes |

---

## 14. Stretch (not on critical path)

| ID | Status | Depends on | Done when |
|---|---|---|---|
| X1 | `todo` | DEM4 | Friends feed exists alongside Circle feed (requires follow graph) |
| X2 | `todo` | DEM4 | Milestone celebration cards appear for streak thresholds |
| X3 | `todo` | DEM4 | Settings page (edit profile, manage habits, sign out) |

---

## Parallel work map

Once **DB1** is done and **INF4–INF7** are wired up, these lanes are fully independent:

```
Lane A (camera):    CAM1 → CAM2 → CAM3 → CAM4 → CAM5
Lane B (habits):    HAB1 + HAB2 + HAB3 → HAB4 → HAB5
Lane C (circles):   CIR1 + CIR2 → CIR3 → CIR4 | CIR5 → CIR6 + CIR7 + CIR8
Lane D (feed):      FEED1 + FEED2 + FEED3 → FEED4 + FEED5
Lane E (profile):   PROF1 → PROF2 + PROF3
Lane F (auth):      AUTH1 → AUTH2 → AUTH3
Lane G (notifs):    NOT1 → NOT2 → NOT3 + NOT4
```

**Zero-dependency tasks** (start right now):
- INF1 (TypeScript types)
- INF2 (design constants)
- INF3 (static prompt bank)
- HAB2, HAB3 (habit UI components)
- CIR2 (circle card component)
- FEED2, FEED3, FEED6 (post card components)

## Non-negotiable MVP sequence

1. Database live (DB1–DB7)
2. Frontend infra wired (INF4–INF7)
3. Auth working (AUTH1–AUTH3)
4. Solo camera submit path (CAM1–CAM5)
5. Habits page with Prove button (HAB1–HAB5)
6. Circle feed shows snaps (CIR1, CIR5, CIR6)
7. Rehearse full demo loop (DEM4)
