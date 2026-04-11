# Supabase Setup

Schema, RLS, storage, cron, and auth. Copy-paste reference for setting up the project.

## Project setup

Free tier. Create a project at supabase.com, grab the URL and anon key:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Put them in `.env` at the repo root. Never commit this file.

## Schema

Run this in the Supabase SQL editor:

```sql
-- profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

-- circles
create table circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references profiles(id),
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

-- circle_members
create table circle_members (
  circle_id uuid not null references circles(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  current_streak integer not null default 0,
  primary key (circle_id, user_id)
);

-- habits
create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  circle_id uuid not null references circles(id) on delete cascade,
  name text not null,
  category text not null,           -- 'gym' | 'running' | 'cooking' | 'meal_prep' | 'reading' | ...
  verification_mode text not null,  -- 'verifiable' | 'trust'
  target_time time not null,
  created_at timestamptz not null default now()
);

-- habit_instances (one per scheduled occurrence)
create table habit_instances (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  scheduled_for timestamptz not null,
  window_closes_at timestamptz not null,
  prompt_id text not null,
  status text not null default 'pending', -- 'pending' | 'verified' | 'missed'
  verified_at timestamptz
);

-- snaps
create table snaps (
  id uuid primary key default gen_random_uuid(),
  habit_instance_id uuid not null references habit_instances(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  circle_id uuid not null references circles(id) on delete cascade,
  storage_path text not null,
  detected_classes jsonb,
  verified boolean not null,
  created_at timestamptz not null default now()
);
```

> Using `text` instead of enums for category/status/mode so we can add values without a migration mid-hackathon.

## RLS — permissive for demo

For a 3-person hackathon demo, simple "authenticated users can do anything" policies are fine. Tighten if there's time.

```sql
alter table profiles enable row level security;
alter table circles enable row level security;
alter table circle_members enable row level security;
alter table habits enable row level security;
alter table habit_instances enable row level security;
alter table snaps enable row level security;

-- Blanket: authenticated users can read and write everything
create policy "auth read all" on profiles for select using (auth.role() = 'authenticated');
create policy "auth read all" on circles for select using (auth.role() = 'authenticated');
create policy "auth read all" on circle_members for select using (auth.role() = 'authenticated');
create policy "auth read all" on habits for select using (auth.role() = 'authenticated');
create policy "auth read all" on habit_instances for select using (auth.role() = 'authenticated');
create policy "auth read all" on snaps for select using (auth.role() = 'authenticated');

create policy "auth write all" on profiles for insert with check (auth.role() = 'authenticated');
create policy "auth write all" on circles for insert with check (auth.role() = 'authenticated');
create policy "auth write all" on circle_members for insert with check (auth.role() = 'authenticated');
create policy "auth write all" on habits for insert with check (auth.role() = 'authenticated');
create policy "auth write all" on habit_instances for insert with check (auth.role() = 'authenticated');
create policy "auth write all" on snaps for insert with check (auth.role() = 'authenticated');

create policy "auth update all" on profiles for update using (auth.role() = 'authenticated');
create policy "auth update all" on circle_members for update using (auth.role() = 'authenticated');
create policy "auth update all" on habit_instances for update using (auth.role() = 'authenticated');
```

## Storage

Create a public bucket called `snaps` in the Supabase dashboard (Storage → New bucket → public). Public makes it easy to display photos in the feed without signed URLs.

Path convention: `snaps/<circle_id>/<user_id>/<uuid>.jpg`

## Realtime

Enable in the Supabase dashboard (Database → Replication → toggle `snaps` and `habit_instances`), or:

```sql
alter publication supabase_realtime add table snaps;
alter publication supabase_realtime add table habit_instances;
```

Subscribe in the app:

```ts
supabase.channel(`circle:${circleId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'snaps',
    filter: `circle_id=eq.${circleId}`,
  }, (payload) => {
    // new snap arrived — update feed
  })
  .subscribe();
```

## pg_cron — streak reset

Enable in Supabase dashboard (Database → Extensions → pg_cron), then:

```sql
select cron.schedule(
  'expire-habit-windows',
  '* * * * *',
  $$
    with expired as (
      update habit_instances
      set status = 'missed'
      where status = 'pending' and window_closes_at < now()
      returning habit_id
    )
    update circle_members cm
    set current_streak = 0
    from expired e
    join habits h on h.id = e.habit_id
    where cm.user_id = h.user_id and cm.circle_id = h.circle_id;
  $$
);
```

This runs every minute. Marks overdue instances as missed and resets streaks.

## Auth

Magic link / OTP. In Expo Go dev the redirect must be the `exp://` URL:

```ts
await supabase.auth.signInWithOtp({
  email,
  options: { emailRedirectTo: Linking.createURL('/auth/callback') },
});
```

Parse the session in `app/auth/callback.tsx` and call `supabase.auth.setSession`.
