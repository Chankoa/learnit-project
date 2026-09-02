alter table public.ai_generations
  drop constraint if exists ai_generations_prompt_type_check;

alter table public.ai_generations
  add constraint ai_generations_prompt_type_check check (
    prompt_type in (
      'course_structure',
      'course_analysis',
      'course_improvement',
      'course_import',
      'lesson_generate',
      'lesson_improve',
      'lesson_expand',
      'lesson_examples',
      'lesson_exercise',
      'lesson_analyze',
      'lesson_outline',
      'lesson_plan',
      'lesson_intro',
      'lesson_summary',
      'lesson_simplify',
      'learner_explain',
      'learner_clarify',
      'learner_rephrase',
      'learner_example',
      'learner_question',
      'learner_freeform'
    )
  );

drop policy if exists "Learners can read enrolled ready course sources" on public.course_sources;
create policy "Learners can read enrolled ready course sources"
on public.course_sources
for select
to authenticated
using (
  extraction_status = 'ready'
  and course_id is not null
  and public.current_profile_role() = 'learner'
  and exists (
    select 1
    from public.enrollments
    where enrollments.course_id = course_sources.course_id
      and enrollments.user_id = (select auth.uid())
  )
);

drop policy if exists "Learners can read enrolled course source files" on storage.objects;
create policy "Learners can read enrolled course source files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'course-sources'
  and public.current_profile_role() = 'learner'
  and exists (
    select 1
    from public.course_sources
    join public.enrollments on enrollments.course_id = course_sources.course_id
    where course_sources.storage_bucket = storage.objects.bucket_id
      and course_sources.storage_path = storage.objects.name
      and course_sources.extraction_status = 'ready'
      and enrollments.user_id = (select auth.uid())
  )
);

drop policy if exists "Learners can insert own ai generation metadata" on public.ai_generations;
create policy "Learners can insert own ai generation metadata"
on public.ai_generations
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and public.current_profile_role() = 'learner'
);

drop policy if exists "Learners can read own ai generation metadata" on public.ai_generations;
create policy "Learners can read own ai generation metadata"
on public.ai_generations
for select
to authenticated
using (
  user_id = (select auth.uid())
  and public.current_profile_role() = 'learner'
);

drop policy if exists "Learners can create enrolled ai generation source refs" on public.ai_generation_sources;
create policy "Learners can create enrolled ai generation source refs"
on public.ai_generation_sources
for insert
to authenticated
with check (
  public.current_profile_role() = 'learner'
  and exists (
    select 1
    from public.ai_generations
    where ai_generations.id = ai_generation_sources.generation_id
      and ai_generations.user_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.course_sources
    join public.enrollments on enrollments.course_id = course_sources.course_id
    where course_sources.id = ai_generation_sources.source_id
      and course_sources.extraction_status = 'ready'
      and enrollments.user_id = (select auth.uid())
  )
);

drop policy if exists "Learners can read enrolled ai generation source refs" on public.ai_generation_sources;
create policy "Learners can read enrolled ai generation source refs"
on public.ai_generation_sources
for select
to authenticated
using (
  public.current_profile_role() = 'learner'
  and exists (
    select 1
    from public.ai_generations
    where ai_generations.id = ai_generation_sources.generation_id
      and ai_generations.user_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.course_sources
    join public.enrollments on enrollments.course_id = course_sources.course_id
    where course_sources.id = ai_generation_sources.source_id
      and enrollments.user_id = (select auth.uid())
  )
);
