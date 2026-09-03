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

-- Run after 20260903110000_role_neutral_learning_access.sql.
-- The enrollment relation, not profiles.role, authorizes learning reads.
do $$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and policyname in (
        'Users can read enrolled published courses',
        'Users can read enrolled published course modules',
        'Users can read enrolled published lessons',
        'Users can read enrolled resources',
        'Users can read enrolled ready course sources',
        'Users can read enrolled ai generation source refs'
      )
      and coalesce(qual, '') like '%current_profile_role()%learner%'
  ) then
    raise exception 'Enrolled learning policies must not require the learner profile role';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'enrollments'
      and policyname = 'Users enroll themselves in published public courses'
      and cmd = 'INSERT'
      and coalesce(with_check, '') like '%courses.status = ''published''%'
      and coalesce(with_check, '') like '%courses.visibility = ''public''%'
  ) then
    raise exception 'Enrollment creation must require a published public course';
  end if;
end;
$$;
