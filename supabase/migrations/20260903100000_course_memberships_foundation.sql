do $$

begin

  create type public.course_membership_role as enum (
    'viewer',
    'participant',
    'contributor',
    'editor',
    'owner'
  );

exception
  when duplicate_object then null;

end $$;

do $$

begin

  create type public.course_membership_status as enum (
    'invited',
    'active',
    'suspended',
    'revoked'
  );

exception
  when duplicate_object then null;

end $$;

create table if not exists public.course_memberships (
  id uuid primary key default gen_random_uuid(),

  course_id uuid not null
    references public.courses(id)
    on delete cascade,

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  role public.course_membership_role not null,

  status public.course_membership_status
    not null
    default 'invited',

  invited_by uuid
    references public.profiles(id)
    on delete set null,

  created_at timestamptz
    not null
    default now(),

  accepted_at timestamptz,

  updated_at timestamptz
    not null
    default now(),

  unique (course_id, user_id),

  check (
    (status = 'invited' and accepted_at is null)
    or (status = 'active' and accepted_at is not null)
    or status in ('suspended', 'revoked')
  )
);

create index if not exists course_memberships_user_course_idx
  on public.course_memberships(user_id, course_id)
  where status = 'active';

create index if not exists course_memberships_course_role_idx
  on public.course_memberships(course_id, role)
  where status = 'active';

drop trigger if exists set_course_memberships_updated_at
on public.course_memberships;

create trigger set_course_memberships_updated_at
before update on public.course_memberships
for each row
execute function public.set_updated_at();

-- Preserve teacher_id as the legacy ownership source
-- while exposing the same fact contextually.

insert into public.course_memberships (
  course_id,
  user_id,
  role,
  status,
  accepted_at
)

select
  id,
  teacher_id,
  'owner',
  'active',
  now()

from public.courses

where teacher_id is not null

on conflict (course_id, user_id)
do nothing;

alter table public.course_memberships
enable row level security;

create or replace function private.course_membership_has_capability(
  membership_role public.course_membership_role,
  requested_capability text
)

returns boolean

language sql

immutable

set search_path = ''

as $$

  select case membership_role

    when 'viewer' then
      requested_capability in (
        'view',
        'reuse',
        'remix'
      )

    when 'participant' then
      requested_capability in (
        'view',
        'comment',
        'reuse',
        'remix'
      )

    when 'contributor' then
      requested_capability in (
        'view',
        'comment',
        'propose',
        'reuse',
        'remix'
      )

    when 'editor' then
      requested_capability in (
        'view',
        'comment',
        'propose',
        'reuse',
        'remix',
        'edit'
      )

    when 'owner' then
      requested_capability in (
        'view',
        'comment',
        'propose',
        'reuse',
        'remix',
        'edit',
        'publish',
        'manage_members'
      )

  end

$$;

create or replace function private.has_course_capability(
  target_course_id uuid,
  requested_capability text
)

returns boolean

language sql

stable

security definer

set search_path = ''

as $$

  select

    public.current_profile_role() = 'admin'

    or exists (

      select 1

      from public.course_memberships

      where course_id = target_course_id

        and user_id = (
          select auth.uid()
        )

        and status = 'active'

        and private.course_membership_has_capability(
          role,
          requested_capability
        )

    )

$$;

revoke all
on function private.course_membership_has_capability(
  public.course_membership_role,
  text
)
from public, anon;

revoke all
on function private.has_course_capability(
  uuid,
  text
)
from public, anon;

grant execute
on function private.has_course_capability(
  uuid,
  text
)
to authenticated;

drop policy if exists
"Users can read their course memberships"
on public.course_memberships;

create policy
"Users can read their course memberships"

on public.course_memberships

for select

to authenticated

using (

  user_id = (
    select auth.uid()
  )

  or public.current_profile_role() = 'admin'

);

-- Membership management is deferred.
-- No authenticated insert/update/delete policy exists,
-- so a client cannot self-assign or promote a contextual role in U2.

grant select
on public.course_memberships
to authenticated;