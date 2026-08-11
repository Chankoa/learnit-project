-- Run after LMS migrations.
-- Verifies learner state idempotence and owner-only RLS policies.

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'enrollments'
      and constraint_type = 'UNIQUE'
      and constraint_name = 'enrollments_user_id_course_id_key'
  ) then
    raise exception 'Missing unique enrollment constraint on (user_id, course_id)';
  end if;

  if not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'lesson_progress'
      and constraint_type = 'UNIQUE'
      and constraint_name = 'lesson_progress_user_id_lesson_id_key'
  ) then
    raise exception 'Missing unique lesson progress constraint on (user_id, lesson_id)';
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename in ('enrollments', 'lesson_progress')
      and roles = '{authenticated}'
      and (
        qual is distinct from '(user_id = auth.uid())'
        or with_check is distinct from '(user_id = auth.uid())'
      )
  ) then
    raise exception 'Learner state policies must stay scoped to user_id = auth.uid()';
  end if;
end;
$$;
