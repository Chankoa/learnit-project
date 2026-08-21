drop policy if exists "Teachers can read enrollments for their courses" on public.enrollments;

create policy "Teachers can read enrollments for their courses"
on public.enrollments
for select
to authenticated
using (
  exists (
    select 1
    from public.courses
    where courses.id = enrollments.course_id
      and courses.teacher_id = (select auth.uid())
  )
);