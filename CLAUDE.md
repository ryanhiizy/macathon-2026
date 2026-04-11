# CLAUDE.md

## Product Context

Habit-tracking iOS app for a hackathon MVP. Users create habits, get a local notification at a randomized time in their window, open the in-app camera, and get handed a **randomly generated funny prompt** (e.g. *"Take a selfie holding a banana like it's a phone"*). A **YOLO object-detection model** running on the demo laptop verifies the required objects are present. Verified snaps land in a shared "circle" feed with friends who see each other's streaks in real time. Miss the window and your circle gets notified — the social consequence is the product.

## Engineering Philosophy

We follow the [harness engineering](https://openai.com/index/harness-engineering/) approach: humans steer, agents execute. Key principles for this hackathon:

- **This file is a map, not a manual.** Keep `CLAUDE.md` / `AGENTS.md` as a concise index (~100 lines) pointing to deeper docs. Do not bloat it with inline instructions.
- **Repository knowledge is the system of record.** Context agents need must live in versioned, in-repo artifacts (code, markdown, plans) — not in chat threads or people's heads.
- **Scope ruthlessly.** This is a hackathon MVP. Every feature must be demoable. If something can be faked convincingly for the demo, fake it.
- **No premature abstraction, no speculative features.** Three similar lines is better than a wrong abstraction. Build the feature that's on the PRD, nothing else.
- **Plans are first-class artifacts.** Non-trivial features get a plan in `docs/plans/` before implementation.

## Repository Layout

- `app/` — Expo Router screens (file-based routing)
- `assets/` — images, fonts
- `docs/` — product and architecture documentation
- `app-example/` — original starter code (reference only, do not edit)

## Documentation Map

This file is an index, not an encyclopedia. Drill into the linked docs for detail.

- [`docs/project_overview.md`](docs/project_overview.md) — product requirements, user flows, feature specs, prompt mechanics
- [`docs/Architecture.md`](docs/Architecture.md) — tech stack, runtime decisions (Expo Go + tunnel), YOLO setup, data flow, MVP scope
- [`docs/principles.md`](docs/principles.md) — engineering principles and golden rules
- [`docs/architecture/`](docs/architecture/) — deeper architecture docs ([`frontend.md`](docs/architecture/frontend.md), [`backend.md`](docs/architecture/backend.md), [`data-model.md`](docs/architecture/data-model.md))
- [`docs/features/`](docs/features/) — per-feature docs (habits, camera-capture, prompts, verification, circles, streaks, notifications)
- [`docs/infrastructure/`](docs/infrastructure/) — Supabase schema + RLS + cron ([`supabase.md`](docs/infrastructure/supabase.md)), YOLO server setup ([`yolo-server.md`](docs/infrastructure/yolo-server.md))
- [`docs/designs/`](docs/designs/) — [`frontend-rules.md`](docs/designs/frontend-rules.md) and [`design-system.md`](docs/designs/design-system.md)
- [`docs/plans/`](docs/plans/) — execution plans ([`in-progress/`](docs/plans/in-progress/) and [`completed/`](docs/plans/completed/))

## Environment

- Team is on **Windows** — no Xcode, no native iOS builds, no EAS.
- **Expo Go** on a physical iPhone is the only runtime for preview.
- `expo start --tunnel` is the dev mode (phone may not share a LAN with the laptop).
- Python 3.10+ required on the demo laptop for the YOLO server.
- Node.js + npm for the Expo app.

## Running Locally

```bash
# Install app dependencies
npm install

# Start Expo in tunnel mode — scan the QR with Expo Go on iPhone
npx expo start --tunnel

# YOLO inference server (separate terminal, Python venv)
pip install ultralytics fastapi "uvicorn[standard]" python-multipart
uvicorn yolo_server:app --host 0.0.0.0 --port 8000

# Expose the YOLO server to the phone (separate terminal)
cloudflared tunnel --url http://localhost:8000
# → copy the generated HTTPS URL into the YOLO_API_URL constant in the app
```

See [`docs/Architecture.md`](docs/Architecture.md) for tunnel alternatives (ngrok, localtunnel, LAN mode).

## Git Workflow

- `main` — only branch that matters for the hackathon. Commit small and often.
- For non-trivial features, branch as `feature/<slug>` and merge when green.
- Never commit secrets (`.env`, API keys, Supabase service role keys).

## Verification

```bash
# Type-check + lint
npx expo lint
npx tsc --noEmit
```

**Before declaring a feature done:**
1. `npx tsc --noEmit` must pass (TypeScript strict is on — see `tsconfig.json`).
2. `npx expo lint` must pass.
3. **Run the feature end-to-end on the physical iPhone via Expo Go.** Type-checking is not testing. If you can't test the UI because you don't have a phone handy, say so explicitly — do not claim success.

## Architectural Boundaries

- **All data access goes through the Supabase JS client.** No raw SQL, no custom REST layer. RLS policies enforce workspace scope.
- **YOLO verification goes through the tunneled local Python server.** No direct Vision API calls, no on-device inference, no Supabase Edge Function proxy in V1.
- **Notifications are local scheduled only** (`expo-notifications` via `scheduleNotificationAsync`). Remote push is unreliable in Expo Go and explicitly out of scope.
- **Streak reset runs server-side** (Supabase pg_cron or Edge Function on a cron). Client timers are not trusted for streak integrity.
- **Camera capture is live-only.** Mount `<CameraView>` from `expo-camera` directly — never use `expo-image-picker`. Camera-roll access must be structurally impossible.
- **Prompt bank is a static JSON file in the repo** for V1. No LLM calls for prompt generation.
- See [`docs/Architecture.md`](docs/Architecture.md) for full constraints and reasoning.

## Plans Workflow

Plans are first-class, versioned artifacts. All planning goes through `docs/plans/`.

- **When to plan**: Any task spanning multiple files, a new feature, or a change to architecture needs a plan first. One-line bug fixes and tiny edits do not.
- **New plans** go in `docs/plans/in-progress/`. Name format: `YYYY-MM-DD-<slug>.md`.
- **Completed plans** move to `docs/plans/completed/` when the implementation is merged.
- **After completing a plan**, update the relevant doc in `docs/` to reflect what was built. The plan records what was decided; the docs record current state.

## Keeping Docs In Sync

- **`CLAUDE.md` and `AGENTS.md` mirror each other.** Any change to one must be applied to the other. They are the same file for different agent runtimes.
- **Update docs when changing features.** Code and documentation move together.
  - Changed a feature or flow? → Update [`docs/project_overview.md`](docs/project_overview.md).
  - Changed stack, runtime, tunnel strategy, or YOLO setup? → Update [`docs/Architecture.md`](docs/Architecture.md).
  - Changed the MVP scope checklist? → Update [`docs/Architecture.md`](docs/Architecture.md).

## Common Pitfalls

- **Do not add packages without `npx expo install`.** It pins to SDK-54-compatible versions. `npm install <pkg>` will grab the latest and break Expo Go.
- **Do not add custom native modules.** They will not run in Expo Go. If a library says "requires a dev build" in its README, do not use it.
- **Do not use `expo-image-picker`.** Camera-roll access is explicitly forbidden — it breaks the proof mechanic.
- **Do not rely on remote push notifications.** Expo Go doesn't support them reliably. Use local scheduled notifications instead.
- **Do not hardcode the YOLO tunnel URL in committed code.** Keep it in a single constant (e.g. `src/config/yolo.ts`) and update it per session.
- **Do not commit `.env`, API keys, Supabase service role keys, or `cloudflared` tokens.**
- **Do not edit `app-example/`.** It's the original starter code kept for reference.
- **Do not add features, abstractions, or refactors beyond what was requested.**
