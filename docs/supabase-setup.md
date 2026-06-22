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

Local development should keep mock data enabled until repositories are migrated:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_DATA_SOURCE=mock
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_ENABLE_AUTH=false
NEXT_PUBLIC_ENABLE_ADMIN=true
```

Netlify must receive the same public variables in Site configuration > Environment variables.

Do not add a Supabase service role key to public variables. If server-only admin operations become necessary later, use a non-public variable and keep those calls inside Route Handlers or Server Actions.

## Supabase project checklist

1. Create a Supabase project for LearnIt V1.
2. Copy the project URL into `NEXT_PUBLIC_SUPABASE_URL`.
3. Copy the anon or publishable client key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Set `NEXT_PUBLIC_ENABLE_AUTH=true` when login/register should be exposed in production.
5. Keep `NEXT_PUBLIC_DATA_SOURCE=mock` until a repository is explicitly migrated.
6. Apply the SQL migrations in `supabase/migrations`.
7. Run `supabase/seed.sql` after at least one teacher or admin profile exists if you want seeded courses to receive a `teacher_id`.
8. Enable Auth providers for email/password in Supabase Auth settings.
9. Create Storage buckets before wiring uploads:
   - `course-covers`
   - `resources`
   - `uploads`
10. Add or review Row Level Security policies before exposing authenticated data.

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
