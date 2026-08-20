# Supabase setup

This document prepares LearnIt for a progressive Supabase integration while keeping the mock mode usable.

## Packages

The project uses the official Supabase packages for Next.js SSR:

- `@supabase/supabase-js`
- `@supabase/ssr`

Client factories are available in:

- `lib/supabase/client.ts` for Client Components and browser-only interactions.
- `lib/supabase/server.ts` for Server Components, Server Actions and Route Handlers.

The clients are created lazily. Importing the files does not require Supabase environment variables during `next build`.

## Environment variables

Local development can use mock data or a dedicated Supabase project. Production and Vercel Preview must never use localhost for `NEXT_PUBLIC_APP_URL`.

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=replace-with-publishable-key
NEXT_PUBLIC_DATA_SOURCE=mock
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_ENABLE_AUTH=true
NEXT_PUBLIC_ENABLE_ADMIN=true
```

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is the public key used by browser and session-aware server clients. `SUPABASE_SERVICE_ROLE_KEY` is optional, server-only, and used solely by `lib/supabase/admin.ts` for authenticated account deletion. It is not needed for catalogue reads, Auth, RLS, Storage, Teacher ownership, or Learner isolation.

The variable names must be identical in `.env.example`, `.env.local`, and production environment variables. Their values can differ by environment. Netlify deployments must receive the same public variables in Site configuration > Environment variables.

Never expose a Supabase `service_role` key through a `NEXT_PUBLIC_*` variable, include it in client-side code, or log it. The standard publishable-key clients retain RLS enforcement; do not introduce service role as a Vercel workaround.

## Auth URL configuration

Supabase Auth must know the URLs that can receive authentication redirects. Configure these in Supabase Dashboard > Authentication > URL Configuration:

- Site URL, local: `http://localhost:3000`
- Site URL, production: `https://learnit-project.vercel.app` or the canonical custom domain
- Redirect URL, local callback: `http://localhost:3000/auth/callback`
- Redirect URL, production callback: `https://learnit-project.vercel.app/auth/callback`
- Redirect URL, custom domain callback: `https://<your-domain>/auth/callback`
- Optional Vercel previews: `https://*-<team-or-account>.vercel.app/auth/callback` if preview email flows are deliberately enabled

Do not leave production Auth redirects pointing at localhost. `NEXT_PUBLIC_APP_URL` should be the canonical app URL in production. `lib/config/runtime.ts` falls back to `https://${VERCEL_URL}` only when the explicit value is absent; the explicit value remains preferred for stable production callbacks.

The `/auth/callback` route calls `exchangeCodeForSession()` and redirects only to safe relative `next` paths. Failed exchanges are logged as `[auth] callback session exchange failed` without logging tokens.

Password recovery uses the same callback allowlist. `/forgot-password` calls `resetPasswordForEmail()` with a redirect URL generated as `/auth/callback?next=/auth/reset-password`; the callback exchanges the recovery code for a Supabase session, then `/auth/reset-password` calls `updateUser({ password })`. Do not add localhost directly in production variables. Configure these callback URLs in Supabase:

- local password recovery callback: `http://localhost:3000/auth/callback`
- production password recovery callback: `https://<your-site>.netlify.app/auth/callback`
- custom domain password recovery callback: `https://<your-domain>/auth/callback`

## Account management and deletion

`/app/profile` lets an authenticated user update only `profiles.name` and `profiles.avatar_url`. Email and password changes go through Supabase Auth with `auth.updateUser`; the displayed email is read from `auth.users`, which remains the source of truth after email confirmation. The `202608070002_sync_profile_email.sql` trigger synchronizes `profiles.email` only after Auth applies the change. Roles and statuses are read-only in the UI and remain protected by the `profiles` RLS column privileges.

Public registration can create only learner or teacher profiles. Admin profiles must be provisioned by a trusted server-side workflow; the `202608070001_prevent_admin_self_assignment.sql` migration prevents an `admin` value in Auth user metadata from becoming a profile role.

Role governance is documented in `docs/admin-bootstrap.md`. The current convention is:

- `learner`: public registration allowed, `status = active`
- `teacher`: public registration allowed, `status = active` for now
- `admin`: public registration forbidden; bootstrap or promotion must be done by a trusted Supabase operation

The `20260811070054_tighten_profile_role_governance.sql` migration keeps the trigger behavior idempotent and tightens `profiles` column privileges so authenticated users can update only `name` and `avatar_url`, never `role` or `status`.

Account deletion is a Server Action. It verifies the active Supabase session and that the submitted user ID matches that session before using the server-only admin client to call `auth.admin.deleteUser`. The operation requires `SUPABASE_SERVICE_ROLE_KEY` and fails safely when it is absent.

The existing schema handles dependent profile data without a new migration: deleting `auth.users` cascades to `profiles`, then to `enrollments`, `lesson_progress`, `notes`, and `favorites`. `courses.teacher_id` and `resources.created_by` are set to `NULL`; course, module, lesson, resource, and domain records are retained. Review these retention rules before deleting production accounts.

## LMS read layer

When `NEXT_PUBLIC_DATA_SOURCE=supabase`, the public catalogue, domain, course and curriculum pages read LMS content from Supabase with the publishable key and RLS. See `docs/lms-read-layer.md` for backend selection, mapper coverage, and the current resource seed limitation.

## Supabase project checklist

1. Create a Supabase project for LearnIt V1.
2. Copy the project URL into `NEXT_PUBLIC_SUPABASE_URL`.
3. Copy the publishable key into `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Set `NEXT_PUBLIC_ENABLE_AUTH=true` when login/register should be exposed in production.
5. Keep `NEXT_PUBLIC_DATA_SOURCE=mock` until a repository is explicitly migrated.
6. Apply the SQL migrations in `supabase/migrations`.
7. Run `supabase/seed.sql` after at least one teacher or admin profile exists if you want seeded courses to receive a `teacher_id`.
8. Enable Auth providers for email/password in Supabase Auth settings.
9. Configure Auth Site URL and Redirect URLs for local, Netlify production, and any custom domain.
10. Create Storage buckets before wiring uploads:
   - `course-covers`
   - `resources`
   - `uploads`
11. Add or review Row Level Security policies before exposing authenticated data.

## Planned tables

The first Supabase schema should mirror the conceptual model in `docs/database-model.md`:

- `profiles`
- `domains`
- `courses`
- `modules`
- `lessons`
- `resources`
- `enrollments`
- `progress`
- `notes`
- `favorites`
- `certificates`
- `teacher_courses`

`auth.users` remains the source of authentication identity. The public application profile should live in `profiles`.

## Migrations added

- `202606220001_profiles.sql`
  - creates `profiles`
  - adds `profiles.role`
  - adds the auth trigger that creates a profile after a Supabase Auth user is created
  - enables RLS for profile reads and updates
- `202606220002_lms_core.sql`
  - creates `domains`, `courses`, `course_modules`, `lessons`, `resources`, `enrollments`, `lesson_progress`, `notes` and `favorites`
  - adds publication statuses, slugs, timestamps and relations
  - creates the initial Storage buckets expected by LearnIt
- `202608070001_prevent_admin_self_assignment.sql`
  - updates `handle_new_user()` so public metadata can request `teacher`, but `admin` falls back to `learner`
- `202608070002_sync_profile_email.sql`
  - synchronizes `profiles.email` after Supabase Auth applies an email change
- `20260811070054_tighten_profile_role_governance.sql`
  - reasserts the public registration trigger so `admin` metadata falls back to `learner`
  - revokes table-level profile updates from `authenticated`
  - grants profile updates only on `name` and `avatar_url`
- `supabase/tests/role-governance.sql`
  - verifies trigger and profile column privileges after migrations are applied
- `supabase/seed.sql`
  - imports the four current mock courses and their initial modules/lessons
  - keeps the script rerunnable through `on conflict` clauses

## Current status

Sprint 26 added the Supabase client infrastructure and documentation.

Sprint 27-29 now add:

- real login, register, logout and callback routes
- server auth helpers
- role checks for learner, teacher and admin app layouts
- the initial Supabase SQL schema and seed script

The LMS content repositories still read from mock data. Supabase is currently responsible for authentication, profiles and the future database schema.
