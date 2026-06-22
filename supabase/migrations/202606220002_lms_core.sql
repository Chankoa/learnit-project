do $$
begin
  create type public.course_level as enum ('beginner', 'intermediate', 'advanced');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.course_status as enum ('draft', 'published', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.course_visibility as enum ('public', 'private', 'unlisted');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.course_availability as enum ('complete', 'preview', 'coming-soon');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.lesson_type as enum ('video', 'reading', 'exercise', 'quiz', 'project');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.lesson_status as enum ('draft', 'published', 'locked');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.resource_type as enum ('article', 'video', 'download', 'template', 'exercise', 'link', 'tool');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.resource_access as enum ('free', 'enrolled', 'premium');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.enrollment_status as enum ('not-started', 'in-progress', 'completed');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.domains (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid not null references public.domains(id) on delete restrict,
  teacher_id uuid references public.profiles(id) on delete set null,
  slug text not null unique,
  title text not null,
  subtitle text,
  description text not null,
  level public.course_level not null default 'beginner',
  status public.course_status not null default 'draft',
  visibility public.course_visibility not null default 'private',
  availability public.course_availability not null default 'preview',
  cover_image text,
  duration_minutes integer,
  format text,
  tags text[] not null default '{}',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  duration_minutes integer,
  display_order integer not null default 0,
  status public.lesson_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, slug)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  module_id uuid not null references public.course_modules(id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text,
  type public.lesson_type not null default 'reading',
  status public.lesson_status not null default 'draft',
  duration_minutes integer,
  content_path text,
  video_url text,
  objectives text[] not null default '{}',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type public.resource_type not null,
  href text not null,
  description text,
  file_name text,
  access public.resource_access not null default 'free',
  tags text[] not null default '{}',
  course_id uuid references public.courses(id) on delete cascade,
  module_id uuid references public.course_modules(id) on delete set null,
  lesson_id uuid references public.lessons(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status public.enrollment_status not null default 'not-started',
  current_lesson_id uuid references public.lessons(id) on delete set null,
  learning_time_minutes integer not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  last_accessed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  learning_time_minutes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, resource_id)
);

create index if not exists courses_teacher_id_idx on public.courses(teacher_id);
create index if not exists course_modules_course_id_idx on public.course_modules(course_id);
create index if not exists lessons_course_id_idx on public.lessons(course_id);
create index if not exists lessons_module_id_idx on public.lessons(module_id);
create index if not exists resources_course_id_idx on public.resources(course_id);
create index if not exists enrollments_user_id_idx on public.enrollments(user_id);
create index if not exists lesson_progress_user_id_idx on public.lesson_progress(user_id);
create index if not exists notes_user_id_idx on public.notes(user_id);
create index if not exists favorites_user_id_idx on public.favorites(user_id);

drop trigger if exists set_domains_updated_at on public.domains;
create trigger set_domains_updated_at before update on public.domains for each row execute function public.set_updated_at();

drop trigger if exists set_courses_updated_at on public.courses;
create trigger set_courses_updated_at before update on public.courses for each row execute function public.set_updated_at();

drop trigger if exists set_course_modules_updated_at on public.course_modules;
create trigger set_course_modules_updated_at before update on public.course_modules for each row execute function public.set_updated_at();

drop trigger if exists set_lessons_updated_at on public.lessons;
create trigger set_lessons_updated_at before update on public.lessons for each row execute function public.set_updated_at();

drop trigger if exists set_resources_updated_at on public.resources;
create trigger set_resources_updated_at before update on public.resources for each row execute function public.set_updated_at();

drop trigger if exists set_enrollments_updated_at on public.enrollments;
create trigger set_enrollments_updated_at before update on public.enrollments for each row execute function public.set_updated_at();

drop trigger if exists set_lesson_progress_updated_at on public.lesson_progress;
create trigger set_lesson_progress_updated_at before update on public.lesson_progress for each row execute function public.set_updated_at();

drop trigger if exists set_notes_updated_at on public.notes;
create trigger set_notes_updated_at before update on public.notes for each row execute function public.set_updated_at();

alter table public.domains enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.resources enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.notes enable row level security;
alter table public.favorites enable row level security;

drop policy if exists "Published domains are public" on public.domains;
create policy "Published domains are public" on public.domains for select using (status = 'active');

drop policy if exists "Published courses are public" on public.courses;
create policy "Published courses are public" on public.courses for select using (status = 'published' and visibility = 'public');

drop policy if exists "Teachers manage their courses" on public.courses;
create policy "Teachers manage their courses" on public.courses for all to authenticated using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

drop policy if exists "Admins manage courses" on public.courses;
create policy "Admins manage courses" on public.courses for all to authenticated using (public.current_profile_role() = 'admin') with check (public.current_profile_role() = 'admin');

drop policy if exists "Public modules follow published courses" on public.course_modules;
create policy "Public modules follow published courses" on public.course_modules for select using (
  exists (select 1 from public.courses where courses.id = course_modules.course_id and courses.status = 'published' and courses.visibility = 'public')
);

drop policy if exists "Public lessons follow published courses" on public.lessons;
create policy "Public lessons follow published courses" on public.lessons for select using (
  exists (select 1 from public.courses where courses.id = lessons.course_id and courses.status = 'published' and courses.visibility = 'public')
);

drop policy if exists "Public resources follow published courses" on public.resources;
create policy "Public resources follow published courses" on public.resources for select using (
  exists (select 1 from public.courses where courses.id = resources.course_id and courses.status = 'published' and courses.visibility = 'public')
);

drop policy if exists "Learners manage own enrollments" on public.enrollments;
create policy "Learners manage own enrollments" on public.enrollments for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Learners manage own lesson progress" on public.lesson_progress;
create policy "Learners manage own lesson progress" on public.lesson_progress for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Learners manage own notes" on public.notes;
create policy "Learners manage own notes" on public.notes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Learners manage own favorites" on public.favorites;
create policy "Learners manage own favorites" on public.favorites for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values
  ('course-covers', 'course-covers', true),
  ('resources', 'resources', false),
  ('uploads', 'uploads', false)
on conflict (id) do nothing;
