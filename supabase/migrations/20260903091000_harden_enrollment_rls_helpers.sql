create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.can_read_enrolled_published_course(target_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.courses
    join public.enrollments on enrollments.course_id = courses.id
    where courses.id = target_course_id
      and courses.status = 'published'
      and enrollments.user_id = (select auth.uid())
  )
$$;

create or replace function private.teacher_can_read_enrolled_learner(target_learner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.enrollments
    join public.courses on courses.id = enrollments.course_id
    where enrollments.user_id = target_learner_id
      and courses.teacher_id = (select auth.uid())
  )
$$;

create or replace function private.teacher_owns_course(target_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.courses
    where courses.id = target_course_id
      and courses.teacher_id = (select auth.uid())
  )
$$;

revoke all on function private.can_read_enrolled_published_course(uuid) from public, anon;
revoke all on function private.teacher_can_read_enrolled_learner(uuid) from public, anon;
revoke all on function private.teacher_owns_course(uuid) from public, anon;
grant execute on function private.can_read_enrolled_published_course(uuid) to authenticated;
grant execute on function private.teacher_can_read_enrolled_learner(uuid) to authenticated;
grant execute on function private.teacher_owns_course(uuid) to authenticated;

alter policy "Learners can read enrolled published courses"
on public.courses
using (
  public.current_profile_role() = 'learner'
  and private.can_read_enrolled_published_course(courses.id)
);

alter policy "Learners can read enrolled published course modules"
on public.course_modules
using (
  public.current_profile_role() = 'learner'
  and private.can_read_enrolled_published_course(course_modules.course_id)
);

alter policy "Learners can read enrolled published lessons"
on public.lessons
using (
  public.current_profile_role() = 'learner'
  and private.can_read_enrolled_published_course(lessons.course_id)
);

alter policy "Learners can read enrolled resources"
on public.resources
using (
  access = 'enrolled'
  and public.current_profile_role() = 'learner'
  and private.can_read_enrolled_published_course(resources.course_id)
);

alter policy "Learners can read enrolled resource files"
on storage.objects
using (
  bucket_id = 'resources'
  and public.current_profile_role() = 'learner'
  and exists (
    select 1
    from public.resources
    where resources.storage_path = storage.objects.name
      and resources.access = 'enrolled'
      and private.can_read_enrolled_published_course(resources.course_id)
  )
);

alter policy "Teachers can read enrolled learner profiles"
on public.profiles
using (
  profiles.role = 'learner'
  and public.current_profile_role() = 'teacher'
  and private.teacher_can_read_enrolled_learner(profiles.id)
);

alter policy "Teachers can read lesson progress for their courses"
on public.lesson_progress
using (
  public.current_profile_role() = 'teacher'
  and private.teacher_owns_course(lesson_progress.course_id)
);

drop function public.can_read_enrolled_published_course(uuid);
drop function public.teacher_can_read_enrolled_learner(uuid);
drop function public.teacher_owns_course(uuid);
