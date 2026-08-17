alter table public.resources
  add column if not exists storage_bucket text,
  add column if not exists storage_path text,
  add column if not exists mime_type text,
  add column if not exists file_size integer,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.courses
  add column if not exists cover_storage_path text,
  add column if not exists cover_mime_type text,
  add column if not exists cover_file_size integer;

create index if not exists resources_lesson_id_idx on public.resources(lesson_id);
create unique index if not exists resources_storage_path_key
  on public.resources(storage_path)
  where storage_path is not null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'resources',
    'resources',
    false,
    10485760,
    array[
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'text/plain',
      'application/zip'
    ]
  ),
  (
    'course-covers',
    'course-covers',
    true,
    5242880,
    array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ]
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public resources follow published courses" on public.resources;
drop policy if exists "Public free resources follow published courses" on public.resources;
drop policy if exists "Learners can read enrolled resources" on public.resources;
drop policy if exists "Teachers can read their resources" on public.resources;
drop policy if exists "Teachers can create resources for their courses" on public.resources;
drop policy if exists "Teachers can update their resources" on public.resources;
drop policy if exists "Teachers can delete their resources" on public.resources;

create policy "Public free resources follow published courses"
on public.resources
for select
to anon, authenticated
using (
  access = 'free'
  and exists (
    select 1
    from public.courses
    where courses.id = resources.course_id
      and courses.status = 'published'
      and courses.visibility = 'public'
  )
);

create policy "Learners can read enrolled resources"
on public.resources
for select
to authenticated
using (
  access = 'enrolled'
  and exists (
    select 1
    from public.courses
    where courses.id = resources.course_id
      and courses.status = 'published'
      and courses.visibility = 'public'
  )
  and exists (
    select 1
    from public.enrollments
    where enrollments.course_id = resources.course_id
      and enrollments.user_id = (select auth.uid())
  )
);

create policy "Teachers can read their resources"
on public.resources
for select
to authenticated
using (
  exists (
    select 1
    from public.courses
    where courses.id = resources.course_id
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
);

create policy "Teachers can create resources for their courses"
on public.resources
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.courses
    where courses.id = resources.course_id
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
  and (
    lesson_id is null
    or exists (
      select 1
      from public.lessons
      where lessons.id = resources.lesson_id
        and lessons.course_id = resources.course_id
    )
  )
  and (
    module_id is null
    or exists (
      select 1
      from public.course_modules
      where course_modules.id = resources.module_id
        and course_modules.course_id = resources.course_id
    )
  )
);

create policy "Teachers can update their resources"
on public.resources
for update
to authenticated
using (
  exists (
    select 1
    from public.courses
    where courses.id = resources.course_id
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
)
with check (
  exists (
    select 1
    from public.courses
    where courses.id = resources.course_id
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
  and (
    lesson_id is null
    or exists (
      select 1
      from public.lessons
      where lessons.id = resources.lesson_id
        and lessons.course_id = resources.course_id
    )
  )
  and (
    module_id is null
    or exists (
      select 1
      from public.course_modules
      where course_modules.id = resources.module_id
        and course_modules.course_id = resources.course_id
    )
  )
);

create policy "Teachers can delete their resources"
on public.resources
for delete
to authenticated
using (
  exists (
    select 1
    from public.courses
    where courses.id = resources.course_id
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
);

grant select on public.resources to anon;
grant select, insert, update, delete on public.resources to authenticated;

drop policy if exists "Public free resource files are readable" on storage.objects;
drop policy if exists "Learners can read enrolled resource files" on storage.objects;
drop policy if exists "Teachers can read their resource files" on storage.objects;
drop policy if exists "Teachers can upload resource files" on storage.objects;
drop policy if exists "Teachers can update their resource files" on storage.objects;
drop policy if exists "Teachers can delete their resource files" on storage.objects;
drop policy if exists "Teachers can read their course covers" on storage.objects;
drop policy if exists "Teachers can upload course covers" on storage.objects;
drop policy if exists "Teachers can update their course covers" on storage.objects;
drop policy if exists "Teachers can delete their course covers" on storage.objects;

create policy "Public free resource files are readable"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'resources'
  and exists (
    select 1
    from public.resources
    join public.courses on courses.id = resources.course_id
    where resources.storage_path = storage.objects.name
      and resources.access = 'free'
      and courses.status = 'published'
      and courses.visibility = 'public'
  )
);

create policy "Learners can read enrolled resource files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'resources'
  and exists (
    select 1
    from public.resources
    join public.courses on courses.id = resources.course_id
    join public.enrollments on enrollments.course_id = resources.course_id
    where resources.storage_path = storage.objects.name
      and resources.access = 'enrolled'
      and courses.status = 'published'
      and courses.visibility = 'public'
      and enrollments.user_id = (select auth.uid())
  )
);

create policy "Teachers can read their resource files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'resources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.courses
    where courses.id::text = (storage.foldername(name))[2]
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
);

create policy "Teachers can upload resource files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'resources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.courses
    where courses.id::text = (storage.foldername(name))[2]
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
);

create policy "Teachers can update their resource files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'resources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.courses
    where courses.id::text = (storage.foldername(name))[2]
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
)
with check (
  bucket_id = 'resources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.courses
    where courses.id::text = (storage.foldername(name))[2]
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
);

create policy "Teachers can delete their resource files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'resources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.courses
    where courses.id::text = (storage.foldername(name))[2]
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
);

create policy "Teachers can read their course covers"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'course-covers'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.courses
    where courses.id::text = (storage.foldername(name))[2]
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
);

create policy "Teachers can upload course covers"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'course-covers'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.courses
    where courses.id::text = (storage.foldername(name))[2]
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
);

create policy "Teachers can update their course covers"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'course-covers'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.courses
    where courses.id::text = (storage.foldername(name))[2]
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
)
with check (
  bucket_id = 'course-covers'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.courses
    where courses.id::text = (storage.foldername(name))[2]
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
);

create policy "Teachers can delete their course covers"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'course-covers'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.courses
    where courses.id::text = (storage.foldername(name))[2]
      and courses.teacher_id = (select auth.uid())
      and public.current_profile_role() = 'teacher'
  )
);
