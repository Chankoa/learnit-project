-- Run this script after applying migrations.
-- It checks that public profiles cannot be updated at table level by authenticated users
-- and that only public registration roles are accepted by the trigger implementation.

do $$
begin
  if exists (
    select 1
    from information_schema.role_table_grants
    where table_schema = 'public'
      and table_name = 'profiles'
      and grantee = 'authenticated'
      and privilege_type = 'UPDATE'
  ) then
    raise exception 'authenticated still has table-level UPDATE on public.profiles';
  end if;

  if exists (
    select 1
    from information_schema.column_privileges
    where table_schema = 'public'
      and table_name = 'profiles'
      and grantee = 'authenticated'
      and privilege_type = 'UPDATE'
      and column_name not in ('name', 'avatar_url')
  ) then
    raise exception 'authenticated can update a protected public.profiles column';
  end if;

  if not exists (
    select 1
    from information_schema.column_privileges
    where table_schema = 'public'
      and table_name = 'profiles'
      and grantee = 'authenticated'
      and privilege_type = 'UPDATE'
      and column_name = 'name'
  ) then
    raise exception 'authenticated cannot update public.profiles.name';
  end if;

  if not exists (
    select 1
    from information_schema.column_privileges
    where table_schema = 'public'
      and table_name = 'profiles'
      and grantee = 'authenticated'
      and privilege_type = 'UPDATE'
      and column_name = 'avatar_url'
  ) then
    raise exception 'authenticated cannot update public.profiles.avatar_url';
  end if;

  if pg_get_functiondef('public.handle_new_user()'::regprocedure) like '%requested_role in (%admin%'
    or pg_get_functiondef('public.handle_new_user()'::regprocedure) like '%requested_role = ''admin''%'
  then
    raise exception 'handle_new_user still allows admin self-assignment';
  end if;
end;
$$;
