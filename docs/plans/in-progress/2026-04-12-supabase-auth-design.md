# Supabase Auth Flow Design

## Goal

Unblock the frontend by adding the smallest viable real authentication flow: Supabase email magic link sign-in, a root auth gate, a callback route, and automatic profile bootstrap so the existing tab app can assume a logged-in user.

## Why

The current Expo app is a static shell with no auth routes, no Supabase client, and no session bootstrap. Every downstream feature depends on knowing the current user, so the fastest path is to add one reliable sign-in path and avoid extra auth surface that does not help the demo.

## Chosen Approach

Use email magic link only.

1. Add a single shared Supabase client in `frontend/lib/supabase.ts`.
2. Add native session persistence so users stay signed in between launches during the demo.
3. Add `frontend/app/auth/index.tsx` as the email sign-in screen.
4. Add `frontend/app/auth/callback.tsx` to exchange the magic link session and return into the app.
5. Update the root layout to act as the auth gate and redirect between `/` and `/(tabs)`.
6. Bootstrap a minimal `profiles` row after first successful sign-in using defaults derived from the email address.
7. Replace the hardcoded profile identity with the authenticated user's real profile and add sign-out.

## Alternatives Considered

### 1. Phone OTP

Pros:
- Looks native to a social app

Cons:
- Needs SMS provider setup and delivery testing
- Adds country-code and formatting failure points
- Worse demo reliability than email for this repo

### 2. Fake local login

Pros:
- Fastest UI path
- No redirect or session handling

Cons:
- Does not actually unblock Supabase-backed frontend work
- Creates a second auth model to remove later
- Increases risk of hidden integration failures

## Route Shape

Keep the repo-aligned Expo Router structure:

- `frontend/app/_layout.tsx` stays the root shell and auth gate
- `frontend/app/auth/index.tsx` becomes the sign-in screen
- `frontend/app/auth/callback.tsx` handles magic-link completion
- `frontend/app/(tabs)/*` remains the signed-in app surface

This keeps the documented architecture intact and minimizes route churn.

## Session Model

- The app reads `EXPO_PUBLIC_SUPABASE_URL` and a client key from `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Native session persistence uses `@react-native-async-storage/async-storage`.
- The root layout fetches the current session on startup and subscribes to `onAuthStateChange`.
- If there is no session, users stay on `/`.
- If there is a session, users are redirected to `/(tabs)`.

## Callback Model

- The login screen sends email OTP with `emailRedirectTo: Linking.createURL('/auth/callback')`.
- The callback screen parses the incoming URL and passes it to Supabase session exchange.
- On success, the app ensures the `profiles` row exists, then redirects into the tab app.
- On failure, the callback screen shows a clear failure state and a route back to sign-in.

## Profile Bootstrap

The first successful sign-in should immediately upsert a `profiles` row so later screens can rely on app-level identity.

Defaults:
- `display_name`: derived from the email local-part, title-cased
- `handle`: sanitized local-part with a short deterministic suffix
- `bio`: `null`
- `avatar_url`: `null`

This is intentionally hackathon-grade. It is enough to make the feed, circles, and profile surfaces data-backed without building a full onboarding flow.

## UI Scope

The auth UI should stay intentionally small:

- brand/title
- one email input
- one primary CTA
- short helper copy
- success state telling the user to check inbox
- loading and error feedback

No password flow, no phone option, no profile completion wizard.

## Risks

- Magic-link redirects can be brittle in Expo Go if the project URL changes.
- If AsyncStorage is not wired into the Supabase client, sessions will not persist on device.
- Profile inserts can fail if the canonical Supabase schema has not been run.

## Mitigations

- Use Expo Router's `Linking.createURL('/auth/callback')` exactly as documented.
- Add native storage configuration in the client from the start.
- Fail loudly on missing Supabase env vars so setup problems surface immediately.
- Keep the auth surface to one real path rather than mixing fake and real login.

## Out Of Scope

- Phone OTP
- Password auth
- Social login
- Full onboarding or profile editing
- Tight production-grade RLS or auth hardening
