# Feature: Circles

A circle is a group of users sharing one habit. It's the social layer — the whole point of the product.

## What it does

- A user creates a circle with a name, becomes the first member
- The circle gets a unique `invite_code` and a shareable link
- Other users open the link → land on `app/circles/join.tsx` → join the circle
- All members of a circle have their own habit (e.g. everyone's "morning gym") and see each other's snaps in one feed

## Screens

- `app/(tabs)/index.tsx` — today's snap feed (all circles the user is in)
- `app/circles/index.tsx` — list of user's circles
- `app/circles/[circleId].tsx` — single circle feed + leaderboard
- `app/circles/new.tsx` — create circle form
- `app/circles/join.tsx` — landing page from an invite link

## Invite links

Use `Linking.createURL('/circles/join?code=<invite_code>')` from `expo-linking`. In Expo Go dev this resolves to `exp://<host>/--/circles/join?code=...`, in a real build it'd be your custom scheme. Never hardcode the scheme.

Parsing in `app/circles/join.tsx`:

```ts
const { code } = useLocalSearchParams<{ code: string }>();
```

## Feed

The circle feed is a list of `snaps` ordered by `created_at desc`, scoped by `circle_id`. Uses a Supabase Realtime subscription to push new snaps in as they're submitted.

Each feed item shows:
- User avatar + display name
- The prompt text for that snap
- The photo
- Verification badge (for verifiable habits)
- Detected classes as small chips (for transparency / amusement)
- Timestamp
- Streak count at time of submission

Missed instances appear as empty cards with a streak-broken indicator.

## Privacy

Circles are **private by default**. Public discovery is out of scope for MVP. The only way to join is via invite link.

## RLS

Permissive for demo — authenticated users can read/write. See [`../infrastructure/supabase.md`](../infrastructure/supabase.md).
