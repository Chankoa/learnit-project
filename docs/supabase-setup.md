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
4. Keep `NEXT_PUBLIC_DATA_SOURCE=mock` until a repository is explicitly migrated.
5. Enable Auth providers only when Sprint 27 starts.
6. Create Storage buckets before wiring uploads:
   - `course-covers`
   - `resources`
   - `uploads`
7. Add Row Level Security policies before exposing authenticated data.

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

## Current status

Sprint 26 only adds the Supabase client infrastructure and documentation.

The application still reads from mock repositories. No page should require a Supabase project while `NEXT_PUBLIC_DATA_SOURCE=mock`.
