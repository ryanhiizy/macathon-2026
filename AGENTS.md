# AGENTS.md

## Product Context

**presence** — a social habit-tracking iOS app (Habit Tracker × BeReal × Strava) built for a hackathon MVP.

Users create daily habits, get a local notification within ±15 min of their target time, open the in-app camera, and receive an **AI-generated prompt**. They take a live photo following the prompt, which is verified by a YOLO model on the demo laptop. Verified snaps post to a social feed in **Circles**. Miss the window and your streak resets and your Circle gets notified.

See [`docs/project_overview.md`](docs/project_overview.md) for the PRD.

## Hackathon Mindset

**This is a hackathon, not a production app.** Optimise for demoability, not completeness.

- If something can be faked convincingly for the demo, fake it.
- Hardcode things that would be configurable in production. Clean it up later.
- Don't add heavy error handling, retries, or validation beyond what the demo needs.
- Don't over-abstract. Build the feature, ship it, move on.
- Three similar lines of code is better than a premature abstraction.
- Every decision should be evaluated by: *"does this help us demo in time?"*

## Engineering Philosophy

- **This file is a map, not a manual.** Keep it short and point to repo docs for detail.
- **Repository knowledge is the system of record.** Important guidance belongs in versioned files.
- **Plans are first-class artifacts.** Non-trivial features get a plan in `docs/plans/` before implementation.
- **No speculative features.** Build what's on the PRD, nothing else.
- **Use minimal TDD only when risk justifies it.** For the hackathon, write small smoke tests or contract tests only for critical paths, risky integrations, or behavior that is easy to break. Do not default to broad test coverage.

## Repository Layout

- `frontend/` — Expo app
- `backend/` — local FastAPI + YOLO server work
- `docs/` — product and architecture documentation

## Documentation Map

- [`docs/project_overview.md`](docs/project_overview.md)
- [`docs/Architecture.md`](docs/Architecture.md)
- [`docs/principles.md`](docs/principles.md)
- [`docs/setup-checklist.md`](docs/setup-checklist.md)
- [`docs/architecture/`](docs/architecture/)
- [`docs/features/`](docs/features/)
- [`docs/infrastructure/`](docs/infrastructure/)
- [`docs/plans/`](docs/plans/)

## Environment

- **Expo Go** on a physical iPhone is the primary runtime. No EAS, no custom dev build.
- **Demo day:** phone and laptop on the same Wi-Fi → use LAN mode.
- **Remote dev:** use `expo start --tunnel` for Expo + a tunnel for the AI server.
- Python 3.10+ on the demo laptop for the YOLO + AI prompt server.
- Node.js + npm for the Expo app.

## Running Locally

```bash
cd frontend && npm install
npx expo start --lan

source yolo-env/bin/activate
uvicorn backend.yolo_server:app --host 0.0.0.0 --port 8000
```

See [`docs/setup-checklist.md`](docs/setup-checklist.md) for the full setup flow.

## Verification

```bash
cd frontend && npx tsc --noEmit
cd frontend && npx expo lint
```

Before declaring a feature done:
- TypeScript and lint should pass when relevant
- the feature should work end-to-end in Expo Go or the local backend
- if you couldn't run the relevant live path, say so explicitly

## Architectural Boundaries

- All persistent app data goes through Supabase.
- YOLO + AI prompt generation go through the local FastAPI server (`/detect` and `/generate-prompt`).
- Notifications are local scheduled only.
- Streak reset runs server-side.
- Camera capture is live-only through `expo-camera`.

## Keeping Docs In Sync

- **`CLAUDE.md` and `AGENTS.md` are identical.** Any change to one must be applied to the other.
- Changed setup steps? Update [`docs/setup-checklist.md`](docs/setup-checklist.md).
- Changed stack or scope? Update [`docs/Architecture.md`](docs/Architecture.md).
- Changed feature behavior? Update the relevant file in [`docs/features/`](docs/features/).
