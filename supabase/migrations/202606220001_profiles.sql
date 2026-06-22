create extension if not exists "pgcrypto";

do $$
begin
  create type public.profile_role as enum ('learner', 'teacher', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.profile_status as enum ('active', 'pending', 'disabled');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  avatar_url text,
  role public.profile_role not null default 'learner',
  status public.profile_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_active_at timestamptz
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.current_profile_role()
returns public.profile_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

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
    when requested_role in ('learner', 'teacher', 'admin') then requested_role::public.profile_role
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

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "Profiles are readable by owner" on public.profiles;
create policy "Profiles are readable by owner"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "Profiles are readable by admins" on public.profiles;
create policy "Profiles are readable by admins"
on public.profiles
for select
to authenticated
using (public.current_profile_role() = 'admin');

drop policy if exists "Users can insert their own learner profile" on public.profiles;
create policy "Users can insert their own learner profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid() and role = 'learner');

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

grant select, insert, update on public.profiles to authenticated;
revoke update (role, status) on public.profiles from authenticated;
