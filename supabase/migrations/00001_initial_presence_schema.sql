create extension if not exists pgcrypto with schema extensions;

-- profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  handle text not null unique,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now()
);

-- follows powers the Friends feed
create table follows (
  follower_id uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- circles
create table circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid not null references profiles(id) on delete cascade,
  invite_code text not null unique,
  is_private boolean not null default true,
  created_at timestamptz not null default now()
);

-- circle membership and streak state
create table circle_members (
  circle_id uuid not null references circles(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  current_streak integer not null default 0,
  best_streak integer not null default 0,
  primary key (circle_id, user_id)
);

-- each user has their own habit row bound to a circle
create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  circle_id uuid not null references circles(id) on delete cascade,
  name text not null,
  category text not null,
  verification_mode text not null,
  target_time time not null,
  frequency text not null default 'daily',
  created_at timestamptz not null default now()
);

-- one row per scheduled occurrence
create table habit_instances (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  scheduled_for timestamptz not null,
  window_closes_at timestamptz not null,
  prompt_id text not null,
  prompt_text text not null,
  prompt_required_classes jsonb not null default '[]'::jsonb,
  attempt_count integer not null default 0,
  last_failure_reason text,
  status text not null default 'pending',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (habit_id, scheduled_for)
);

-- one accepted snap per habit instance
create table snaps (
  id uuid primary key default gen_random_uuid(),
  habit_instance_id uuid not null unique references habit_instances(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  circle_id uuid not null references circles(id) on delete cascade,
  storage_path text not null,
  prompt_text text not null,
  detected_classes jsonb not null default '[]'::jsonb,
  verified boolean not null,
  is_group_post boolean not null default false,
  caption text,
  streak_after_completion integer not null,
  created_at timestamptz not null default now()
);

-- extra participants for group posts
create table snap_participants (
  snap_id uuid not null references snaps(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  streak_after_completion integer not null,
  primary key (snap_id, user_id)
);

-- likes on feed posts
create table likes (
  snap_id uuid not null references snaps(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (snap_id, user_id)
);

create index follows_following_id_idx on follows (following_id);
create index circle_members_user_id_idx on circle_members (user_id);
create index habits_user_id_idx on habits (user_id);
create index habits_circle_id_idx on habits (circle_id);
create index habit_instances_window_idx on habit_instances (status, window_closes_at);
create index habit_instances_habit_schedule_idx on habit_instances (habit_id, scheduled_for desc);
create index snaps_circle_created_idx on snaps (circle_id, created_at desc);
create index snaps_user_created_idx on snaps (user_id, created_at desc);
create index snap_participants_user_id_idx on snap_participants (user_id);
create index likes_user_id_idx on likes (user_id);

alter table profiles enable row level security;
alter table follows enable row level security;
alter table circles enable row level security;
alter table circle_members enable row level security;
alter table habits enable row level security;
alter table habit_instances enable row level security;
alter table snaps enable row level security;
alter table snap_participants enable row level security;
alter table likes enable row level security;

create policy "auth read all profiles" on profiles for select using (auth.role() = 'authenticated');
create policy "auth read all follows" on follows for select using (auth.role() = 'authenticated');
create policy "auth read all circles" on circles for select using (auth.role() = 'authenticated');
create policy "auth read all circle_members" on circle_members for select using (auth.role() = 'authenticated');
create policy "auth read all habits" on habits for select using (auth.role() = 'authenticated');
create policy "auth read all habit_instances" on habit_instances for select using (auth.role() = 'authenticated');
create policy "auth read all snaps" on snaps for select using (auth.role() = 'authenticated');
create policy "auth read all snap_participants" on snap_participants for select using (auth.role() = 'authenticated');
create policy "auth read all likes" on likes for select using (auth.role() = 'authenticated');

create policy "auth insert all profiles" on profiles for insert with check (auth.role() = 'authenticated');
create policy "auth insert all follows" on follows for insert with check (auth.role() = 'authenticated');
create policy "auth insert all circles" on circles for insert with check (auth.role() = 'authenticated');
create policy "auth insert all circle_members" on circle_members for insert with check (auth.role() = 'authenticated');
create policy "auth insert all habits" on habits for insert with check (auth.role() = 'authenticated');
create policy "auth insert all habit_instances" on habit_instances for insert with check (auth.role() = 'authenticated');
create policy "auth insert all snaps" on snaps for insert with check (auth.role() = 'authenticated');
create policy "auth insert all snap_participants" on snap_participants for insert with check (auth.role() = 'authenticated');
create policy "auth insert all likes" on likes for insert with check (auth.role() = 'authenticated');

create policy "auth update all profiles" on profiles for update using (auth.role() = 'authenticated');
create policy "auth update all circles" on circles for update using (auth.role() = 'authenticated');
create policy "auth update all circle_members" on circle_members for update using (auth.role() = 'authenticated');
create policy "auth update all habits" on habits for update using (auth.role() = 'authenticated');
create policy "auth update all habit_instances" on habit_instances for update using (auth.role() = 'authenticated');
create policy "auth update all snaps" on snaps for update using (auth.role() = 'authenticated');

create policy "auth delete all follows" on follows for delete using (auth.role() = 'authenticated');
create policy "auth delete all circles" on circles for delete using (auth.role() = 'authenticated');
create policy "auth delete all circle_members" on circle_members for delete using (auth.role() = 'authenticated');
create policy "auth delete all habits" on habits for delete using (auth.role() = 'authenticated');
create policy "auth delete all snaps" on snaps for delete using (auth.role() = 'authenticated');
create policy "auth delete all snap_participants" on snap_participants for delete using (auth.role() = 'authenticated');
create policy "auth delete all likes" on likes for delete using (auth.role() = 'authenticated');

insert into storage.buckets (id, name, public)
values ('snaps', 'snaps', true)
on conflict (id) do nothing;

create policy "auth upload snaps"
on storage.objects for insert
with check (bucket_id = 'snaps' and auth.role() = 'authenticated');

create policy "public read snaps"
on storage.objects for select
using (bucket_id = 'snaps');

create policy "auth update snaps"
on storage.objects for update
using (bucket_id = 'snaps' and auth.role() = 'authenticated');

alter publication supabase_realtime add table snaps;
alter publication supabase_realtime add table habit_instances;
alter publication supabase_realtime add table circle_members;
alter publication supabase_realtime add table likes;

create extension if not exists pg_cron with schema pg_catalog;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

select cron.schedule(
  'expire-habit-windows',
  '* * * * *',
  $$
    with expired as (
      update habit_instances hi
      set status = 'missed'
      from habits h
      where hi.habit_id = h.id
        and hi.status = 'pending'
        and hi.window_closes_at < now()
      returning h.user_id, h.circle_id
    )
    update circle_members cm
    set current_streak = 0
    from expired e
    where cm.user_id = e.user_id
      and cm.circle_id = e.circle_id;
  $$
);
