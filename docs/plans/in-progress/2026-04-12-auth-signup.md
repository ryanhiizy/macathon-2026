# Auth Landing And Signup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an auth landing page and a lightweight social-style signup flow on top of the existing Supabase magic-link auth so signed-out users can choose between creating an account and logging in.

**Architecture:** Split auth into three screens under `app/auth`: landing, signup, and login. Signup persists a local draft before sending the magic link. The callback consumes that draft, creates the `profiles` row using the supplied display name and username, stores extra fields in Supabase auth metadata, and then clears the local draft.

**Tech Stack:** Expo Router, React Native, TypeScript, Supabase JS, local storage via platform-safe auth storage helpers.

---

### Task 1: Extend auth storage and bootstrap helpers

**Files:**
- Modify: `frontend/lib/supabase.ts`
- Modify: `frontend/lib/auth-storage.ts`
- Modify: `frontend/lib/auth-storage.native.ts`

**Step 1: Add pending-signup storage helpers**

Create helpers to:
- save a signup draft
- load a signup draft
- clear a signup draft

The draft should include:

```ts
{
  displayName: string;
  username: string;
  email: string;
  birthDate: string;
  gender: string | null;
}
```

**Step 2: Add richer profile bootstrap**

Update the profile bootstrap logic so it can:
- use signup draft values when present
- fall back to email-derived defaults when absent
- preserve an existing `profiles` row instead of blindly overwriting it
- write `birth_date` and `gender` into auth user metadata when provided

**Step 3: Verify helper surface**

Run:

```bash
sed -n '1,320p' frontend/lib/supabase.ts
sed -n '1,220p' frontend/lib/auth-storage.ts
sed -n '1,120p' frontend/lib/auth-storage.native.ts
```

Expected: storage and profile bootstrap can support both login and signup paths.

### Task 2: Turn `/auth` into a landing screen

**Files:**
- Modify: `frontend/app/auth/index.tsx`

**Step 1: Replace the direct login form**

Implement a simple landing page with:
- product heading
- one short sentence
- `Create account` CTA
- `Log in` CTA

**Step 2: Route to dedicated auth screens**

Use Expo Router navigation to send users to:
- `/auth/signup`
- `/auth/login`

**Step 3: Verify the landing screen**

Run:

```bash
sed -n '1,240p' frontend/app/auth/index.tsx
```

Expected: `/auth` is no longer the magic-link form.

### Task 3: Move the current login form into `/auth/login`

**Files:**
- Create: `frontend/app/auth/login.tsx`

**Step 1: Port the existing email magic-link screen**

Keep:
- email input
- send button
- loading/success/error states

**Step 2: Make login explicit**

Before sending the magic link:
- clear any pending signup draft

Add a back link to the auth landing page.

**Step 3: Verify login route**

Run:

```bash
sed -n '1,260p' frontend/app/auth/login.tsx
```

Expected: returning-user login is isolated from signup.

### Task 4: Build the signup form

**Files:**
- Create: `frontend/app/auth/signup.tsx`

**Step 1: Add the signup fields**

Build inputs for:
- display name
- username
- email
- birth date
- gender picker

**Step 2: Validate minimally**

Require:
- display name
- username
- email
- birth date

Check:
- username is normalized to a safe handle shape
- birth date looks like `YYYY-MM-DD`

**Step 3: Save draft and send magic link**

Before sending the magic link:
- save the pending signup draft
- send `signInWithOtp`

Add a success state telling the user to open the email link on the same phone.

**Step 4: Verify signup route**

Run:

```bash
sed -n '1,320p' frontend/app/auth/signup.tsx
```

Expected: the form feels like a lightweight social signup and does not require backend schema changes.

### Task 5: Update callback and root routing for the split flow

**Files:**
- Modify: `frontend/app/auth/callback.tsx`
- Modify: `frontend/app/_layout.tsx`

**Step 1: Update callback bootstrap**

On callback:
- complete the session
- read the pending signup draft
- if draft email matches the signed-in user, use it for bootstrap
- clear the draft after success

**Step 2: Keep route gating correct**

The auth gate should continue to allow:
- `/auth`
- `/auth/login`
- `/auth/signup`
- `/auth/callback`

It should still redirect signed-out users away from app tabs.

**Step 3: Verify route behavior**

Run:

```bash
sed -n '1,260p' frontend/app/auth/callback.tsx
sed -n '1,240p' frontend/app/_layout.tsx
```

Expected: login and signup both reach the same callback safely.

### Task 6: Verify the app builds with the new routes

**Files:**
- Modify: `frontend/lib/supabase.ts`
- Modify: `frontend/app/_layout.tsx`
- Modify: `frontend/app/auth/index.tsx`
- Create: `frontend/app/auth/login.tsx`
- Create: `frontend/app/auth/signup.tsx`
- Modify: `frontend/app/auth/callback.tsx`

**Step 1: Typecheck**

Run:

```bash
cd frontend && npx tsc --noEmit
```

Expected: PASS

**Step 2: Lint**

Run:

```bash
cd frontend && npx expo lint
```

Expected: PASS

**Step 3: Verify Expo web/static build**

Run:

```bash
cd frontend && npx expo export --platform web
```

Expected: PASS and new auth routes are emitted.

**Step 4: Inspect scope**

Run:

```bash
git diff -- frontend/lib/supabase.ts frontend/lib/auth-storage.ts frontend/lib/auth-storage.native.ts frontend/app/_layout.tsx frontend/app/auth/index.tsx frontend/app/auth/login.tsx frontend/app/auth/signup.tsx frontend/app/auth/callback.tsx docs/plans/in-progress/2026-04-12-auth-signup-design.md docs/plans/in-progress/2026-04-12-auth-signup.md
```

Expected: only auth landing/signup/login routing and bootstrap changes are present.
