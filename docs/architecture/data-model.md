# Data Model

High-level entity relationships. For the canonical schema (DDL, constraints, indexes, RLS), see [`../infrastructure/supabase.md`](../infrastructure/supabase.md).

## Entities

```
┌──────────┐   follows   ┌──────────┐
│ profiles │────────────▶│ profiles │
└──────────┘             └──────────┘
     │
     │        ┌──────────────┐        ┌──────────┐
     └────────│ circle_members│◀───────│ circles  │
              └──────────────┘        └──────────┘
     │                                     │
     ▼                                     │
┌──────────┐                               ▼
│  habits  │──────────────────────▶┌──────────────────┐
└──────────┘                       │  habit_instances  │
                                   └──────────────────┘
                                           │
                                           ▼
                                       ┌───────┐
                                       │ snaps │
                                       └───────┘
                                           │
                               ┌───────────┴───────────┐
                               ▼                       ▼
                         ┌──────────┐          ┌────────────────┐
                         │   likes  │          │ snap_participants│
                         └──────────┘          └────────────────┘
```

## Tables

### `profiles`
Extends Supabase Auth's `auth.users`. One row per user.

- `id` (uuid, PK, matches `auth.users.id`)
- `display_name` (text)
- `handle` (text, unique) — e.g. `@jacknguyen`
- `avatar_url` (text, nullable) — Supabase Storage path
- `bio` (text, nullable)
- `created_at` (timestamptz)

### `follows`
Who follows whom. Powers the Friends feed tab.

- `follower_id` (uuid, FK → profiles.id)
- `following_id` (uuid, FK → profiles.id)
- `created_at` (timestamptz)
- PK: (`follower_id`, `following_id`)

### `circles`
A shared accountability group built around one habit.

- `id` (uuid, PK)
- `name` (text)
- `description` (text, nullable) — shown in the About tab
- `created_by` (uuid, FK → profiles.id)
- `invite_code` (text, unique) — short slug for invite links
- `is_private` (bool, default true)
- `created_at` (timestamptz)

### `circle_members`
Join table. A user can be in many circles.

- `circle_id` (uuid, FK)
- `user_id` (uuid, FK)
- `joined_at` (timestamptz)
- `current_streak` (int, default 0)
- `best_streak` (int, default 0)
- PK: (`circle_id`, `user_id`)

### `habits`
A user's personal habit. Each habit belongs to one Circle.

- `id` (uuid, PK)
- `user_id` (uuid, FK → profiles.id)
- `circle_id` (uuid, FK → circles.id)
- `name` (text)
- `category` (enum: `gym`, `running`, `cooking`, `meal_prep`, `reading`, `meditation`, `water`, ...)
- `verification_mode` (enum: `verifiable`, `trust`)
- `target_time` (time) — local time of day
- `frequency` (text) — `daily`, `weekdays`, or custom JSON
- `created_at` (timestamptz)

### `habit_instances`
One row per scheduled habit occurrence.

- `id` (uuid, PK)
- `habit_id` (uuid, FK → habits.id)
- `scheduled_for` (timestamptz) — randomized fire time within ±15 min of target
- `window_closes_at` (timestamptz) — `scheduled_for + 30 min`
- `prompt_id` (text) — references the static prompt bank / AI-generated prompt text
- `prompt_text` (text) — the actual prompt text shown to the user
- `status` (enum: `pending`, `verified`, `missed`)
- `verified_at` (timestamptz, nullable)

### `snaps`
A submitted proof photo. Can be solo or group.

- `id` (uuid, PK)
- `habit_instance_id` (uuid, FK → habit_instances.id)
- `user_id` (uuid, FK → profiles.id) — the submitter / host
- `circle_id` (uuid, FK → circles.id) — denormalized for feed queries
- `storage_path` (text) — Supabase Storage object key
- `detected_classes` (jsonb) — YOLO output: `[{class, confidence}]`
- `verified` (bool)
- `is_group_post` (bool, default false)
- `caption` (text, nullable)
- `created_at` (timestamptz)

### `snap_participants`
For group posts — links additional participants to a snap.

- `snap_id` (uuid, FK → snaps.id)
- `user_id` (uuid, FK → profiles.id)
- `streak_at_time` (int) — participant's streak count at the time of the snap
- PK: (`snap_id`, `user_id`)

### `likes`
Likes on snaps.

- `snap_id` (uuid, FK → snaps.id)
- `user_id` (uuid, FK → profiles.id)
- `created_at` (timestamptz)
- PK: (`snap_id`, `user_id`)

## Relationships

- A **profile** has many **habits**, each bound to exactly one **circle**
- A **profile** follows many other **profiles** (powers Friends feed)
- A **circle** has many **members** and many **habits** (one per member)
- A **habit** has many **habit_instances** (one per scheduled day)
- A **habit_instance** has zero or one **snap**
- A **snap** has one host (`user_id`) and optionally many **snap_participants** (group posts)
- A **snap** has many **likes**

## What Lives Where

- **Static / in-repo**: the prompt bank fallback JSON (`app/constants/prompts.json`)
- **Runtime**: AI-generated prompts served by the FastAPI server (`/generate-prompt`)
- **Server-side DB**: everything above
- **Client-side only**: UI state, draft habit form, camera preview, invite selection state
