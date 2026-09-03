create index if not exists enrollments_course_user_idx
  on public.enrollments(course_id, user_id);

create index if not exists lesson_progress_course_user_completed_idx
  on public.lesson_progress(course_id, user_id, completed);

create or replace function public.can_read_enrolled_published_course(target_course_id uuid)
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

create or replace function public.teacher_can_read_enrolled_learner(target_learner_id uuid)
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

create or replace function public.teacher_owns_course(target_course_id uuid)
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

revoke all on function public.can_read_enrolled_published_course(uuid) from public;
revoke all on function public.teacher_can_read_enrolled_learner(uuid) from public;
revoke all on function public.teacher_owns_course(uuid) from public;
grant execute on function public.can_read_enrolled_published_course(uuid) to authenticated;
grant execute on function public.teacher_can_read_enrolled_learner(uuid) to authenticated;
grant execute on function public.teacher_owns_course(uuid) to authenticated;

drop policy if exists "Learners can read enrolled published courses" on public.courses;
create policy "Learners can read enrolled published courses"
on public.courses
for select
to authenticated
using (
  public.current_profile_role() = 'learner'
  and public.can_read_enrolled_published_course(courses.id)
);

drop policy if exists "Learners can read enrolled published course modules" on public.course_modules;
create policy "Learners can read enrolled published course modules"
on public.course_modules
for select
to authenticated
using (
  public.current_profile_role() = 'learner'
  and public.can_read_enrolled_published_course(course_modules.course_id)
);

drop policy if exists "Learners can read enrolled published lessons" on public.lessons;
create policy "Learners can read enrolled published lessons"
on public.lessons
for select
to authenticated
using (
  public.current_profile_role() = 'learner'
  and public.can_read_enrolled_published_course(lessons.course_id)
);

drop policy if exists "Learners can read enrolled resources" on public.resources;
create policy "Learners can read enrolled resources"
on public.resources
for select
to authenticated
using (
  access = 'enrolled'
  and public.current_profile_role() = 'learner'
  and public.can_read_enrolled_published_course(resources.course_id)
);

drop policy if exists "Learners can read enrolled resource files" on storage.objects;
create policy "Learners can read enrolled resource files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'resources'
  and public.current_profile_role() = 'learner'
  and exists (
    select 1
    from public.resources
    where resources.storage_path = storage.objects.name
      and resources.access = 'enrolled'
      and public.can_read_enrolled_published_course(resources.course_id)
  )
);

drop policy if exists "Teachers can read enrolled learner profiles" on public.profiles;
create policy "Teachers can read enrolled learner profiles"
on public.profiles
for select
to authenticated
using (
  profiles.role = 'learner'
  and public.current_profile_role() = 'teacher'
  and public.teacher_can_read_enrolled_learner(profiles.id)
);

drop policy if exists "Teachers can read lesson progress for their courses" on public.lesson_progress;
create policy "Teachers can read lesson progress for their courses"
on public.lesson_progress
for select
to authenticated
using (
  public.current_profile_role() = 'teacher'
  and public.teacher_owns_course(lesson_progress.course_id)
);
