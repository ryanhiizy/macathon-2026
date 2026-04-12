# Circle Variation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make circles feel distinct by enriching circle list analytics, detail metadata, member presentation, and fallback posts with deterministic seeded mock variation.

**Architecture:** Keep Supabase as the source of truth for circle identity and real snaps, then layer a deterministic frontend enrichment step on top of the fetched data. Use `circle_id`-seeded helpers so each circle gets stable but visibly different analytics, copy, member spread, and mock fallback content.

**Tech Stack:** Expo Router, React Native, TypeScript, Supabase, Node native test runner

---

### Task 1: Add failing tests for seeded circle variation

**Files:**
- Create: `frontend/lib/circle-variation.test.mts`
- Create: `frontend/lib/circle-variation.ts`

**Step 1: Write the failing test**

- Add one test proving two different circle IDs produce different analytics snapshots.
- Add one test proving the same circle ID produces stable repeated output.
- Add one test proving fallback posts differ by circle habit and copy tone.

**Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test frontend/lib/circle-variation.test.mts`

Expected: fail because the variation helper does not exist yet.

### Task 2: Implement the seeded variation helper

**Files:**
- Create: `frontend/lib/circle-variation.ts`

**Step 1: Write minimal implementation**

- Export a seeded number helper derived from `circle_id`.
- Export helpers for:
  - analytics enrichment
  - description / about copy
  - fallback member flavor
  - fallback circle feed posts
- Keep outputs deterministic and ASCII-only.

**Step 2: Run test to verify it passes**

Run: `node --experimental-strip-types --test frontend/lib/circle-variation.test.mts`

Expected: pass.

### Task 3: Enrich the circles list cards

**Files:**
- Modify: `frontend/lib/circles.ts`

**Step 1: Route list analytics through the variation helper**

- Replace the current low-variance `mockAnalytics()` usage with a stronger seeded enrichment layer.
- Make member count, today rate, best streak, and trend lines feel more distinct across circles while preserving real counts when present.

**Step 2: Keep real identity intact**

- Preserve real circle name, habit, icon, and accent.
- Do not change navigation or query structure.

### Task 4: Enrich circle detail data

**Files:**
- Modify: `frontend/lib/circles.ts`
- Modify: `frontend/app/circle/[id].tsx`

**Step 1: Add richer description / about copy**

- Provide seeded fallback `description` text for circles with thin or generic DB descriptions.

**Step 2: Add fallback posts**

- Merge seeded fallback posts with real snaps so low-activity circles still look alive.
- Keep real snaps first when they exist, then append or interleave mock seeded posts as needed.

**Step 3: Add member flavor when needed**

- Preserve real member rows, but if the circle feels too flat, enrich display details such as handles / streak spread / rank tone in a deterministic way.

### Task 5: Verify UI integration

**Files:**
- Verify: `frontend/app/(tabs)/circles.tsx`
- Verify: `frontend/app/circle/[id].tsx`
- Verify: `frontend/lib/circles.ts`
- Verify: `frontend/lib/circle-variation.ts`
- Verify: `frontend/lib/circle-variation.test.mts`

**Step 1: Run targeted variation test**

Run: `node --experimental-strip-types --test frontend/lib/circle-variation.test.mts`

Expected: pass.

**Step 2: Run existing feed/circle regressions**

Run: `node --experimental-strip-types --test frontend/lib/home-feed-tabs.test.mts`

Expected: pass.

Run: `node --experimental-strip-types --test frontend/lib/real-feed.test.mts`

Expected: pass.

**Step 3: Run TypeScript**

Run: `cd frontend && npx tsc --noEmit`

Expected: exit 0.

**Step 4: Run lint**

Run: `cd frontend && npx expo lint`

Expected: exit 0.

**Step 5: Commit**

```bash
git add docs/plans/2026-04-12-circle-variation-design.md docs/plans/2026-04-12-circle-variation.md frontend/lib/circle-variation.ts frontend/lib/circle-variation.test.mts frontend/lib/circles.ts 'frontend/app/circle/[id].tsx'
git commit -m "Add seeded variation to circle demo data"
```
