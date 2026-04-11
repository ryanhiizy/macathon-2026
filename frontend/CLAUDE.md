# CLAUDE.md

## Product Context

**presence** — a social habit-tracking iOS app (Habit Tracker × BeReal × Strava) built for a hackathon MVP.

Users create daily habits, get a local notification within ±15 min of their target time, open the in-app camera, and receive an **AI-generated prompt** (e.g. *"Throw a peace sign mid-stride on your run!"*). They take a live photo following the prompt, which is verified by a YOLO model on the demo laptop. Verified snaps post to a social feed in **Circles** — habit-specific groups where friends see each other's streaks in real time. **Group Prove** lets friends complete a habit together in a shared camera session with a group-tailored AI prompt. Miss the window and your streak resets and your Circle gets notified — the social consequence is the product.

See [`docs/overview.md`](docs/overview.md) for the full product description and [`docs/project_overview.md`](docs/project_overview.md) for the PRD.

## Hackathon Mindset

**This is a hackathon, not a production app.** Optimise for demoability, not correctness.

- If something can be faked convincingly for the demo, fake it.
- Hardcode things that would be configurable in production. Clean it up later.
- Don't add error handling, retries, or validation beyond what the demo needs.
- Don't add tests. Don't refactor. Don't abstract. Build the feature, ship it, move on.
- Three similar lines of code is better than a premature abstraction.
- Every decision should be evaluated by: *"does this help us demo in time?"*

## Engineering Philosophy

Humans steer, agents execute. Key rules:

- **This file is a map, not a manual.** ~100 lines max. Drill into linked docs for detail.
- **Repository knowledge is the system of record.** Everything an agent needs must live in versioned in-repo artifacts — not in chat threads.
- **Plans are first-class artifacts.** Non-trivial features get a plan in `docs/plans/` before implementation.
- **No speculative features.** Build what's on the PRD, nothing else.

## Repository Layout

- `app/` — Expo Router screens (file-based routing)
- `assets/` — images, fonts
- `docs/` — product and architecture documentation
- `app-example/` — original starter code (reference only, do not edit)

## Documentation Map

- [`docs/overview.md`](docs/overview.md) — full product description (start here)
- [`docs/project_overview.md`](docs/project_overview.md) — PRD: features, flows, verification, streak mechanics
- [`docs/Architecture.md`](docs/Architecture.md) — tech stack, MVP scope checklist
- [`docs/setup-checklist.md`](docs/setup-checklist.md) — what to set up before building (Supabase, AI server, Expo)
- [`docs/architecture/`](docs/architecture/) — [`frontend.md`](docs/architecture/frontend.md), [`backend.md`](docs/architecture/backend.md), [`data-model.md`](docs/architecture/data-model.md)
- [`docs/features/`](docs/features/) — habits, camera-capture, group-prove, prompts, verification, circles, streaks, notifications
- [`docs/infrastructure/`](docs/infrastructure/) — [`supabase.md`](docs/infrastructure/supabase.md), [`yolo-server.md`](docs/infrastructure/yolo-server.md)
- [`docs/designs/`](docs/designs/) — [`frontend-rules.md`](docs/designs/frontend-rules.md), [`design-system.md`](docs/designs/design-system.md)
- [`docs/plans/`](docs/plans/) — [`in-progress/`](docs/plans/in-progress/), [`completed/`](docs/plans/completed/)

## Environment

- **Expo Go** on a physical iPhone is the primary runtime. No EAS, no custom dev build.
- **Demo day:** phone and laptop on the same Wi-Fi → use LAN mode (no tunnel needed).
- **Remote dev:** use `expo start --tunnel` for Expo + `ngrok http 8000` for the AI server.
- Python 3.10+ on the demo laptop for the YOLO + AI prompt server.
- Node.js + npm for the Expo app.
- Some team members on Mac (can use iOS Simulator as a fallback).

## Running Locally

```bash
# Install app dependencies
npm install

# Demo day (same Wi-Fi) — simplest, most reliable
npx expo start --lan
# → scan QR with Expo Go; set YOLO_API_URL to http://<laptop-ip>:8000

# Remote dev (different networks)
npx expo start --tunnel
# + ngrok http 8000  →  copy HTTPS URL into YOLO_API_URL

# AI + YOLO server (separate terminal)
source yolo-env/bin/activate  # or yolo-env\Scripts\activate on Windows
uvicorn yolo_server:app --host 0.0.0.0 --port 8000
```

See [`docs/setup-checklist.md`](docs/setup-checklist.md) for full setup steps.

## Git Workflow

- `main` — only branch that matters for the hackathon. Commit small and often.
- For non-trivial features, branch as `feature/<slug>` and merge when green.
- Never commit secrets (`.env`, API keys, Supabase service role keys).
- **Never add `Co-Authored-By` trailers to commit messages.**

## Verification

```bash
npx tsc --noEmit   # must pass
npx expo lint      # must pass
```

**Before declaring a feature done:** TypeScript + lint must pass AND the feature must work end-to-end in Expo Go. If you can't test on a phone, say so — do not claim success.

## Architectural Boundaries

- **All data access goes through the Supabase JS client.** No raw SQL, no custom REST layer.
- **YOLO + AI prompt generation go through the local FastAPI server** (`/detect` and `/generate-prompt`). No on-device inference, no Edge Function proxy.
- **Prompts are AI-generated** by the FastAPI server calling Claude/OpenAI. Static JSON (`app/constants/prompts.json`) is the fallback if the server is unreachable.
- **Notifications are local scheduled only** (`expo-notifications`). Remote push is out of scope.
- **Streak reset runs server-side** (Supabase pg_cron). Client timers are never trusted.
- **Camera capture is live-only.** Use `<CameraView>` from `expo-camera` directly — never `expo-image-picker`.
- **`YOLO_API_URL` lives in one constant** (`src/config/yolo.ts`). Updated per session. Never hardcoded in feature code.

## Common Pitfalls

- **Use `npx expo install <pkg>`, not `npm install <pkg>`.** Pins to SDK-54-compatible versions.
- **No custom native modules.** They won't run in Expo Go.
- **No `expo-image-picker`.** Camera-roll access breaks the proof mechanic.
- **No remote push notifications.** Expo Go doesn't support them reliably.
- **No `.env`, API keys, or service role keys in commits.**
- **No editing `app-example/`.** Reference only.
- **No features, abstractions, or refactors beyond what was asked.**

## Keeping Docs In Sync

- **`CLAUDE.md` and `AGENTS.md` are identical.** Any change to one must be applied to the other.
- Changed a feature? → Update the relevant file in [`docs/features/`](docs/features/).
- Changed the stack or scope? → Update [`docs/Architecture.md`](docs/Architecture.md).
- Changed setup steps? → Update [`docs/setup-checklist.md`](docs/setup-checklist.md).
