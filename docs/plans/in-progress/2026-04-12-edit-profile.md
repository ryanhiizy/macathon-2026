# Edit Profile Plan

## Goal

Make the existing edit profile modal update the current user's profile data for the hackathon demo, with saved changes showing immediately on the profile tab.

## Why

The profile screen already reads from Supabase, but the edit modal is still hardcoded and does not persist anything. That breaks a basic demo path and makes the profile screen feel fake.

## Approach

Load the current profile into the modal, allow editing of display name, handle, and bio, then save those fields back to the existing `profiles` row. Keep photo changes out of scope, but show the current avatar in the modal so the screen still feels complete. Refresh the profile tab on focus so the saved data appears after dismissing the modal.

## Files To Change

- `frontend/app/edit-profile.tsx`
- `frontend/app/(tabs)/profile.tsx`
- `frontend/lib/supabase.ts`
- `frontend/lib/demo-auth.ts`
- `docs/features/profile.md`

## Risks

- `handle` may have uniqueness constraints in Supabase, so save errors need to surface clearly.
- The app supports both Supabase auth and local demo auth, so the modal cannot assume a real backend session exists.

## Out Of Scope

- Uploading or changing the avatar image
- Strong profile validation beyond demo-safe normalization
- Editing stats, circles, or any non-profile data
