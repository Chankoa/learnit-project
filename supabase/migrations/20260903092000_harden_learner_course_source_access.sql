drop policy if exists "Learners can read enrolled ready course sources" on public.course_sources;
create policy "Learners can read enrolled ready course sources"
on public.course_sources
for select
to authenticated
using (
  extraction_status = 'ready'
  and course_id is not null
  and public.current_profile_role() = 'learner'
  and private.can_read_enrolled_published_course(course_id)
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
    where course_sources.storage_bucket = storage.objects.bucket_id
      and course_sources.storage_path = storage.objects.name
      and course_sources.extraction_status = 'ready'
      and private.can_read_enrolled_published_course(course_sources.course_id)
  )
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
    where course_sources.id = ai_generation_sources.source_id
      and course_sources.extraction_status = 'ready'
      and private.can_read_enrolled_published_course(course_sources.course_id)
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
    where course_sources.id = ai_generation_sources.source_id
      and course_sources.extraction_status = 'ready'
      and private.can_read_enrolled_published_course(course_sources.course_id)
  )
);