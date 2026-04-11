# Feature: Circles

A Circle is a community group built around a single habit. It's the social layer — the whole point of the product.

## What It Does

- User creates a Circle with a name and description, becomes the first member
- Circle gets a unique `invite_code` and a shareable invite link
- Other users open the link → land on `app/circles/join.tsx` → join the Circle
- All members have committed to the same daily habit and see each other's proof photos in one feed
- Members compete on a leaderboard ranked by streak

## Circles Page

Lists all Circles the user is in. Header:
- **Search** (top-left) — discover and join new Circles by name/category
- **Create** (top-right) — start a new Circle

### Circle List Card

Each Circle shown as a tappable card:
- Circle icon and name
- Member count + user's current streak in this Circle
- Thumbnail row of recent proof photos from members

## Circle Detail View

Three tabs accessed via a segmented control:

### Feed Tab
Chronological feed of proof posts from all Circle members. Includes solo posts and group posts. Functions identically to the main Home feed but filtered to this Circle's habit. Uses Supabase Realtime for live updates — new snaps appear without a pull-to-refresh.

Each feed item:
- User avatar + display name
- Habit name + time ago
- Streak badge (solo) or "Group" badge + participant chips (group)
- Proof photo + AI prompt text
- Like action

Missed instances appear as empty cards with a streak-broken indicator.

### Leaderboard Tab
Ranked list of Circle members by streak length. Two sub-filters:
- **All Time** — total consecutive streak
- **Monthly** — streak within the current calendar month

Each entry: rank, avatar, name, streak count. The user's own entry is highlighted.

### About Tab
- Circle description (rules, commitment details)
- Full members list: avatar, name, streak per member
- "+ N more" indicator for large Circles

## Invite Links

```ts
Linking.createURL('/circles/join?code=<invite_code>')
// In Expo Go dev: exp://<host>/--/circles/join?code=...
// Never hardcode the scheme
```

Parsing in `app/circles/join.tsx`:
```ts
const { code } = useLocalSearchParams<{ code: string }>();
```

## Realtime

Supabase Realtime subscription on the `snaps` table scoped by `circle_id`. New snaps push into the feed live. Missed habit instances broadcast via the `habit_instances` table update.

```ts
supabase
  .channel(`circle:${circleId}`)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'snaps',
      filter: `circle_id=eq.${circleId}` }, handleNewSnap)
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'habit_instances' },
      handleMissedHabit)
  .subscribe();
```

## Privacy

Circles are **private by default**. Public discovery is in scope for MVP via the search button (search by name). The only way to join is via invite link or search.

## Screens

- `app/(tabs)/circles.tsx` — circles list
- `app/circles/[circleId].tsx` — circle detail (Feed / Leaderboard / About)
- `app/circles/new.tsx` — create Circle form
- `app/circles/join.tsx` — invite link landing page

## Data

Reads/writes `circles`, `circle_members`, `snaps`, `snap_participants`. See [`../architecture/data-model.md`](../architecture/data-model.md).
