# Solo Capture Feed Design

**Goal:** Let a user open a habit camera, take a real photo, verify it against the AI judge, upload it to Supabase, and see that photo appear in the feed.

**Scope**
- Solo camera only in `frontend/app/camera/[id].tsx`
- Preview composer with caption editing before post
- AI verification through `POST /verify-photo`
- Real photo upload to Supabase Storage bucket `snaps`
- Real snap creation in Postgres
- Feed reads real Supabase snaps and prepends them above existing mock posts

**Out of Scope**
- `/generate-prompt`
- Group post participant linkage
- New backend migrations

**Architecture**
- The camera screen captures an image with `expo-camera`.
- After capture, the app shows a full-screen preview with a caption composer and explicit `Retake` / `Confirm & Post` actions.
- `Confirm & Post` becomes `Verify & Post`.
- The app sends the captured file and the current prompt text to `/verify-photo`.
- On failure, the app keeps the preview open and shows a playful retry message plus a concrete retry hint.
- The client creates or reuses a same-day `habit_instances` row with placeholder prompt metadata.
- The client uploads the captured image to `storage/v1/object/public/snaps/...`.
- After verification passes and upload succeeds, the client calls `complete_verified_solo_snap(...)` to create the `snaps` row and mark the instance verified.
- The feed loads real snaps for the signed-in user from Supabase and maps them into the existing `FeedPost` UI shape, then appends the current mock feed below for demo depth.

**Why this approach**
- It uses the existing schema and verified-snap RPC instead of inventing a parallel write path.
- It adds the real AI judge at the most understandable moment: the user can see the exact photo that was judged.
- It keeps the UI changes small and fail-fast: if upload or RPC fails, the user sees the failure immediately.

**Data contract**
- `habit_instances`
  - create when no same-day row exists for the habit
  - placeholder prompt values are allowed for this demo path
- `complete_verified_solo_snap`
  - used as the final write boundary after upload succeeds
- Feed query
  - reads `snaps`, `habits`, `profiles`, and `likes`
  - maps `storage_path` to a public image URL

**Verification**
- `cd frontend && npx tsc --noEmit`
- `cd frontend && npx expo lint`
- Manual Expo flow:
  1. Open a habit
  2. Tap `Prove`
  3. Take a photo
  4. Enter or edit the caption in preview
  5. Tap `Verify & Post`
  6. If the judge rejects it, confirm a funny retry message appears and `Retake` is available
  7. If the judge passes it, confirm the app returns from camera
  8. Confirm the new photo appears at the top of the feed
  9. Confirm a row exists in `snaps` and an object exists in the `snaps` bucket
