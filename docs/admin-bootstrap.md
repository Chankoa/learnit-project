# Admin bootstrap and role governance

LearnIt uses Supabase Auth for identity and `public.profiles` for application roles.

## Role policy

Public registration is allowed only for:

- `learner`, created with `status = active`
- `teacher`, currently created with `status = active`

Public registration must never create:

- `admin`

The client form is not the security boundary. The server normalizes public registration roles, and the database trigger also rejects `admin` self-assignment by falling back to `learner`.

## First admin procedure

Use a manual, trusted Supabase operation for the first administrator:

1. Create the user through the normal `/register` flow.
2. Confirm the email if Supabase email confirmation is enabled.
3. In the Supabase SQL Editor, promote the profile explicitly:

```sql
update public.profiles
set role = 'admin',
    status = 'active'
where email = 'admin@example.com';
```

4. Sign in with that account.
5. Confirm it redirects to `/app/admin`.

Do not automate this promotion from a public client. Do not use `raw_user_meta_data` or request payload roles as an authorization source.

## RLS and column privileges

Authenticated users may update only their own editable profile columns:

- `name`
- `avatar_url`

Authenticated users must not update:

- `role`
- `status`
- `email`
- `id`
- timestamps

The migration `20260811070054_tighten_profile_role_governance.sql` revokes table-level `UPDATE` from `authenticated` and grants column-level `UPDATE` only for `name` and `avatar_url`.

## Verification SQL

Run these checks in Supabase SQL Editor after applying migrations.

The same checks are available as `supabase/tests/role-governance.sql`.

Check column privileges:

```sql
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'profiles'
  and grantee = 'authenticated'
order by privilege_type;
```

Expected table-level privileges include `SELECT` and `INSERT`, but not table-level `UPDATE`.

```sql
select grantee, column_name, privilege_type
from information_schema.column_privileges
where table_schema = 'public'
  and table_name = 'profiles'
  and grantee = 'authenticated'
  and privilege_type = 'UPDATE'
order by column_name;
```

Expected `UPDATE` columns:

- `avatar_url`
- `name`

## Manual access tests

Use three real accounts after applying the migration:

- learner login -> `/app/learner`
- teacher login -> `/app/teacher`
- admin login -> `/app/admin`

Then test direct URL access:

- learner -> `/app/admin` must redirect to `/access-denied`
- teacher -> `/app/admin` must redirect to `/access-denied`
- no session -> `/app/admin` must redirect to `/login?next=%2Fapp%2Fadmin`

## Future teacher validation

For a stricter V1, teacher registration can become:

- public request creates `role = teacher`
- `status = pending`
- admin validates the profile from `/app/admin/users`

That change needs a dedicated workflow because current login rejects non-active profiles.

## Future `/app/admin/users`

All real role and status changes should use this shape:

1. Server Action or Route Handler.
2. Read the current Supabase session.
3. Resolve `getCurrentProfile()`.
4. Require `currentProfile.role = 'admin'`.
5. Validate the target role and status server-side.
6. Update `public.profiles`.
7. Log a clear server error on failure without exposing tokens or service keys.

The UI may offer controls, but it must never send trusted authorization decisions.
