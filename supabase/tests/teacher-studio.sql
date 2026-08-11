-- Run after 20260811090300_teacher_studio_authoring.sql.
-- Verifies Teacher authoring RLS without keeping test rows.

do $$
declare
  teacher uuid;
  learner uuid;
  domain uuid;
  course uuid;
  module uuid;
  learner_blocked boolean := false;
begin
  select id into teacher
  from public.profiles
  where role = 'teacher' and status = 'active'
  order by created_at
  limit 1;

  select id into learner
  from public.profiles
  where role = 'learner' and status = 'active'
  order by created_at
  limit 1;

  select id into domain
  from public.domains
  where status = 'active'
  order by display_order
  limit 1;

  if teacher is null or learner is null or domain is null then
    raise notice 'Teacher Studio RLS smoke skipped: missing teacher, learner or domain.';
    return;
  end if;

  perform set_config('request.jwt.claim.sub', teacher::text, true);
  set local role authenticated;

  insert into public.courses (teacher_id, domain_id, slug, title, subtitle, description, status, visibility, availability)
  values (teacher, domain, 'rls-teacher-studio-smoke', 'RLS smoke', 'Smoke', 'Smoke test', 'draft', 'private', 'preview')
  returning id into course;

  insert into public.course_modules (course_id, slug, title, display_order, status)
  values (course, 'module-smoke', 'Module smoke', 1, 'draft')
  returning id into module;

  insert into public.lessons (course_id, module_id, slug, title, type, status, display_order, content)
  values (course, module, 'lesson-smoke', 'Lesson smoke', 'reading', 'draft', 1, 'Smoke content');

  reset role;
  perform set_config('request.jwt.claim.sub', learner::text, true);
  set local role authenticated;

  begin
    insert into public.courses (teacher_id, domain_id, slug, title, description, status, visibility, availability)
    values (learner, domain, 'rls-learner-should-fail', 'Learner blocked', 'Should fail', 'draft', 'private', 'preview');
  exception when others then
    learner_blocked := true;
  end;

  if not learner_blocked then
    raise exception 'Learner could insert a course';
  end if;

  raise exception 'rollback smoke ok';
exception
  when others then
    if sqlerrm = 'rollback smoke ok' then
      raise notice 'Teacher Studio RLS smoke test passed and rolled back.';
    else
      raise;
    end if;
end $$;
