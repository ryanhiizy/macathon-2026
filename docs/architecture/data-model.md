# Data Model

High-level entity relationships. For the canonical schema (DDL, constraints, indexes, RLS), see [`../infrastructure/database.md`](../infrastructure/database.md).

## Entities

```
┌──────────┐        ┌──────────────┐        ┌──────────┐
│  users   │───────▶│ circle_members│◀───────│ circles  │
└──────────┘        └──────────────┘        └──────────┘
     │                                            │
     │                                            │
     │                                            ▼
     │                                      ┌──────────┐
     └─────────────────────────────────────▶│  habits  │
                                            └──────────┘
                                                  │
                                                  ▼
                                            ┌──────────┐
                                            │  snaps   │
                                            └──────────┘
```

## Tables

### `users`
Managed by Supabase Auth. We extend with a `profiles` row.

- `id` (uuid, PK, matches `auth.users.id`)
- `display_name` (text)
- `created_at` (timestamptz)

### `circles`
A shared accountability group, one per habit concept.

- `id` (uuid, PK)
- `name` (text)
- `created_by` (uuid, FK → users.id)
- `invite_code` (text, unique) — short slug for invite links
- `is_private` (bool, default true)
- `created_at` (timestamptz)

### `circle_members`
Join table. A user can be in many circles.

- `circle_id` (uuid, FK)
- `user_id` (uuid, FK)
- `joined_at` (timestamptz)
- `current_streak` (int, default 0)
- PK: (`circle_id`, `user_id`)

### `habits`
A user's personal habit within a circle.

- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `circle_id` (uuid, FK)
- `name` (text)
- `category` (enum: `gym`, `running`, `cooking`, `meal_prep`, `reading`, `meditation`, ...)
- `verification_mode` (enum: `verifiable`, `trust`)
- `target_time` (time) — local time of day
- `frequency` (text) — `daily`, `weekdays`, or custom JSON
- `created_at` (timestamptz)

### `habit_instances`
One row per scheduled habit occurrence. Created server-side by pg_cron (or lazily by the client at fire time).

- `id` (uuid, PK)
- `habit_id` (uuid, FK)
- `scheduled_for` (timestamptz) — the randomized fire time within ±15 min
- `window_closes_at` (timestamptz) — `scheduled_for + 30 min`
- `prompt_id` (text) — references the static prompt bank
- `status` (enum: `pending`, `verified`, `missed`)
- `verified_at` (timestamptz, nullable)

### `snaps`
A submitted photo for a habit instance.

- `id` (uuid, PK)
- `habit_instance_id` (uuid, FK)
- `user_id` (uuid, FK)
- `circle_id` (uuid, FK) — denormalized for feed queries
- `storage_path` (text) — Supabase Storage object key
- `detected_classes` (jsonb) — YOLO output: `[{class, confidence}]`
- `verified` (bool)
- `created_at` (timestamptz)

## Relationships

- A **user** has many **habits**, each bound to exactly one **circle**
- A **circle** has many **members** (users) and many **habits** (one per member)
- A **habit** has many **habit_instances** (one per day)
- A **habit_instance** has zero or one **snap**

## What Lives Where

- **Static**: the prompt bank (JSON in `app/constants/prompts.json`) — not a table in V1
- **Server-side**: everything above
- **Client-side only**: UI state, draft habit form state, camera preview state
