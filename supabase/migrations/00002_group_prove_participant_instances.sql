alter table snap_participants
add column participant_habit_instance_id uuid not null unique references habit_instances(id) on delete cascade;

create index snap_participants_habit_instance_idx on snap_participants (participant_habit_instance_id);
