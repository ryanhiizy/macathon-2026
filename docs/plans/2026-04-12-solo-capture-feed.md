# Solo Capture Feed Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the solo habit camera verify the photo, then create a real Supabase-backed feed post.

**Architecture:** Capture a real photo in the existing camera route, show a preview composer, call `/verify-photo` from that preview, then upload to Supabase Storage and reuse the existing verified-snap RPC for the final write only when verification passes. Real snaps are prepended above the mock feed so the demo stays full even with little live data.

**Tech Stack:** Expo Router, expo-camera, Fetch/FormData, Supabase JS, Supabase Storage, existing Postgres RPCs, local FastAPI verifier

---

### Task 1: Add verify-and-submit helpers

**Files:**
- Create: `frontend/lib/snaps.ts`
- Modify: `frontend/lib/feed.ts`

**Step 1: Write the helper surface**

- `getOrCreateTodayHabitInstance(habitId: string)`
- `verifySnapPhoto(localUri: string, promptText: string)`
- `uploadSnapPhoto(userId: string, circleId: string, localUri: string)`
- `submitSoloSnap(habitId: string, caption?: string)`
- `fetchRecentRealFeedPosts(userId?: string)`

**Step 2: Implement the verification path**

- Build a `FormData` payload for `/verify-photo`
- Map backend rejection reasons into playful UI-safe copy
- Return a structured result with `passed`, `message`, and `retryHint`

**Step 3: Implement the DB and Storage path**

- Query `habits` to get `circle_id`, `target_time`, and `name`
- Reuse a same-day `habit_instances` row when it already exists
- Otherwise insert one with placeholder prompt fields
- Upload the image into `snaps/<circle_id>/<user_id>/<timestamp>.jpg`
- Call `complete_verified_solo_snap(...)`

**Step 4: Map real snaps into `FeedPost`**

- Use `storage_path` to build a public image URL
- Map profile name/handle into existing feed UI fields
- Use `streak_after_completion`, `prompt_text`, and `caption`
- Default likes/comments to zero if absent

**Step 5: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: PASS

### Task 2: Wire the solo camera preview flow

**Files:**
- Modify: `frontend/app/camera/[id].tsx`

**Step 1: Add camera capture state**

- `useRef<CameraViewRef>`
- `isCameraReady`
- `submitting`
- `verifying`
- local error text
- local retry message text
- captured image preview URI
- caption draft

**Step 2: Replace immediate submit with preview**

- Wait for camera ready
- Call `takePictureAsync({ quality: 0.7 })`
- Show a preview composer instead of submitting immediately
- Keep `Retake`

**Step 3: Verify then post**

- Change CTA to `Verify & Post`
- Call the verifier helper first
- On failure, stay on the preview and show the playful retry guidance
- On pass, submit through the Supabase helper
- Navigate back to the feed on success

**Step 4: Fail fast**

- Disable the shutter while submitting
- Surface upload or RPC errors on screen

**Step 5: Verify**

Run: `cd frontend && npx expo lint`
Expected: PASS

### Task 3: Prepend real feed data

**Files:**
- Modify: `frontend/app/(tabs)/index.tsx`
- Modify: `frontend/lib/feed.ts`

**Step 1: Load real posts**

- Fetch recent real snaps for the signed-in user
- Merge them above the existing mock feed from `getFeedPosts(user?.id)`

**Step 2: Keep UI compatibility**

- Do not change feed component structure
- Keep mock posts as fallback depth for demo accounts

**Step 3: Verify**

Run: `cd frontend && npx tsc --noEmit && npx expo lint`
Expected: PASS

### Task 4: Manual smoke flow

**Files:**
- None

**Step 1: Run Expo**

Run: `cd frontend && npx expo start --lan`

**Step 2: Manual test**

1. Sign in
2. Open `Habits`
3. Tap `Prove` on a habit
4. Take a photo
5. Confirm the preview composer appears
6. Edit the caption
7. Tap `Verify & Post`
8. If the image fails, confirm the playful retry message appears and use `Retake`
9. On a passing image, return to feed
10. Confirm the new post renders at the top

**Step 3: Database sanity check**

- Confirm the image exists in bucket `snaps`
- Confirm the matching `snaps` row exists
- Confirm the `habit_instances` row is `verified`
