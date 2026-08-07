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
  requested_role := new.raw_user_meta_data ->> 'role';
  profile_role := case
    when requested_role = 'teacher' then 'teacher'::public.profile_role
    else 'learner'::public.profile_role
  end;

  insert into public.profiles (id, email, name, avatar_url, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url',
    profile_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;