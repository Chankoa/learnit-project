create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
  profile_role public.profile_role;
begin
  requested_role := lower(coalesce(new.raw_user_meta_data ->> 'role', ''));
  profile_role := case
    when requested_role = 'teacher' then 'teacher'::public.profile_role
    else 'learner'::public.profile_role
  end;

  insert into public.profiles (id, email, name, avatar_url, role, status)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url',
    profile_role,
    'active'::public.profile_status
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke update on table public.profiles from authenticated;
revoke update (id, email, role, status, created_at, updated_at, last_active_at)
on table public.profiles
from authenticated;

grant select, insert on table public.profiles to authenticated;
grant update (name, avatar_url) on table public.profiles to authenticated;
