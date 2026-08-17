create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  context_type text not null check (context_type in ('teacher_studio', 'course', 'lesson')),
  context_id uuid,
  prompt_type text not null check (
    prompt_type in (
      'course_structure',
      'course_import',
      'lesson_plan',
      'lesson_intro',
      'lesson_summary',
      'lesson_simplify'
    )
  ),
  provider text not null,
  model text not null,
  status text not null check (status in ('success', 'error', 'invalid_output', 'rate_limited')),
  duration_ms integer,
  error_code text,
  created_at timestamptz not null default now()
);

alter table public.ai_generations enable row level security;

create index if not exists ai_generations_user_created_idx
  on public.ai_generations(user_id, created_at desc);

create index if not exists ai_generations_context_idx
  on public.ai_generations(context_type, context_id)
  where context_id is not null;

drop policy if exists "Teachers can read their ai generation metadata" on public.ai_generations;
drop policy if exists "Teachers can insert their ai generation metadata" on public.ai_generations;

create policy "Teachers can read their ai generation metadata"
on public.ai_generations
for select
to authenticated
using (
  user_id = (select auth.uid())
  and public.current_profile_role() = 'teacher'
);

create policy "Teachers can insert their ai generation metadata"
on public.ai_generations
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and public.current_profile_role() = 'teacher'
);

grant select, insert on public.ai_generations to authenticated;
