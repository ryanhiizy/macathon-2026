-- Allow snap_participants rows without a linked habit instance.
-- Group prove participants may not have their own habit instance yet.
alter table snap_participants
  alter column participant_habit_instance_id drop not null;
