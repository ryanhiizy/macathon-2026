-- conversations: DMs and group chats
create table conversations (
  id text primary key,
  name text,
  is_group boolean not null default false,
  created_at timestamptz not null default now()
);

-- who's in each conversation
create table conversation_participants (
  conversation_id text not null references conversations(id) on delete cascade,
  user_id text not null,
  display_name text not null,
  color text not null default '#8B5CF6',
  letter text not null default '?',
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

-- messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id text not null references conversations(id) on delete cascade,
  sender_id text not null,
  sender_name text not null,
  sender_color text not null default '#8B5CF6',
  sender_letter text not null default '?',
  body text not null,
  created_at timestamptz not null default now()
);

create index messages_conversation_created_idx on messages (conversation_id, created_at desc);
create index messages_conversation_latest_idx on messages (conversation_id, created_at desc) include (body, sender_name);
create index conversation_participants_user_idx on conversation_participants (user_id);

-- RLS
alter table conversations enable row level security;
alter table conversation_participants enable row level security;
alter table messages enable row level security;

-- For hackathon: allow all authenticated users + anon (demo mode) full access
create policy "anyone can read conversations" on conversations for select using (true);
create policy "anyone can insert conversations" on conversations for insert with check (true);
create policy "anyone can read participants" on conversation_participants for select using (true);
create policy "anyone can insert participants" on conversation_participants for insert with check (true);
create policy "anyone can read messages" on messages for select using (true);
create policy "anyone can insert messages" on messages for insert with check (true);
create policy "anyone can update conversations" on conversations for update using (true);
create policy "anyone can update participants" on conversation_participants for update using (true);
create policy "anyone can update messages" on messages for update using (true);
create policy "anyone can delete conversations" on conversations for delete using (true);
create policy "anyone can delete participants" on conversation_participants for delete using (true);
create policy "anyone can delete messages" on messages for delete using (true);

-- Realtime for messages
alter publication supabase_realtime add table messages;
