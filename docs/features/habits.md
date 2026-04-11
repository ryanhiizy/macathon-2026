# Feature: Habits

User-facing habit creation, editing, and listing.

## What it does

A user creates a habit by specifying:
- **Name** (e.g. "Morning gym")
- **Category** — determines verification mode (see below)
- **Target time** — local time of day
- **Frequency** — daily, weekdays, or custom day-of-week picker
- **Circle** — join an existing circle via invite or create a new one

## Categories and verification mode

| Category | Mode | Notes |
|---|---|---|
| `gym` | verifiable | YOLO checks for `person` + dumbbell/barbell classes |
| `running` | verifiable | `person` + shoe-ish classes |
| `cooking` | verifiable | `bowl` / `plate` / `fork` |
| `meal_prep` | verifiable | `bowl` / `person` |
| `reading` | trust | Bypasses YOLO |
| `meditation` | trust | Bypasses YOLO |
| `water` | trust | Bypasses YOLO |

Trust-based habits show an upfront message at creation: *"We trust you on this one — your photo is just a ritual check-in."*

## Screens

- `app/(tabs)/habits.tsx` — list of user's habits with create button
- `app/habits/new.tsx` — habit creation form

## Data

Writes to the `habits` table. See [`../architecture/data-model.md`](../architecture/data-model.md).
