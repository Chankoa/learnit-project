drop policy if exists "Teachers can create active domains" on public.domains;

create policy "Teachers can create active domains"
on public.domains
for insert
to authenticated
with check (
  status = 'active'
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'teacher'
      and profiles.status = 'active'
  )
);

grant select on public.domains to anon, authenticated;
grant insert on public.domains to authenticated;
