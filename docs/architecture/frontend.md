# Frontend Architecture

See [`../Architecture.md`](../Architecture.md) for the full stack. This covers the Expo app structure.

## Runtime

Expo Go on physical iPhone via `expo start --tunnel`. Windows team — no Xcode, no simulator, no native builds.

## Route shape

File-based routing under `app/`. Add screens by adding files.

```
app/
├── _layout.tsx              # root layout — auth gate + providers
├── index.tsx                # sign-in / landing
├── (tabs)/
│   ├── _layout.tsx          # bottom tab bar
│   ├── index.tsx            # home feed (today's snaps from all circles)
│   ├── habits.tsx           # habit list + create
│   └── profile.tsx          # streaks per circle
├── capture/
│   └── [habitId].tsx        # camera + prompt + submit (the core screen)
├── circles/
│   ├── [circleId].tsx       # circle feed
│   └── join.tsx             # invite link landing
└── auth/
    └── callback.tsx         # Supabase magic link callback
```

Build in this order: `capture/[habitId]` → home feed → habits → circles → profile.

## State

- React Context + hooks. No state library unless things get painful — then Zustand.
- Supabase client lives in `lib/supabase.ts`, imported wherever needed.
- Realtime subscriptions for the circle feed — no polling.

## Data fetching

`fetch-on-mount` pattern: query Supabase in a `useEffect`, store in local state, show a loading spinner. No cache layer in V1.

## Styling

NativeWind. See [`../designs/design-system.md`](../designs/design-system.md) for tokens.
