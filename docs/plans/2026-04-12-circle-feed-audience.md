# Circle Feed Audience Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make home feed tabs audience-based so both friends and circles can show solo and group habit posts, and stop dropping real group snaps.

**Architecture:** Add a small pure helper that classifies feed items for the `Friends` and `Circles` tabs. Update the home screen to use that helper instead of `post.kind`. Remove the `is_group_post` exclusion from the real Supabase feed loader so group snaps reach the UI.

**Tech Stack:** Expo Router, React Native, TypeScript, Supabase, Node native test runner

---

### Task 1: Add a failing classification test

**Files:**
- Create: `frontend/lib/home-feed-tabs.test.mts`
- Create: `frontend/lib/home-feed-tabs.ts`

**Step 1: Write the failing test**

- Assert that a `group` post is included in the `friends` tab.
- Assert that a `solo` post is included in the `circles` tab.
- Assert that a `dispatch` post is excluded from the `circles` tab.

**Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test frontend/lib/home-feed-tabs.test.mts`

Expected: fail because the helper does not exist yet.

### Task 2: Implement the tab helper

**Files:**
- Create: `frontend/lib/home-feed-tabs.ts`

**Step 1: Write minimal implementation**

- Export a `HomeFeedTab` type with `friends | circles`.
- Export a `postAppearsInHomeTab(post, tab)` helper.
- Export a `filterPostsForHomeTab(posts, tab)` helper.
- Classification rules:
  - `dispatch` -> `friends` only
  - `solo` -> `friends` and `circles`
  - `group` -> `friends` and `circles`

**Step 2: Run test to verify it passes**

Run: `node --experimental-strip-types --test frontend/lib/home-feed-tabs.test.mts`

Expected: pass.

### Task 3: Switch the home screen to audience-based filtering

**Files:**
- Modify: `frontend/app/(tabs)/index.tsx`
- Modify: `frontend/lib/home-feed-tabs.ts`

**Step 1: Replace post-kind filtering**

- Remove the direct `group` split in the home screen.
- Use `filterPostsForHomeTab(posts, "friends")`.
- Use `filterPostsForHomeTab(posts, "circles")`.

**Step 2: Keep rendering logic unchanged**

- Leave `FeedList` card rendering as-is.
- Do not redesign group cards or dispatch cards.

### Task 4: Stop dropping real group snaps

**Files:**
- Modify: `frontend/lib/feed.ts`

**Step 1: Remove the real-feed exclusion**

- Delete the `.filter((snap) => !snap.is_group_post)` step.
- Keep the rest of the mapping intact for MVP.

**Step 2: Verify real feed still returns `FeedPost[]`**

- Ensure the TypeScript shape still compiles without widening unrelated code.

### Task 5: Verify and finish

**Files:**
- Verify: `frontend/lib/home-feed-tabs.test.mts`
- Verify: `frontend/app/(tabs)/index.tsx`
- Verify: `frontend/lib/feed.ts`

**Step 1: Run targeted test**

Run: `node --experimental-strip-types --test frontend/lib/home-feed-tabs.test.mts`

Expected: pass.

**Step 2: Run TypeScript**

Run: `cd frontend && npx tsc --noEmit`

Expected: exit 0.

**Step 3: Run lint**

Run: `cd frontend && npx expo lint`

Expected: exit 0.

**Step 4: Commit**

```bash
git add docs/plans/2026-04-12-circle-feed-audience-design.md docs/plans/2026-04-12-circle-feed-audience.md frontend/lib/home-feed-tabs.ts frontend/lib/home-feed-tabs.test.mts frontend/lib/feed.ts 'frontend/app/(tabs)/index.tsx'
git commit -m "Fix circle feed audience split"
```
