-- Learning remains a pedagogical enrollment relation, independent of profiles.role.
-- Editorial Teacher/Admin policies are intentionally preserved.

-- A direct enrollment is available only from a published public course. Existing
-- enrollments remain user-owned so private and unlisted access can continue
-- through the established relationship.
drop policy if exists "Learners manage own enrollments" on public.enrollments;

create policy "Users read their own enrollments"
on public.enrollments
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Users update their own enrollments"
on public.enrollments
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Users remove their own enrollments"
on public.enrollments
for delete
to authenticated
using (user_id = (select auth.uid()));

create policy "Users enroll themselves in published public courses"
on public.enrollments
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.courses
    where courses.id = enrollments.course_id
      and courses.status = 'published'
      and courses.visibility = 'public'
  )
);

-- Published enrolled content is available to every authenticated enrollment,
-- regardless of the compatibility profile role.
drop policy if exists "Learners can read enrolled published courses" on public.courses;
drop policy if exists "Users can read enrolled published courses" on public.courses;
create policy "Users can read enrolled published courses"
on public.courses
for select
to authenticated
using (private.can_read_enrolled_published_course(courses.id));

drop policy if exists "Learners can read enrolled published course modules" on public.course_modules;
drop policy if exists "Users can read enrolled published course modules" on public.course_modules;
create policy "Users can read enrolled published course modules"
on public.course_modules
for select
to authenticated
using (private.can_read_enrolled_published_course(course_modules.course_id));

drop policy if exists "Learners can read enrolled published lessons" on public.lessons;
drop policy if exists "Users can read enrolled published lessons" on public.lessons;
create policy "Users can read enrolled published lessons"
on public.lessons
for select
to authenticated
using (private.can_read_enrolled_published_course(lessons.course_id));

drop policy if exists "Learners can read enrolled resources" on public.resources;
drop policy if exists "Users can read enrolled resources" on public.resources;
create policy "Users can read enrolled resources"
on public.resources
for select
to authenticated
using (
  access = 'enrolled'
  and private.can_read_enrolled_published_course(resources.course_id)
);

drop policy if exists "Learners can read enrolled resource files" on storage.objects;
drop policy if exists "Users can read enrolled resource files" on storage.objects;
create policy "Users can read enrolled resource files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'resources'
  and exists (
    select 1
    from public.resources
    where resources.storage_path = storage.objects.name
      and resources.access = 'enrolled'
      and private.can_read_enrolled_published_course(resources.course_id)
  )
);

-- Source material is always scoped to a ready source on an enrolled published
-- course. Knowing an object path or source ID does not grant access.
drop policy if exists "Learners can read enrolled ready course sources" on public.course_sources;
drop policy if exists "Users can read enrolled ready course sources" on public.course_sources;
create policy "Users can read enrolled ready course sources"
on public.course_sources
for select
to authenticated
using (
  extraction_status = 'ready'
  and course_id is not null
  and private.can_read_enrolled_published_course(course_id)
);

drop policy if exists "Learners can read enrolled course source files" on storage.objects;
drop policy if exists "Users can read enrolled course source files" on storage.objects;
create policy "Users can read enrolled course source files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'course-sources'
  and exists (
    select 1
    from public.course_sources
    where course_sources.storage_bucket = storage.objects.bucket_id
      and course_sources.storage_path = storage.objects.name
      and course_sources.extraction_status = 'ready'
      and private.can_read_enrolled_published_course(course_sources.course_id)
  )
);

-- Learner Forge prompt types represent learning intent rather than a profile
-- identity. Teacher policies for teacher-studio prompts remain unchanged.
drop policy if exists "Teachers can read their ai generation metadata" on public.ai_generations;
create policy "Teachers can read their authoring ai generation metadata"
on public.ai_generations
for select
to authenticated
using (
  user_id = (select auth.uid())
  and public.current_profile_role() = 'teacher'
  and prompt_type not in (
    'learner_explain',
    'learner_clarify',
    'learner_rephrase',
    'learner_example',
    'learner_question',
    'learner_freeform'
  )
);

drop policy if exists "Teachers can insert their ai generation metadata" on public.ai_generations;
create policy "Teachers can insert their authoring ai generation metadata"
on public.ai_generations
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and public.current_profile_role() = 'teacher'
  and prompt_type not in (
    'learner_explain',
    'learner_clarify',
    'learner_rephrase',
    'learner_example',
    'learner_question',
    'learner_freeform'
  )
);

drop policy if exists "Learners can insert own ai generation metadata" on public.ai_generations;
drop policy if exists "Users can insert own learning ai generation metadata" on public.ai_generations;
create policy "Users can insert own learning ai generation metadata"
on public.ai_generations
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and prompt_type in (
    'learner_explain',
    'learner_clarify',
    'learner_rephrase',
    'learner_example',
    'learner_question',
    'learner_freeform'
  )
  and context_type = 'lesson'
  and context_id is not null
  and exists (
    select 1
    from public.lessons
    where lessons.id = ai_generations.context_id
      and private.can_read_enrolled_published_course(lessons.course_id)
  )
);

drop policy if exists "Learners can read own ai generation metadata" on public.ai_generations;
drop policy if exists "Users can read own learning ai generation metadata" on public.ai_generations;
create policy "Users can read own learning ai generation metadata"
on public.ai_generations
for select
to authenticated
using (
  user_id = (select auth.uid())
  and prompt_type in (
    'learner_explain',
    'learner_clarify',
    'learner_rephrase',
    'learner_example',
    'learner_question',
    'learner_freeform'
  )
  and context_type = 'lesson'
  and context_id is not null
  and exists (
    select 1
    from public.lessons
    where lessons.id = ai_generations.context_id
      and private.can_read_enrolled_published_course(lessons.course_id)
  )
);

drop policy if exists "Learners can create enrolled ai generation source refs" on public.ai_generation_sources;
drop policy if exists "Users can create enrolled ai generation source refs" on public.ai_generation_sources;
create policy "Users can create enrolled ai generation source refs"
on public.ai_generation_sources
for insert
to authenticated
with check (
  exists (
    select 1
    from public.ai_generations
    join public.lessons on lessons.id = ai_generations.context_id
    where ai_generations.id = ai_generation_sources.generation_id
      and ai_generations.user_id = (select auth.uid())
      and ai_generations.prompt_type in (
        'learner_explain',
        'learner_clarify',
        'learner_rephrase',
        'learner_example',
        'learner_question',
        'learner_freeform'
      )
      and ai_generations.context_type = 'lesson'
      and private.can_read_enrolled_published_course(lessons.course_id)
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
drop policy if exists "Users can read enrolled ai generation source refs" on public.ai_generation_sources;
create policy "Users can read enrolled ai generation source refs"
on public.ai_generation_sources
for select
to authenticated
using (
  exists (
    select 1
    from public.ai_generations
    join public.lessons on lessons.id = ai_generations.context_id
    where ai_generations.id = ai_generation_sources.generation_id
      and ai_generations.user_id = (select auth.uid())
      and ai_generations.prompt_type in (
        'learner_explain',
        'learner_clarify',
        'learner_rephrase',
        'learner_example',
        'learner_question',
        'learner_freeform'
      )
      and ai_generations.context_type = 'lesson'
      and private.can_read_enrolled_published_course(lessons.course_id)
  )
  and exists (
    select 1
    from public.course_sources
    where course_sources.id = ai_generation_sources.source_id
      and course_sources.extraction_status = 'ready'
      and private.can_read_enrolled_published_course(course_sources.course_id)
  )
);
