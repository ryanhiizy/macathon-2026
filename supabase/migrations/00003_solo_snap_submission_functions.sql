create or replace function public.complete_verified_solo_snap(
  p_habit_instance_id uuid,
  p_storage_path text,
  p_detected_classes jsonb default '[]'::jsonb,
  p_caption text default null
)
returns table (
  snap_id uuid,
  habit_instance_id uuid,
  status text,
  verified_at timestamptz,
  current_streak integer,
  best_streak integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_circle_id uuid;
  v_prompt_text text;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'complete_verified_solo_snap requires an authenticated user';
  end if;

  select
    h.circle_id,
    hi.prompt_text
  into
    v_circle_id,
    v_prompt_text
  from habit_instances hi
  join habits h on h.id = hi.habit_id
  where hi.id = p_habit_instance_id
    and h.user_id = v_user_id
  for update of hi;

  if not found then
    raise exception 'invalid habit instance for current user: %', p_habit_instance_id;
  end if;

  if p_storage_path is null or btrim(p_storage_path) = '' then
    raise exception 'storage_path is required';
  end if;

  if exists (
    select 1
    from snaps s
    where s.habit_instance_id = p_habit_instance_id
  ) then
    raise exception 'snap already exists for habit instance: %', p_habit_instance_id;
  end if;

  perform 1
  from habit_instances hi
  where hi.id = p_habit_instance_id
    and hi.status = 'pending'
    and hi.window_closes_at >= now();

  if not found then
    raise exception 'habit instance is not open for verified completion: %', p_habit_instance_id;
  end if;

  perform 1
  from circle_members cm
  where cm.circle_id = v_circle_id
    and cm.user_id = v_user_id
  for update;

  if not found then
    raise exception 'invalid circle membership for current user and habit instance: %', p_habit_instance_id;
  end if;

  update circle_members cm
  set current_streak = cm.current_streak + 1,
      best_streak = greatest(cm.best_streak, cm.current_streak + 1)
  where cm.circle_id = v_circle_id
    and cm.user_id = v_user_id
  returning cm.current_streak, cm.best_streak
  into current_streak, best_streak;

  update habit_instances hi
  set status = 'verified',
      verified_at = now(),
      last_failure_reason = null
  where hi.id = p_habit_instance_id
  returning hi.id, hi.status, hi.verified_at
  into habit_instance_id, status, verified_at;

  insert into snaps (
    habit_instance_id,
    user_id,
    circle_id,
    storage_path,
    prompt_text,
    detected_classes,
    verified,
    is_group_post,
    caption,
    streak_after_completion
  )
  values (
    p_habit_instance_id,
    v_user_id,
    v_circle_id,
    p_storage_path,
    v_prompt_text,
    coalesce(p_detected_classes, '[]'::jsonb),
    true,
    false,
    p_caption,
    current_streak
  )
  returning id into snap_id;

  return next;
end;
$$;

create or replace function public.record_failed_solo_snap_attempt(
  p_habit_instance_id uuid,
  p_failure_reason text
)
returns table (
  habit_instance_id uuid,
  attempt_count integer,
  status text,
  last_failure_reason text,
  current_streak integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_circle_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'record_failed_solo_snap_attempt requires an authenticated user';
  end if;

  if p_failure_reason is null or btrim(p_failure_reason) = '' then
    raise exception 'failure_reason is required';
  end if;

  select h.circle_id
  into v_circle_id
  from habit_instances hi
  join habits h on h.id = hi.habit_id
  where hi.id = p_habit_instance_id
    and h.user_id = v_user_id
  for update of hi;

  if not found then
    raise exception 'invalid habit instance for current user: %', p_habit_instance_id;
  end if;

  perform 1
  from habit_instances hi
  where hi.id = p_habit_instance_id
    and hi.status = 'pending'
    and hi.window_closes_at >= now();

  if not found then
    raise exception 'habit instance is not open for failed verification: %', p_habit_instance_id;
  end if;

  perform 1
  from circle_members cm
  where cm.circle_id = v_circle_id
    and cm.user_id = v_user_id
  for update;

  if not found then
    raise exception 'invalid circle membership for current user and habit instance: %', p_habit_instance_id;
  end if;

  update habit_instances hi
  set attempt_count = hi.attempt_count + 1,
      last_failure_reason = p_failure_reason,
      status = case
        when hi.attempt_count + 1 >= 2 then 'missed'
        else hi.status
      end
  where hi.id = p_habit_instance_id
  returning hi.id, hi.attempt_count, hi.status, hi.last_failure_reason
  into habit_instance_id, attempt_count, status, last_failure_reason;

  if status = 'missed' then
    update circle_members cm
    set current_streak = 0
    where cm.circle_id = v_circle_id
      and cm.user_id = v_user_id
    returning cm.current_streak into current_streak;
  else
    select cm.current_streak
    into current_streak
    from circle_members cm
    where cm.circle_id = v_circle_id
      and cm.user_id = v_user_id;
  end if;

  return next;
end;
$$;

revoke all on function public.complete_verified_solo_snap(uuid, text, jsonb, text) from public;
grant execute on function public.complete_verified_solo_snap(uuid, text, jsonb, text) to authenticated;

revoke all on function public.record_failed_solo_snap_attempt(uuid, text) from public;
grant execute on function public.record_failed_solo_snap_attempt(uuid, text) to authenticated;
