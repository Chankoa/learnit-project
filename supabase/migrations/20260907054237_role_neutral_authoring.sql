-- U4.2: active accounts create; persisted owners author. No learning/admin policy changes.
-- Existing teacher_id remains authoritative until collaborative mutations are implemented.
create or replace function private.is_active_account()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles
    where id = (select auth.uid()) and status = 'active');
$$;
revoke all on function private.is_active_account() from public, anon;
grant execute on function private.is_active_account() to authenticated;

-- Internal trigger only: course and owner membership are committed atomically.
create or replace function private.sync_course_owner_membership()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if TG_OP = 'UPDATE' and old.teacher_id is distinct from new.teacher_id then
    update public.course_memberships set status = 'revoked'
      where course_id = new.id and user_id = old.teacher_id and role = 'owner';
  end if;
  if new.teacher_id is not null then
    insert into public.course_memberships (course_id, user_id, role, status, accepted_at)
    values (new.id, new.teacher_id, 'owner', 'active', now())
    on conflict (course_id, user_id) do update
      set role = 'owner', status = 'active', accepted_at = coalesce(course_memberships.accepted_at, now());
  end if;
  return new;
end;
$$;
revoke all on function private.sync_course_owner_membership() from public, anon, authenticated;
drop trigger if exists sync_course_owner_membership on public.courses;
create trigger sync_course_owner_membership after insert or update of teacher_id on public.courses
for each row execute function private.sync_course_owner_membership();

-- Repair courses created since the U2 one-time backfill, without changing profile roles.
insert into public.course_memberships (course_id, user_id, role, status, accepted_at)
select id, teacher_id, 'owner', 'active', now() from public.courses where teacher_id is not null
on conflict (course_id, user_id) do update
set role = 'owner', status = 'active', accepted_at = coalesce(course_memberships.accepted_at, now());

-- All new public accounts receive the same compatibility value, even with forged metadata.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, name, avatar_url, role, status)
  values (new.id, coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url', 'learner', 'active')
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

drop policy if exists "Teachers can read their courses" on public.courses;
drop policy if exists "Owners can read their courses" on public.courses;
create policy "Owners can read their courses"
on public.courses
for select
to authenticated
using (
  teacher_id = (select auth.uid())
  and private.is_active_account()
);

drop policy if exists "Teachers can create their courses" on public.courses;
drop policy if exists "Owners can create their courses" on public.courses;
create policy "Owners can create their courses"
on public.courses
for insert
to authenticated
with check (
  teacher_id = (select auth.uid())
  and private.is_active_account()
);

drop policy if exists "Teachers can update their courses" on public.courses;
drop policy if exists "Owners can update their courses" on public.courses;
create policy "Owners can update their courses"
on public.courses
for update
to authenticated
using (
  teacher_id = (select auth.uid())
  and private.is_active_account()
)
with check (
  teacher_id = (select auth.uid())
  and private.is_active_account()
);

drop policy if exists "Teachers can delete draft courses" on public.courses;
drop policy if exists "Owners can delete draft courses" on public.courses;
create policy "Owners can delete draft courses"
on public.courses
for delete
to authenticated
using (
  teacher_id = (select auth.uid())
  and private.is_active_account()
  and status = 'draft'
);

drop policy if exists "Teachers can read their course modules" on public.course_modules;
drop policy if exists "Owners can read their course modules" on public.course_modules;
create policy "Owners can read their course modules"
on public.course_modules
for select
to authenticated
using (
  exists (
    select 1
    from public.courses
    where courses.id = course_modules.course_id
      and courses.teacher_id = (select auth.uid())
      and private.is_active_account()
  )
);

drop policy if exists "Teachers can create their course modules" on public.course_modules;
drop policy if exists "Owners can create their course modules" on public.course_modules;
create policy "Owners can create their course modules"
on public.course_modules
for insert
to authenticated
with check (
  exists (
    select 1
    from public.courses
    where courses.id = course_modules.course_id
      and courses.teacher_id = (select auth.uid())
      and private.is_active_account()
  )
);

drop policy if exists "Teachers can update their course modules" on public.course_modules;
drop policy if exists "Owners can update their course modules" on public.course_modules;
create policy "Owners can update their course modules"
on public.course_modules
for update
to authenticated
using (
  exists (
    select 1
    from public.courses
    where courses.id = course_modules.course_id
      and courses.teacher_id = (select auth.uid())
      and private.is_active_account()
  )
)
with check (
  exists (
    select 1
    from public.courses
    where courses.id = course_modules.course_id
      and courses.teacher_id = (select auth.uid())
      and private.is_active_account()
  )
);

drop policy if exists "Teachers can delete empty course modules" on public.course_modules;
drop policy if exists "Owners can delete empty course modules" on public.course_modules;
create policy "Owners can delete empty course modules"
on public.course_modules
for delete
to authenticated
using (
  exists (
    select 1
    from public.courses
    where courses.id = course_modules.course_id
      and courses.teacher_id = (select auth.uid())
      and private.is_active_account()
  )
  and not exists (
    select 1
    from public.lessons
    where lessons.module_id = course_modules.id
  )
);

drop policy if exists "Teachers can read their lessons" on public.lessons;
drop policy if exists "Owners can read their lessons" on public.lessons;
create policy "Owners can read their lessons"
on public.lessons
for select
to authenticated
using (
  exists (
    select 1
    from public.courses
    where courses.id = lessons.course_id
      and courses.teacher_id = (select auth.uid())
      and private.is_active_account()
  )
);

drop policy if exists "Teachers can create their lessons" on public.lessons;
drop policy if exists "Owners can create their lessons" on public.lessons;
create policy "Owners can create their lessons"
on public.lessons
for insert
to authenticated
with check (
  exists (
    select 1
    from public.courses
    where courses.id = lessons.course_id
      and courses.teacher_id = (select auth.uid())
      and private.is_active_account()
  )
  and exists (
    select 1
    from public.course_modules
    where course_modules.id = lessons.module_id
      and course_modules.course_id = lessons.course_id
  )
);

drop policy if exists "Teachers can update their lessons" on public.lessons;
drop policy if exists "Owners can update their lessons" on public.lessons;
create policy "Owners can update their lessons"
on public.lessons
for update
to authenticated
using (
  exists (
    select 1
    from public.courses
    where courses.id = lessons.course_id
      and courses.teacher_id = (select auth.uid())
      and private.is_active_account()
  )
)
with check (
  exists (
    select 1
    from public.courses
    where courses.id = lessons.course_id
      and courses.teacher_id = (select auth.uid())
      and private.is_active_account()
  )
  and exists (
    select 1
    from public.course_modules
    where course_modules.id = lessons.module_id
      and course_modules.course_id = lessons.course_id
  )
);

drop policy if exists "Teachers can delete draft lessons" on public.lessons;
drop policy if exists "Owners can delete draft lessons" on public.lessons;
create policy "Owners can delete draft lessons"
on public.lessons
for delete
to authenticated
using (
  exists (
    select 1
    from public.courses
    where courses.id = lessons.course_id
      and courses.teacher_id = (select auth.uid())
      and private.is_active_account()
  )
  and status = 'draft'
);

drop policy if exists "Teachers can read their resources" on public.resources;
drop policy if exists "Owners can read their resources" on public.resources;
create policy "Owners can read their resources"
on public.resources
for select
to authenticated
using (
  exists (
    select 1
    from public.courses
    where courses.id = resources.course_id
      and courses.teacher_id = (select auth.uid())
      and private.is_active_account()
  )
);

drop policy if exists "Teachers can create resources for their courses" on public.resources;
drop policy if exists "Owners can create resources for their courses" on public.resources;
create policy "Owners can create resources for their courses"
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
      and private.is_active_account()
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

drop policy if exists "Teachers can update their resources" on public.resources;
drop policy if exists "Owners can update their resources" on public.resources;
create policy "Owners can update their resources"
on public.resources
for update
to authenticated
using (
  exists (
    select 1
    from public.courses
    where courses.id = resources.course_id
      and courses.teacher_id = (select auth.uid())
      and private.is_active_account()
  )
)
with check (
  exists (
    select 1
    from public.courses
    where courses.id = resources.course_id
      and courses.teacher_id = (select auth.uid())
      and private.is_active_account()
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

drop policy if exists "Teachers can delete their resources" on public.resources;
drop policy if exists "Owners can delete their resources" on public.resources;
create policy "Owners can delete their resources"
on public.resources
for delete
to authenticated
using (
  exists (
    select 1
    from public.courses
    where courses.id = resources.course_id
      and courses.teacher_id = (select auth.uid())
      and private.is_active_account()
  )
);

drop policy if exists "Teachers can read their resource files" on storage.objects;
drop policy if exists "Owners can read their resource files" on storage.objects;
create policy "Owners can read their resource files"
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
      and private.is_active_account()
  )
);

drop policy if exists "Teachers can upload resource files" on storage.objects;
drop policy if exists "Owners can upload resource files" on storage.objects;
create policy "Owners can upload resource files"
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
      and private.is_active_account()
  )
);

drop policy if exists "Teachers can update their resource files" on storage.objects;
drop policy if exists "Owners can update their resource files" on storage.objects;
create policy "Owners can update their resource files"
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
      and private.is_active_account()
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
      and private.is_active_account()
  )
);

drop policy if exists "Teachers can delete their resource files" on storage.objects;
drop policy if exists "Owners can delete their resource files" on storage.objects;
create policy "Owners can delete their resource files"
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
      and private.is_active_account()
  )
);

drop policy if exists "Teachers can read their course covers" on storage.objects;
drop policy if exists "Owners can read their course covers" on storage.objects;
create policy "Owners can read their course covers"
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
      and private.is_active_account()
  )
);

drop policy if exists "Teachers can upload course covers" on storage.objects;
drop policy if exists "Owners can upload course covers" on storage.objects;
create policy "Owners can upload course covers"
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
      and private.is_active_account()
  )
);

drop policy if exists "Teachers can update their course covers" on storage.objects;
drop policy if exists "Owners can update their course covers" on storage.objects;
create policy "Owners can update their course covers"
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
      and private.is_active_account()
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
      and private.is_active_account()
  )
);

drop policy if exists "Teachers can delete their course covers" on storage.objects;
drop policy if exists "Owners can delete their course covers" on storage.objects;
create policy "Owners can delete their course covers"
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
      and private.is_active_account()
  )
);

drop policy if exists "Teachers can create active domains" on public.domains;
drop policy if exists "Active accounts can create active domains" on public.domains;
create policy "Active accounts can create active domains" on public.domains for insert to authenticated
with check (status = 'active' and private.is_active_account());

-- Participant tracking is read-only, scoped to owned courses, for every enrolled account.
drop policy if exists "Teachers can read enrolled learner profiles" on public.profiles;
drop policy if exists "Owners can read enrolled profiles" on public.profiles;
create policy "Owners can read enrolled profiles" on public.profiles for select to authenticated
using (private.is_active_account() and private.teacher_can_read_enrolled_learner(profiles.id));
drop policy if exists "Teachers can read lesson progress for their courses" on public.lesson_progress;
drop policy if exists "Owners can read lesson progress for their courses" on public.lesson_progress;
create policy "Owners can read lesson progress for their courses" on public.lesson_progress for select to authenticated
using (private.is_active_account() and private.teacher_owns_course(course_id));
drop policy if exists "Teachers can read enrollments for their courses" on public.enrollments;
drop policy if exists "Owners can read enrollments for their courses" on public.enrollments;
create policy "Owners can read enrollments for their courses" on public.enrollments for select to authenticated
using (private.is_active_account() and private.teacher_owns_course(course_id));

drop policy if exists "Teachers can read their course sources" on public.course_sources;
drop policy if exists "Owners can read their course sources" on public.course_sources;
create policy "Owners can read their course sources" on public.course_sources for select to authenticated
using (private.is_active_account() and teacher_id = (select auth.uid())
  and (course_id is null or private.teacher_owns_course(course_id)))
;

drop policy if exists "Teachers can create their course sources" on public.course_sources;
drop policy if exists "Owners can create their course sources" on public.course_sources;
create policy "Owners can create their course sources" on public.course_sources for insert to authenticated
with check (private.is_active_account() and teacher_id = (select auth.uid())
  and (course_id is null or private.teacher_owns_course(course_id)))
;

drop policy if exists "Teachers can update their course sources" on public.course_sources;
drop policy if exists "Owners can update their course sources" on public.course_sources;
create policy "Owners can update their course sources" on public.course_sources for update to authenticated
using (private.is_active_account() and teacher_id = (select auth.uid())
  and (course_id is null or private.teacher_owns_course(course_id)))
with check (private.is_active_account() and teacher_id = (select auth.uid())
  and (course_id is null or private.teacher_owns_course(course_id)))
;

drop policy if exists "Teachers can delete their course sources" on public.course_sources;
drop policy if exists "Owners can delete their course sources" on public.course_sources;
create policy "Owners can delete their course sources" on public.course_sources for delete to authenticated
using (private.is_active_account() and teacher_id = (select auth.uid())
  and (course_id is null or private.teacher_owns_course(course_id)))
;

create or replace function private.can_author_source_path(object_name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.is_active_account()
    and split_part(object_name, '/', 1) = (select auth.uid())::text
    and (split_part(object_name, '/', 2) = 'brief' or exists (
      select 1 from public.courses where id::text = split_part(object_name, '/', 2)
        and teacher_id = (select auth.uid())))
    and not exists (select 1 from public.course_sources s
      where s.storage_bucket = 'course-sources' and s.storage_path = object_name
        and (s.teacher_id <> (select auth.uid())
          or (s.course_id is not null and not private.teacher_owns_course(s.course_id))));
$$;
revoke all on function private.can_author_source_path(text) from public, anon;
grant execute on function private.can_author_source_path(text) to authenticated;

drop policy if exists "Teachers can read their source files" on storage.objects;
drop policy if exists "Owners can read their source files" on storage.objects;
create policy "Owners can read their source files" on storage.objects for select to authenticated
using (bucket_id = 'course-sources' and private.can_author_source_path(name))
;

drop policy if exists "Teachers can upload source files" on storage.objects;
drop policy if exists "Owners can upload source files" on storage.objects;
create policy "Owners can upload source files" on storage.objects for insert to authenticated
with check (bucket_id = 'course-sources' and private.can_author_source_path(name))
;

drop policy if exists "Teachers can update their source files" on storage.objects;
drop policy if exists "Owners can update their source files" on storage.objects;
create policy "Owners can update their source files" on storage.objects for update to authenticated
using (bucket_id = 'course-sources' and private.can_author_source_path(name))
with check (bucket_id = 'course-sources' and private.can_author_source_path(name))
;

drop policy if exists "Teachers can delete their source files" on storage.objects;
drop policy if exists "Owners can delete their source files" on storage.objects;
create policy "Owners can delete their source files" on storage.objects for delete to authenticated
using (bucket_id = 'course-sources' and private.can_author_source_path(name))
;

-- Authoring metadata never accepts a course/lesson solely because the caller supplies its ID.
create or replace function private.can_author_ai_context(context_kind text, target_id uuid)
returns boolean language sql stable security invoker set search_path = '' as $$
  select private.is_active_account() and case context_kind
    when 'teacher_studio' then target_id is null
    when 'course' then private.teacher_owns_course(target_id)
    when 'lesson' then exists (select 1 from public.lessons
      where id = target_id and private.teacher_owns_course(course_id))
    else false end;
$$;
revoke all on function private.can_author_ai_context(text, uuid) from public, anon;
grant execute on function private.can_author_ai_context(text, uuid) to authenticated;

drop policy if exists "Teachers can read their authoring ai generation metadata" on public.ai_generations;
drop policy if exists "Owners can read their authoring ai generation metadata" on public.ai_generations;
create policy "Owners can read their authoring ai generation metadata" on public.ai_generations for select to authenticated
using (user_id = (select auth.uid())
  and prompt_type not in ('learner_explain', 'learner_clarify', 'learner_rephrase',
    'learner_example', 'learner_question', 'learner_freeform')
  and private.can_author_ai_context(context_type, context_id))
;

drop policy if exists "Teachers can insert their authoring ai generation metadata" on public.ai_generations;
drop policy if exists "Owners can insert their authoring ai generation metadata" on public.ai_generations;
create policy "Owners can insert their authoring ai generation metadata" on public.ai_generations for insert to authenticated
with check (user_id = (select auth.uid())
  and prompt_type not in ('learner_explain', 'learner_clarify', 'learner_rephrase',
    'learner_example', 'learner_question', 'learner_freeform')
  and private.can_author_ai_context(context_type, context_id))
;

drop policy if exists "Teachers can read their ai generation source refs" on public.ai_generation_sources;
drop policy if exists "Owners can read their ai generation source refs" on public.ai_generation_sources;
create policy "Owners can read their ai generation source refs" on public.ai_generation_sources for select to authenticated
using (private.is_active_account()
  and exists (select 1 from public.ai_generations g where g.id = generation_id
    and g.user_id = (select auth.uid())
    and g.prompt_type not in ('learner_explain', 'learner_clarify', 'learner_rephrase',
      'learner_example', 'learner_question', 'learner_freeform')
    and private.can_author_ai_context(g.context_type, g.context_id))
  and exists (select 1 from public.course_sources s where s.id = source_id
    and s.teacher_id = (select auth.uid())
    and (s.course_id is null or private.teacher_owns_course(s.course_id))))
;

drop policy if exists "Teachers can create their ai generation source refs" on public.ai_generation_sources;
drop policy if exists "Owners can create their ai generation source refs" on public.ai_generation_sources;
create policy "Owners can create their ai generation source refs" on public.ai_generation_sources for insert to authenticated
with check (private.is_active_account()
  and exists (select 1 from public.ai_generations g where g.id = generation_id
    and g.user_id = (select auth.uid())
    and g.prompt_type not in ('learner_explain', 'learner_clarify', 'learner_rephrase',
      'learner_example', 'learner_question', 'learner_freeform')
    and private.can_author_ai_context(g.context_type, g.context_id))
  and exists (select 1 from public.course_sources s where s.id = source_id
    and s.teacher_id = (select auth.uid())
    and (s.course_id is null or private.teacher_owns_course(s.course_id))))
;
