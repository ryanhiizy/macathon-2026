# Backend Architecture

See [`../Architecture.md`](../Architecture.md) for the high-level stack. This doc covers backend specifics.

The backend is two pieces:

1. **Supabase** — managed BaaS (auth, Postgres, Storage, Realtime, pg_cron)
2. **Local AI/YOLO server** — Python FastAPI process running on the demo laptop (handles both YOLO inference and AI prompt generation)

## Supabase

One Supabase project, free tier. All traffic from the app goes through `@supabase/supabase-js`.

### Services Used

| Service | Purpose |
|---|---|
| Auth | Magic link / OTP sign-in |
| Postgres | Profiles, habits, circles, snaps, streaks, likes, follows |
| Storage | Habit snap photos (`snaps` bucket) |
| Realtime | Live circle feed, home feed, streak broadcasts |
| pg_cron | Scheduled job every minute: expires habit windows + resets streaks |
| Edge Functions | Not used in V1 |

See [`../infrastructure/supabase.md`](../infrastructure/supabase.md) for schemas, RLS policies, storage bucket setup, and the pg_cron job.

## FastAPI Server (Demo Laptop)

A single Python FastAPI process on the demo laptop, exposed to the phone via LAN (same Wi-Fi) or a tunnel.

### Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /health` | Health check |
| `POST /detect` | YOLO inference — accepts image, returns detected classes + confidences |
| `POST /generate-prompt` | AI prompt generation — accepts category + mode, returns prompt text |

### `/detect` Contract

```
POST /detect
multipart/form-data: file (JPEG)

→ { "classes": [...], "confidences": [...], "latency_ms": N }
```

### `/generate-prompt` Contract

```
POST /generate-prompt
{ "category": "running", "mode": "solo" | "group", "participant_count": N }

→ { "prompt_text": "...", "required_classes": [...], "id": "..." }
```

### Responsibilities

- YOLO: accept image, run YOLOv8n inference, return classes + confidences
- Prompts: call Claude/OpenAI API, return contextual prompt text for the habit + mode
- No business logic, no database access, no auth

### What It Intentionally Does NOT Do

- Does not write to Supabase (the client handles that)
- Does not know about users or streaks
- Does not do prompt-to-class matching (client-side logic)

This keeps the server dumb and replaceable.

## Networking

**Demo day (preferred):** Phone and laptop on the same Wi-Fi → use LAN mode. No tunnel needed.
- Expo: `npx expo start --lan`
- App uses: `http://<laptop-ip>:8000`

**Remote dev:** Use a tunnel for the FastAPI server.
- ngrok: `ngrok http 8000` → HTTPS URL
- Cloudflare: `cloudflared tunnel --url http://localhost:8000` → HTTPS URL

The URL is pasted into `src/config/yolo.ts` (`YOLO_API_URL`) for the session.

## Why No Edge Function Proxy

The YOLO/AI server is local and temporary — nothing worth hiding behind a proxy. Adding a Deno runtime hop just adds latency and a new failure point for a hackathon demo.
