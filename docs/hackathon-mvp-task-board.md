# Hackathon MVP Task Board

Use this board to keep the team on the shortest path to a working demo.

## Status legend

- `todo` — not started
- `doing` — actively in progress
- `blocked` — waiting on another task
- `done` — complete and verified

## 1. Foundation and setup

| ID | Status | Owner | Depends on | Done when |
|---|---|---|---|---|
| F1 | `done` | shared | none | Frontend deps installed, backend manifest exists, `.env.example` exists, and setup docs point to the right commands |
| F2 | `todo` | backend | none | Supabase project exists with schema, storage bucket, Realtime, and `pg_cron` configured |
| F3 | `todo` | backend | F2 | Canonical schema drift between docs is resolved and the chosen schema is written down in one place |
| F4 | `todo` | shared | F1 | Everyone knows the MVP path and is pulling work from this board instead of ad hoc docs |

## 2. Backend core loop

| ID | Status | Owner | Depends on | Done when |
|---|---|---|---|---|
| B1 | `todo` | backend | F2, F3 | `profiles`, `circles`, `circle_members`, `habits`, `habit_instances`, `snaps`, and `snap_participants` are finalized in Supabase |
| B2 | `todo` | backend | B1 | There is a clear way to create and fetch the current `habit_instance` with `scheduled_for`, `window_closes_at`, and prompt snapshot fields |
| B3 | `todo` | backend | B2 | Verified snaps can atomically mark the instance verified and update `circle_members.current_streak` and `best_streak` |
| B4 | `todo` | backend | B2 | Missed windows are marked server-side and streak resets happen through one trusted path |
| B5 | `todo` | backend | F1 | `backend/yolo_server.py` exists with `/health`, `/detect`, and `/generate-prompt` matching the docs |
| B6 | `todo` | backend | B5 | Prompt generation has a working provider path and a documented fallback strategy |

## 3. Frontend core loop

| ID | Status | Owner | Depends on | Done when |
|---|---|---|---|---|
| FE1 | `todo` | frontend | F2 | Supabase client and auth bootstrap exist in the Expo app |
| FE2 | `todo` | frontend | B2, FE1 | Habits page can fetch active habits and current instances |
| FE3 | `todo` | frontend | FE2 | Solo camera screen opens from a habit and blocks capture once the window closes |
| FE4 | `todo` | frontend | B5, FE3 | Trust-mode and verifiable submission both work end-to-end from capture to stored snap |
| FE5 | `todo` | frontend | FE2 | Local notification scheduling works for the next seven days of habit instances |

## 4. Social and demo surface

| ID | Status | Owner | Depends on | Done when |
|---|---|---|---|---|
| S1 | `todo` | backend | B1 | Circles can be created and joined by invite code |
| S2 | `todo` | frontend | S1, FE4 | Circle feed shows new snaps and missed updates through Realtime |
| S3 | `todo` | frontend | B3, S1 | Circle leaderboard shows current streak rankings |
| S4 | `todo` | shared | FE4, S2 | The demo loop works: open habit -> capture -> verify -> feed update -> streak change |

## 5. Demo polish

| ID | Status | Owner | Depends on | Done when |
|---|---|---|---|---|
| P1 | `todo` | shared | S4 | There is seed data or a manual setup flow for at least two users and one circle |
| P2 | `todo` | frontend | S4 | Empty/loading/error states are good enough that the demo does not stall |
| P3 | `todo` | shared | S4 | A smoke-test checklist exists and someone has run it on physical devices |

## 6. Stretch only

These are deliberately not on the critical path.

| ID | Status | Owner | Depends on | Done when |
|---|---|---|---|---|
| X1 | `todo` | shared | S4 | Group Prove works with `snap_participants` and shared verification |
| X2 | `todo` | frontend | S4 | Friends feed exists alongside the Circle feed |
| X3 | `todo` | frontend | S2 | Likes can be added to snaps |
| X4 | `todo` | frontend | B3 | Milestone celebration cards appear for streak thresholds |

## Recommended ownership split

- Backend owner: Supabase schema, streak state machine, local AI server, prompt/verification contracts
- Frontend owner: Expo screens, camera flow, local notifications, feed and leaderboard UI
- Shared owner: setup docs, seed data, smoke testing, demo rehearsal

## Non-negotiable MVP sequence

1. Finish foundation setup
2. Finish backend state model and streak ownership
3. Finish solo camera submit path
4. Finish circle feed update path
5. Rehearse the full demo loop
