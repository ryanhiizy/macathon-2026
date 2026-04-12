-- Denormalized comments table (text post_id so mock posts work)
create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id text not null,
  user_id text not null,
  display_name text not null,
  handle text not null,
  avatar_color text not null,
  avatar_letter text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index comments_post_id_idx on comments (post_id, created_at);
create index comments_user_id_idx on comments (user_id);

alter table comments enable row level security;
create policy "auth read all comments" on comments for select using (auth.role() = 'authenticated');
create policy "auth insert comments" on comments for insert with check (auth.role() = 'authenticated');
create policy "auth delete comments" on comments for delete using (auth.role() = 'authenticated');

-- Post likes table (text post_id so mock posts work)
create table post_likes (
  post_id text not null,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index post_likes_user_id_idx on post_likes (user_id);

alter table post_likes enable row level security;
create policy "auth read all post_likes" on post_likes for select using (auth.role() = 'authenticated');
create policy "auth insert post_likes" on post_likes for insert with check (auth.role() = 'authenticated');
create policy "auth delete post_likes" on post_likes for delete using (auth.role() = 'authenticated');

alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table post_likes;
