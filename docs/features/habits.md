# Feature: Habits

User-facing habit creation, management, and the daily prove flow (solo and group).

## Habits Page

The user's personal dashboard. Top-right: create new habit button.

### Daily Progress Summary

Circular progress ring at the top — habits completed / total. Text label e.g. *"3 habits left · Keep going!"*

### Habit Cards

Each habit displayed as a card:
- Icon, name, current streak, scheduled time
- **Completed:** check mark, card visually muted
- **Incomplete:** two action buttons:
  - 👥 **Invite** — opens Group Prove flow
  - **Prove** — opens solo camera

## Habit Creation

User specifies:
- **Name** (e.g. "Morning gym")
- **Category** — determines verification mode
- **Target time** — local time of day
- **Frequency** — daily, weekdays, or custom day-of-week picker
- **Circle** — join existing via invite or create a new one

### Categories and Verification Mode

| Category | Mode | Notes |
|---|---|---|
| `gym` | verifiable | YOLO checks for `person` + dumbbell/barbell |
| `running` | verifiable | `person` + shoe-ish classes |
| `cooking` | verifiable | `bowl` / `plate` / `fork` |
| `meal_prep` | verifiable | `bowl` / `person` |
| `reading` | trust | No YOLO |
| `meditation` | trust | No YOLO |
| `water` | trust | No YOLO |

Trust-based habits show at creation: *"We trust you on this one — your photo is just a ritual check-in."*

## Solo Prove Flow

1. User taps **Prove** on an incomplete habit
2. Solo camera opens (`capture/[habitId].tsx`)
3. AI-generated solo prompt displayed above the viewfinder
4. User takes photo (deadline shown)
5. Confirm modal: Submit or Retake
6. On submit: upload to Supabase Storage → YOLO check (if verifiable) → write `snap` row → streak +1 → post appears on feed

## Group Prove Flow

1. User taps 👥 **Invite** on an incomplete habit
2. Bottom sheet slides up: habit name, friend search bar, scrollable friend list with checkboxes
3. As friends selected: avatar stack preview (e.g. "You + 2 friends")
4. Tap **"Start Group Prove · N people"** → Group Camera View (`group-prove/[habitId].tsx`)
5. Group camera: "Group" badge in header, avatar stack + participant names, group-tailored AI prompt (different from solo prompt), ready-status panel (host auto-marked ready)
6. All participants take the photo together
7. Optional caption → submit
8. Group post appears on feed with stacked avatars, all participant names, individual streak chips
9. Streaks increment for each participant

## Screens

- `app/(tabs)/habits.tsx` — habits page with daily progress + habit cards
- `app/habits/new.tsx` — habit creation form
- `app/capture/[habitId].tsx` — solo camera + prompt + submit
- `app/group-prove/[habitId].tsx` — group camera + participant panel + submit

## Data

Writes to `habits`, `habit_instances`, `snaps`, `snap_participants` tables. See [`../architecture/data-model.md`](../architecture/data-model.md).
