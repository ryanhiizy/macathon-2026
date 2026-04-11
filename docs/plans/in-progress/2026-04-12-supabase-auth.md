# Supabase Auth Flow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a minimal real Supabase email magic-link flow to the Expo app so the rest of the frontend can rely on an authenticated user and a bootstrapped `profiles` row.

**Architecture:** Keep auth narrow. A single shared Supabase client owns session persistence, the root layout acts as the auth gate, `app/index.tsx` handles sign-in, and `app/auth/callback.tsx` completes the magic-link return. On first sign-in, the app upserts a lightweight `profiles` row derived from the user's email and then enters the existing tab app.

**Tech Stack:** Expo Router, React Native, TypeScript, Supabase JS, Expo Linking, AsyncStorage.

---

### Task 1: Add auth dependencies and client bootstrap

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`
- Create: `frontend/lib/supabase.ts`

**Step 1: Add the missing native storage dependency**

Add:

```json
"@react-native-async-storage/async-storage": "^2.2.0"
```

Do not add extra auth libraries.

**Step 2: Create the Supabase client**

Implement `frontend/lib/supabase.ts` to:
- read `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- throw immediately if either is missing
- create one shared `supabase` client
- configure native session persistence with AsyncStorage
- accept `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` first, with `EXPO_PUBLIC_SUPABASE_ANON_KEY` as legacy fallback
- export helpers for profile bootstrap and user-email parsing

**Step 3: Verify the dependency and client surface**

Run:

```bash
sed -n '1,220p' frontend/package.json
sed -n '1,260p' frontend/lib/supabase.ts
```

Expected: the dependency is present and the Supabase client fails fast on missing env vars.

### Task 2: Add the unauthenticated sign-in screen

**Files:**
- Create: `frontend/app/auth/index.tsx`

**Step 1: Write the sign-in screen**

Implement a small screen with:
- title and short helper copy
- email input
- send button
- loading, success, and error states

The button should call:

```ts
supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: Linking.createURL("/auth/callback"),
  },
});
```

**Step 2: Keep the flow intentionally narrow**

Do not add phone auth, password auth, or onboarding here.

**Step 3: Verify the screen shape**

Run:

```bash
sed -n '1,260p' frontend/app/auth/index.tsx
```

Expected: the screen is self-contained and only supports email magic link.

### Task 3: Add callback handling and profile bootstrap

**Files:**
- Create: `frontend/app/auth/callback.tsx`
- Modify: `frontend/lib/supabase.ts`

**Step 1: Build the callback screen**

Implement a screen that:
- reads the current deep link URL
- asks Supabase to exchange the auth session from the URL
- shows loading while completing
- shows a clear error state if exchange fails

**Step 2: Bootstrap the profile**

After session exchange succeeds:
- fetch the signed-in user
- derive `display_name` and `handle` from the email
- upsert the `profiles` row
- redirect to `/(tabs)`

**Step 3: Verify the callback logic**

Run:

```bash
sed -n '1,260p' frontend/app/auth/callback.tsx
sed -n '1,260p' frontend/lib/supabase.ts
```

Expected: callback success always attempts profile bootstrap before entering the app.

### Task 4: Turn the root layout into an auth gate

**Files:**
- Modify: `frontend/app/_layout.tsx`

**Step 1: Add session bootstrap**

On mount:
- get the current session from Supabase
- keep a loading state until the first check completes
- subscribe to `supabase.auth.onAuthStateChange`

**Step 2: Redirect by auth state**

If unauthenticated:
- allow `/auth` and `/auth/callback`
- redirect signed-out visits away from `/(tabs)`

If authenticated:
- redirect `/auth` to `/(tabs)`

**Step 3: Preserve the current theme shell**

Keep the existing font loading, splash handling, and theme provider intact while adding auth gating.

**Step 4: Verify route gating**

Run:

```bash
sed -n '1,280p' frontend/app/_layout.tsx
```

Expected: auth state drives navigation without removing the existing theme setup.

### Task 5: Replace hardcoded profile identity and add sign-out

**Files:**
- Modify: `frontend/app/(tabs)/profile.tsx`

**Step 1: Fetch the current session user profile**

Load the signed-in user and the matching `profiles` row on mount.

**Step 2: Replace hardcoded identity**

Use:
- `display_name`
- `handle`
- `created_at`
- `bio`

Fallback safely if profile data is not present yet.

**Step 3: Add sign-out**

Wire the settings button or a new visible button to `supabase.auth.signOut()`.

**Step 4: Verify the profile screen**

Run:

```bash
sed -n '1,280p' 'frontend/app/(tabs)/profile.tsx'
```

Expected: the screen no longer hardcodes a specific person as the logged-in user.

### Task 6: Typecheck and lint the auth surface

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/lib/supabase.ts`
- Modify: `frontend/app/_layout.tsx`
- Create: `frontend/app/auth/index.tsx`
- Create: `frontend/app/auth/callback.tsx`
- Modify: `frontend/app/(tabs)/profile.tsx`

**Step 1: Run TypeScript verification**

Run:

```bash
cd frontend && npx tsc --noEmit
```

Expected: PASS

**Step 2: Run lint**

Run:

```bash
cd frontend && npx expo lint
```

Expected: PASS

**Step 3: Inspect the diff for scope control**

Run:

```bash
git diff -- frontend/package.json frontend/package-lock.json frontend/lib/supabase.ts frontend/app/_layout.tsx frontend/app/auth/index.tsx frontend/app/auth/callback.tsx 'frontend/app/(tabs)/profile.tsx' docs/plans/in-progress/2026-04-12-supabase-auth-design.md docs/plans/in-progress/2026-04-12-supabase-auth.md
```

Expected: only auth, profile bootstrap, and planning changes are present.
