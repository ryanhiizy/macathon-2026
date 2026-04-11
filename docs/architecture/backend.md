# Backend Architecture

See [`../Architecture.md`](../Architecture.md) for the high-level stack. This doc covers backend specifics.

The backend is two pieces:

1. **Supabase** — managed BaaS (auth, Postgres, Storage, Realtime, pg_cron)
2. **Local YOLO server** — Python FastAPI process running on the demo laptop

## Supabase

One Supabase project, free tier. All traffic from the app goes through `@supabase/supabase-js`.

### Services used

| Service | Purpose |
|---|---|
| Auth | Magic link / OTP sign-in |
| Postgres | Users, habits, circles, snaps, streaks |
| Storage | Habit snap photos (private bucket) |
| Realtime | Live circle feed updates, streak break notifications |
| pg_cron | Scheduled job that expires habit windows and resets streaks |
| Edge Functions | Not used in V1 (YOLO is called directly from the client) |

See [`../infrastructure/`](../infrastructure/) for schemas, RLS policies, storage bucket setup, and the pg_cron job definition.

## YOLO Server

A standalone Python process running on the demo laptop. See [`../devops/yolo-server.md`](../devops/yolo-server.md) for setup and [`../features/verification/`](../features/verification/) for the contract.

### Responsibilities

- Accept an image upload
- Run YOLOv8n inference
- Return detected classes with confidences
- That's it — no business logic, no database access, no auth

### What it intentionally does NOT do

- Does not write to Supabase (the client does that after getting the response)
- Does not know about habits, prompts, or users
- Does not do prompt-to-class matching (that's client-side logic)

This separation keeps the Python server dumb and replaceable.

## Tunneling

The YOLO server binds to `localhost:8000` on the laptop. The phone reaches it through a tunnel:

- **Cloudflare Tunnel** (preferred) — `cloudflared tunnel --url http://localhost:8000`
- **ngrok** — fallback
- **localtunnel** — quick and dirty
- **LAN mode** — if the hackathon Wi-Fi allows peer connections

The resulting HTTPS URL is pasted into a constant in the app (e.g. `src/config/yolo.ts`) for the session.

## Why No Edge Function Proxy

The original plan had a Supabase Edge Function proxying client → YOLO. We dropped it because:

1. The YOLO endpoint is local and temporary — nothing worth hiding
2. Adds a hop and a Deno runtime to debug
3. Hackathon demo, not a production deploy

If we ever productionize, the Edge Function proxy goes back in.
