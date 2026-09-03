-- Run after 20260903100000_course_memberships_foundation.sql.
-- Verifies the additive U2 foundation without changing user/course data.

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'course_memberships'
      and constraint_type = 'UNIQUE'
      and constraint_name = 'course_memberships_course_id_user_id_key'
  ) then
    raise exception 'Missing unique course membership constraint';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'course_memberships'
      and policyname = 'Users can read their course memberships'
      and cmd = 'SELECT'
  ) then
    raise exception 'Missing own-membership read policy';
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'course_memberships'
      and cmd in ('INSERT', 'UPDATE', 'DELETE')
  ) then
    raise exception 'Course membership mutations must not be client-authorized in U2';
  end if;

  if to_regprocedure('private.has_course_capability(uuid,text)') is null then
    raise exception 'Missing private.has_course_capability resolver';
  end if;

  if pg_get_functiondef('private.has_course_capability(uuid,text)'::regprocedure)
    not like '%security definer%'
  then
    raise exception 'Capability resolver must be security definer';
  end if;
end;
$$;