alter table public.lessons
  add column if not exists content text;

drop policy if exists "Teachers manage their courses" on public.courses;
drop policy if exists "Teachers can read their courses" on public.courses;
drop policy if exists "Teachers can create their courses" on public.courses;
drop policy if exists "Teachers can update their courses" on public.courses;
drop policy if exists "Teachers can delete draft courses" on public.courses;
drop policy if exists "Teachers can read their course modules" on public.course_modules;
drop policy if exists "Teachers can create their course modules" on public.course_modules;
drop policy if exists "Teachers can update their course modules" on public.course_modules;
drop policy if exists "Teachers can delete empty course modules" on public.course_modules;
drop policy if exists "Teachers can read their lessons" on public.lessons;
drop policy if exists "Teachers can create their lessons" on public.lessons;
drop policy if exists "Teachers can update their lessons" on public.lessons;
drop policy if exists "Teachers can delete draft lessons" on public.lessons;

create policy "Teachers can read their courses"
on public.courses
for select
to authenticated
using (
  teacher_id = (select auth.uid())
  and public.current_profile_role() = 'teacher'
);

create policy "Teachers can create their courses"
on public.courses
for insert
to authenticated
with check (
  teacher_id = (select auth.uid())
  and public.current_profile_role() = 'teacher'
);

create policy "Teachers can update their courses"
on public.courses
for update
to authenticated
using (
  teacher_id = (select auth.uid())
  and public.current_profile_role() = 'teacher'
)
with check (
  teacher_id = (select auth.uid())
  and public.current_profile_role() = 'teacher'
);

create policy "Teachers can delete draft courses"
on public.courses
for delete
to authenticated
using (
  teacher_id = (select auth.uid())
  and public.current_profile_role() = 'teacher'
  and status = 'draft'
);

create policy "Teachers can read their course modules"
on public.course_modules
for select
to authenticated
using (
  exists (
    select 1
    from public.courses
    where courses.id = course_modules.course_id
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
);

create policy "Teachers can create their course modules"
on public.course_modules
for insert
to authenticated
with check (
  exists (
    select 1
    from public.courses
    where courses.id = course_modules.course_id
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
);

create policy "Teachers can update their course modules"
on public.course_modules
for update
to authenticated
using (
  exists (
    select 1
    from public.courses
    where courses.id = course_modules.course_id
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
)
with check (
  exists (
    select 1
    from public.courses
    where courses.id = course_modules.course_id
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
);

create policy "Teachers can delete empty course modules"
on public.course_modules
for delete
to authenticated
using (
  exists (
    select 1
    from public.courses
    where courses.id = course_modules.course_id
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
  and not exists (
    select 1
    from public.lessons
    where lessons.module_id = course_modules.id
  )
);

create policy "Teachers can read their lessons"
on public.lessons
for select
to authenticated
using (
  exists (
    select 1
    from public.courses
    where courses.id = lessons.course_id
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
);

create policy "Teachers can create their lessons"
on public.lessons
for insert
to authenticated
with check (
  exists (
    select 1
    from public.courses
    where courses.id = lessons.course_id
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
  and exists (
    select 1
    from public.course_modules
    where course_modules.id = lessons.module_id
      and course_modules.course_id = lessons.course_id
  )
);

create policy "Teachers can update their lessons"
on public.lessons
for update
to authenticated
using (
  exists (
    select 1
    from public.courses
    where courses.id = lessons.course_id
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
)
with check (
  exists (
    select 1
    from public.courses
    where courses.id = lessons.course_id
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
  and exists (
    select 1
    from public.course_modules
    where course_modules.id = lessons.module_id
      and course_modules.course_id = lessons.course_id
  )
);

create policy "Teachers can delete draft lessons"
on public.lessons
for delete
to authenticated
using (
  exists (
    select 1
    from public.courses
    where courses.id = lessons.course_id
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
  and status = 'draft'
);
