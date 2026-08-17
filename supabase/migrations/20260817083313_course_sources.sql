create table if not exists public.course_sources (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  type text not null check (type in ('pdf', 'text', 'markdown', 'docx')),
  file_name text not null,
  storage_bucket text not null default 'course-sources',
  storage_path text not null unique,
  mime_type text not null,
  file_size integer not null check (file_size > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_course_sources_updated_at on public.course_sources;
create trigger set_course_sources_updated_at
before update on public.course_sources
for each row execute function public.set_updated_at();

alter table public.course_sources enable row level security;

create index if not exists course_sources_teacher_idx
  on public.course_sources(teacher_id, created_at desc);

create index if not exists course_sources_course_idx
  on public.course_sources(course_id, created_at desc)
  where course_id is not null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'course-sources',
  'course-sources',
  false,
  10485760,
  array[
    'application/pdf',
    'text/plain',
    'text/markdown'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Teachers can read their course sources" on public.course_sources;
drop policy if exists "Teachers can create their course sources" on public.course_sources;
drop policy if exists "Teachers can update their course sources" on public.course_sources;
drop policy if exists "Teachers can delete their course sources" on public.course_sources;

create policy "Teachers can read their course sources"
on public.course_sources
for select
to authenticated
using (
  teacher_id = (select auth.uid())
  and public.current_profile_role() = 'teacher'
);

create policy "Teachers can create their course sources"
on public.course_sources
for insert
to authenticated
with check (
  teacher_id = (select auth.uid())
  and public.current_profile_role() = 'teacher'
  and (
    course_id is null
    or exists (
      select 1
      from public.courses
      where courses.id = course_sources.course_id
        and courses.teacher_id = (select auth.uid())
    )
  )
);

create policy "Teachers can update their course sources"
on public.course_sources
for update
to authenticated
using (
  teacher_id = (select auth.uid())
  and public.current_profile_role() = 'teacher'
)
with check (
  teacher_id = (select auth.uid())
  and public.current_profile_role() = 'teacher'
  and (
    course_id is null
    or exists (
      select 1
      from public.courses
      where courses.id = course_sources.course_id
        and courses.teacher_id = (select auth.uid())
    )
  )
);

create policy "Teachers can delete their course sources"
on public.course_sources
for delete
to authenticated
using (
  teacher_id = (select auth.uid())
  and public.current_profile_role() = 'teacher'
);

grant select, insert, update, delete on public.course_sources to authenticated;

drop policy if exists "Teachers can read their source files" on storage.objects;
drop policy if exists "Teachers can upload source files" on storage.objects;
drop policy if exists "Teachers can update their source files" on storage.objects;
drop policy if exists "Teachers can delete their source files" on storage.objects;

create policy "Teachers can read their source files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'course-sources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and public.current_profile_role() = 'teacher'
);

create policy "Teachers can upload source files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'course-sources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and public.current_profile_role() = 'teacher'
);

create policy "Teachers can update their source files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'course-sources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and public.current_profile_role() = 'teacher'
)
with check (
  bucket_id = 'course-sources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and public.current_profile_role() = 'teacher'
);

create policy "Teachers can delete their source files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'course-sources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and public.current_profile_role() = 'teacher'
);

create table if not exists public.ai_generation_sources (
  generation_id uuid not null references public.ai_generations(id) on delete cascade,
  source_id uuid not null references public.course_sources(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (generation_id, source_id)
);

alter table public.ai_generation_sources enable row level security;

drop policy if exists "Teachers can read their ai generation source refs" on public.ai_generation_sources;
drop policy if exists "Teachers can create their ai generation source refs" on public.ai_generation_sources;

create policy "Teachers can read their ai generation source refs"
on public.ai_generation_sources
for select
to authenticated
using (
  exists (
    select 1
    from public.ai_generations
    where ai_generations.id = ai_generation_sources.generation_id
      and ai_generations.user_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.course_sources
    where course_sources.id = ai_generation_sources.source_id
      and course_sources.teacher_id = (select auth.uid())
  )
);

create policy "Teachers can create their ai generation source refs"
on public.ai_generation_sources
for insert
to authenticated
with check (
  exists (
    select 1
    from public.ai_generations
    where ai_generations.id = ai_generation_sources.generation_id
      and ai_generations.user_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.course_sources
    where course_sources.id = ai_generation_sources.source_id
      and course_sources.teacher_id = (select auth.uid())
  )
);

grant select, insert on public.ai_generation_sources to authenticated;
