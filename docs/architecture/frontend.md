# Frontend Architecture

See [`../Architecture.md`](../Architecture.md) for the full stack. This covers the Expo app structure.

## Runtime

Expo Go on physical iPhone via `expo start --lan` (same Wi-Fi) or `expo start --tunnel` (different network). Mac users can also run in the iOS Simulator.

## Route Shape

File-based routing under `app/`. Add screens by adding files.

```
app/
├── _layout.tsx                  # root layout — auth gate + providers
├── index.tsx                    # sign-in / landing
├── (tabs)/
│   ├── _layout.tsx              # bottom tab bar (Home, Habits, Circles, Profile)
│   ├── index.tsx                # Home feed — Friends tab + Circles tab
│   ├── habits.tsx               # Habits page — daily progress, habit cards, prove/invite
│   ├── circles.tsx              # Circles list — search, create, join
│   └── profile.tsx              # Profile — stats, bio, posts grid
├── capture/
│   └── [habitId].tsx            # Solo camera + AI prompt + submit
├── group-prove/
│   └── [habitId].tsx            # Group camera + participant panel + submit
├── circles/
│   ├── [circleId].tsx           # Circle detail — Feed / Leaderboard / About tabs
│   ├── new.tsx                  # Create Circle form
│   └── join.tsx                 # Invite link landing page
└── auth/
    └── callback.tsx             # Supabase magic link callback
```

## Build Order

Build in this priority order for the hackathon demo:

1. `capture/[habitId].tsx` — core prove loop (solo)
2. `(tabs)/habits.tsx` — habit list + daily progress
3. `(tabs)/index.tsx` — home feed with solo post cards
4. `group-prove/[habitId].tsx` — group prove flow
5. `circles/[circleId].tsx` — circle feed + leaderboard
6. `(tabs)/circles.tsx` — circle list
7. `(tabs)/profile.tsx` — profile page

## State

- React Context + hooks. No state library unless things get painful — then Zustand.
- Supabase client lives in `lib/supabase.ts`, imported wherever needed.
- Realtime subscriptions for the circle feed and home feed — no polling.

## Data Fetching

`fetch-on-mount` pattern: query Supabase in a `useEffect`, store in local state, show a loading spinner. No cache layer in V1.

## Navigation

Bottom tab bar (Home, Habits, Circles, Profile) is always visible except in full-screen camera views (`capture/` and `group-prove/`) where it is hidden and replaced by camera controls + a back button.

## Styling

NativeWind. See [`../designs/design-system.md`](../designs/design-system.md) for tokens.
