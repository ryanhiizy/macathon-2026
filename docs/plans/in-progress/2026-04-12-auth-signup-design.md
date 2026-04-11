# Auth Landing And Signup Design

## Goal

Replace the direct-to-login auth entry with a more normal social-app flow: an auth landing screen, a dedicated login screen, and a lightweight signup screen that collects identity details before the email magic link is sent.

## Why

The current auth flow works technically, but it feels too bare for a social product. It drops signed-out users straight into a magic-link form and collects no social identity upfront. For the hackathon demo, the app should feel like a real social signup without introducing password auth or a database migration.

## Chosen Approach

Use a three-screen auth flow:

1. `/auth` becomes a landing screen with two actions: `Create account` and `Log in`.
2. `/auth/signup` collects `display name`, `username`, `email`, `birth date`, and `gender`.
3. `/auth/login` keeps the simple email magic-link path for returning users.
4. Signup values are saved locally before sending the magic link.
5. On auth callback, the app uses the saved signup draft to create the `profiles` row and persist extra profile details into Supabase auth user metadata.

## Data Strategy

The current schema already supports:

- `profiles.display_name`
- `profiles.handle`

It does not currently support `birth_date` or `gender` columns. To avoid a migration for this hackathon pass:

- `display name` maps to `profiles.display_name`
- `username` maps to `profiles.handle`
- `birth date` and `gender` are stored in `auth.users.raw_user_meta_data` via `supabase.auth.updateUser({ data: ... })`

This keeps the signup feeling complete while staying inside the current backend boundaries.

## Alternatives Considered

### 1. Keep login-only auth

Pros:
- Lowest implementation cost

Cons:
- Feels unfinished for a social app
- No upfront identity collection
- Requires later onboarding work anyway

### 2. Add a database migration for full profile fields

Pros:
- Cleaner long-term profile model

Cons:
- Slower to implement
- Adds schema drift risk during the hackathon
- Not needed to unblock the frontend demo loop

## Route Shape

- `frontend/app/auth/index.tsx` becomes the auth landing screen
- `frontend/app/auth/signup.tsx` becomes the signup form
- `frontend/app/auth/login.tsx` becomes the returning-user login screen
- `frontend/app/auth/callback.tsx` stays the auth completion screen

The root auth gate still redirects signed-out users to `/auth`.

## Form Shape

Signup should collect:

- `Display name` — required
- `Username` — required
- `Email` — required
- `Birth date` — required, simple text field with `YYYY-MM-DD` placeholder
- `Gender` — optional, simple picker buttons

This is intentionally lightweight. No password, no avatar upload, no bio, no terms flow.

## Pending Signup Model

Before sending the magic link from the signup screen:

- Save the signup payload in local storage
- Include the email address in the saved payload

On callback:

- Complete the auth session
- Read the pending signup payload
- If the payload email matches the signed-in user email, use it
- Create the profile row if needed
- Write `birth_date` and `gender` into auth user metadata
- Clear the pending signup payload

If there is no pending signup payload, fall back to the existing login bootstrap behavior.

## Risks

- Local pending signup state could be stale if the user starts signup and later logs in with a different email.
- Username collisions can happen because `profiles.handle` is unique.
- Exact birth-date validation can become annoying if overbuilt.

## Mitigations

- Match pending signup data by email before using it.
- Validate username format and surface Supabase uniqueness errors plainly.
- Keep birth-date validation minimal: required field plus `YYYY-MM-DD` shape check.
- Clear pending signup data after callback success or explicit login flow use.

## Out Of Scope

- Password auth
- Phone auth
- Avatar upload during signup
- Profile editing flow beyond the current profile screen
- Database migration for extra profile columns
