-- Run after U4.2, as postgres (SQL Editor). All fixtures and writes roll back.
-- To validate without applying U4.2: BEGIN; paste the migration; then paste this
-- file WITHOUT its BEGIN. Its final ROLLBACK also reverts the migration.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '45s';

create function pg_temp.u4_assert(ok boolean, label text) returns void
language plpgsql as $$ begin
  if ok is distinct from true then raise exception 'U4.2 FAIL: %', label; end if;
end $$;
create function pg_temp.u4_denied(statement text) returns void
language plpgsql as $$ begin
  begin execute statement;
  exception when insufficient_privilege then return;
  end;
  raise exception 'U4.2 expected RLS denial: %', statement;
end $$;

-- No Auth API call, no email. IDs are isolated fixtures, never existing accounts.
insert into auth.users(id, email, raw_user_meta_data) values
 ('00000000-0420-4000-8000-000000000001', 'u42-owner@example.invalid', '{"role":"admin"}'),
 ('00000000-0420-4000-8000-000000000002', 'u42-teacher@example.invalid', '{"role":"teacher"}'),
 ('00000000-0420-4000-8000-000000000003', 'u42-outsider@example.invalid', '{}'),
 ('00000000-0420-4000-8000-000000000004', 'u42-admin@example.invalid', '{}');
select pg_temp.u4_assert((select count(*) = 4 from public.profiles
 where id::text like '00000000-0420-4000-8000-%' and role = 'learner'), 'public signup ignores role metadata');
update public.profiles set role = 'teacher' where id = '00000000-0420-4000-8000-000000000002';
update public.profiles set role = 'admin' where id = '00000000-0420-4000-8000-000000000004';
insert into public.domains(id, slug, name) values
 ('00000000-0420-4000-8000-000000000010', 'u42-probe-domain', 'U4.2 probe');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0420-4000-8000-000000000001', true);
insert into public.courses(id, teacher_id, domain_id, slug, title, description) values
 ('00000000-0420-4000-8000-000000000020', auth.uid(), '00000000-0420-4000-8000-000000000010', 'u42-probe-course', 'Probe', 'Probe');
select pg_temp.u4_assert((select role = 'owner' and status = 'active' and accepted_at is not null
 from public.course_memberships where course_id = '00000000-0420-4000-8000-000000000020'
 and user_id = auth.uid()), 'learner course creation creates owner membership');
update public.courses set title = 'Owned edit' where id = '00000000-0420-4000-8000-000000000020';
select pg_temp.u4_assert((select title = 'Owned edit' from public.courses where id = '00000000-0420-4000-8000-000000000020'), 'owner reads and edits draft');
insert into public.course_modules(id, course_id, slug, title) values
 ('00000000-0420-4000-8000-000000000030', '00000000-0420-4000-8000-000000000020', 'module', 'Module');
insert into public.lessons(id, course_id, module_id, slug, title) values
 ('00000000-0420-4000-8000-000000000040', '00000000-0420-4000-8000-000000000020', '00000000-0420-4000-8000-000000000030', 'u42-probe-lesson', 'Lesson');
update public.course_modules set title = 'Module edited' where id = '00000000-0420-4000-8000-000000000030';
update public.lessons set content = 'Lesson edited' where id = '00000000-0420-4000-8000-000000000040';
select pg_temp.u4_assert((select content = 'Lesson edited' from public.lessons where id = '00000000-0420-4000-8000-000000000040'), 'owner edits lesson');
insert into public.resources(id, course_id, lesson_id, created_by, title, type, href, access) values
 ('00000000-0420-4000-8000-000000000050', '00000000-0420-4000-8000-000000000020', '00000000-0420-4000-8000-000000000040', auth.uid(), 'Resource', 'link', 'https://example.invalid', 'enrolled');
insert into public.ai_generations(id, user_id, context_type, context_id, prompt_type, provider, model, status) values
 ('00000000-0420-4000-8000-000000000060', auth.uid(), 'lesson', '00000000-0420-4000-8000-000000000040', 'lesson_plan', 'probe', 'probe', 'success');
insert into public.ai_generations(user_id, context_type, prompt_type, provider, model, status)
 values (auth.uid(), 'teacher_studio', 'course_structure', 'probe', 'probe', 'success');
select pg_temp.u4_denied($q$update public.courses set teacher_id = '00000000-0420-4000-8000-000000000003'
 where id = '00000000-0420-4000-8000-000000000020'$q$);
select pg_temp.u4_denied($q$update public.profiles set role = 'admin' where id = auth.uid()$q$);
select pg_temp.u4_denied($q$insert into public.course_memberships(course_id,user_id,role,status,accepted_at)
 values ('00000000-0420-4000-8000-000000000020','00000000-0420-4000-8000-000000000003','owner','active',now())$q$);

-- Non-owner cannot see a draft or mutate its children, even by direct ID.
select set_config('request.jwt.claim.sub', '00000000-0420-4000-8000-000000000003', true);
select pg_temp.u4_assert((select count(*) = 0 from public.courses where id = '00000000-0420-4000-8000-000000000020'), 'outsider draft invisible');
with changed as (update public.courses set title = 'Attack' where id = '00000000-0420-4000-8000-000000000020' returning id)
 select pg_temp.u4_assert((select count(*) = 0 from changed), 'outsider edit denied');
select pg_temp.u4_denied($q$insert into public.course_modules(course_id,slug,title)
 values ('00000000-0420-4000-8000-000000000020','attack','Attack')$q$);
select pg_temp.u4_denied($q$insert into public.ai_generations(user_id,context_type,context_id,prompt_type,provider,model,status)
 values(auth.uid(),'lesson','00000000-0420-4000-8000-000000000040','lesson_plan','probe','probe','success')$q$);

-- Owner publishes and self-enrolls. Enrollment on another owner's course grants only learning.
select set_config('request.jwt.claim.sub', '00000000-0420-4000-8000-000000000001', true);
update public.courses set status = 'published', visibility = 'public' where id = '00000000-0420-4000-8000-000000000020';
update public.lessons set status = 'published' where id = '00000000-0420-4000-8000-000000000040';
insert into public.enrollments(user_id,course_id) values(auth.uid(),'00000000-0420-4000-8000-000000000020');
select pg_temp.u4_assert(private.can_read_enrolled_published_course('00000000-0420-4000-8000-000000000020') and private.teacher_owns_course('00000000-0420-4000-8000-000000000020'), 'owner plus enrolled');
select set_config('request.jwt.claim.sub', '00000000-0420-4000-8000-000000000003', true);
insert into public.enrollments(user_id,course_id) values(auth.uid(),'00000000-0420-4000-8000-000000000020');
select pg_temp.u4_assert(private.can_read_enrolled_published_course('00000000-0420-4000-8000-000000000020'), 'enrolled read');
insert into public.lesson_progress(user_id,course_id,lesson_id,completed)
 values(auth.uid(),'00000000-0420-4000-8000-000000000020','00000000-0420-4000-8000-000000000040',true);
insert into public.ai_generations(user_id,context_type,context_id,prompt_type,provider,model,status)
 values(auth.uid(),'lesson','00000000-0420-4000-8000-000000000040','learner_explain','probe','probe','success');
with changed as (update public.lessons set title = 'Attack' where id = '00000000-0420-4000-8000-000000000040' returning id)
 select pg_temp.u4_assert((select count(*) = 0 from changed), 'enrolled lesson edit denied');
with changed as (update public.courses set title = 'Attack' where id = '00000000-0420-4000-8000-000000000020' returning id)
 select pg_temp.u4_assert((select count(*) = 0 from changed), 'enrolled course edit denied');
with changed as (delete from public.resources where id = '00000000-0420-4000-8000-000000000050' returning id)
 select pg_temp.u4_assert((select count(*) = 0 from changed), 'enrolled resource delete denied');

select set_config('request.jwt.claim.sub', '00000000-0420-4000-8000-000000000002', true);
insert into public.courses(id,teacher_id,domain_id,slug,title,description) values
 ('00000000-0420-4000-8000-000000000021',auth.uid(),'00000000-0420-4000-8000-000000000010','u42-teacher-course','Teacher','Probe');
update public.courses set title = 'Teacher edit' where id = '00000000-0420-4000-8000-000000000021';
select pg_temp.u4_assert((select title = 'Teacher edit' from public.courses where id = '00000000-0420-4000-8000-000000000021'), 'legacy teacher retains own authoring');
with changed as (update public.courses set title = 'Attack' where id = '00000000-0420-4000-8000-000000000020' returning id)
 select pg_temp.u4_assert((select count(*) = 0 from changed), 'teacher cannot edit another course');
insert into public.enrollments(user_id,course_id) values(auth.uid(),'00000000-0420-4000-8000-000000000020');
select set_config('request.jwt.claim.sub', '00000000-0420-4000-8000-000000000001', true);
select pg_temp.u4_assert((select count(*) = 1 from public.profiles where id = '00000000-0420-4000-8000-000000000002'), 'owner can track teacher participant');

-- Existing global admin course policy remains effective.
select set_config('request.jwt.claim.sub', '00000000-0420-4000-8000-000000000004', true);
update public.courses set title = 'Admin edit' where id = '00000000-0420-4000-8000-000000000021';
select pg_temp.u4_assert((select title = 'Admin edit' from public.courses where id = '00000000-0420-4000-8000-000000000021'), 'global admin preserved');
reset role;
update public.profiles set status = 'disabled' where id = '00000000-0420-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0420-4000-8000-000000000001', true);
with changed as (update public.courses set title = 'Disabled attack' where id = '00000000-0420-4000-8000-000000000020' returning id)
 select pg_temp.u4_assert((select count(*) = 0 from changed), 'disabled owner cannot edit');
reset role;
rollback;
select 'U4.2 transactional probes passed; fixtures rolled back' as result;
