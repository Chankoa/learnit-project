# Backend implementation plan

LearnIt will move from a mock LMS prototype to a real Supabase-backed LMS in small, reversible steps.

## Principles

- Supabase is the primary V1 backend.
- Mock repositories remain the fallback until each domain is migrated.
- Pages should keep importing application helpers or repositories, not raw data files.
- Repository signatures should remain stable while implementations change.
- Netlify deployment must continue to use `npm run build`.
- Server-only data access should stay in Server Components, Server Actions or Route Handlers.

## Data source switch

`NEXT_PUBLIC_DATA_SOURCE` controls the active source:

- `mock`: read from existing files in `data/*`.
- `supabase`: read from Supabase repositories.

The default remains:

```env
NEXT_PUBLIC_DATA_SOURCE=mock
```

This avoids breaking demos while tables, RLS policies and auth flows are introduced.

## Repository migration order

1. Users and profiles
   - Create `profiles` linked to `auth.users`.
   - Store `role`, `status`, display name and avatar.
   - Keep `RoleSwitcher` as a demo fallback until real roles are available.

2. Courses, domains, modules and lessons
   - Migrate catalogue reads first.
   - Preserve current course, module and lesson types at the app boundary.
   - Keep MDX content paths until a content editor is selected.

3. Enrollments and progress
   - Replace local progress with Supabase rows per user and course.
   - Keep localStorage migration helpers for existing demo data.

4. Notes and favorites
   - Move lesson notes and resource favorites from localStorage to Supabase.
   - Keep offline-friendly local fallback only in demo mode.

5. Resources and Storage
   - Store metadata in `resources`.
   - Store files in Supabase Storage buckets:
     - `course-covers`
     - `resources`
     - `uploads`

6. Certificates
   - Generate certificate eligibility from progress.
   - Store issued certificates for auditability.

## Auth migration

Sprint 27 introduces real auth pages:

- sign in
- sign up
- sign out
- auth callback

Role resolution now uses:

1. Supabase Auth session.
2. `profiles.role`.
3. Demo role only for the visible RoleSwitcher when `NEXT_PUBLIC_DEMO_MODE=true`.

Authorization must be checked server-side for protected data. Client UI guards are useful for UX but are not security boundaries.

The app now uses two layers:

- `proxy.ts` redirects unauthenticated requests before protected app routes render.
- role layouts call `requireRole()` or `requireAdmin()` again as defense in depth.

## Row Level Security outline

RLS should be enabled before production data is added.

Initial policy direction:

- learners can read published courses, their enrollments, progress, notes, favorites and certificates.
- teachers can read and manage courses attached through `teacher_courses`.
- teachers can upload resources for their courses.
- admins can manage platform users, domains, courses and settings.
- public visitors can read published catalogue content only.

## Netlify considerations

Keep these deployment constraints:

- Do not require Supabase variables while `NEXT_PUBLIC_DATA_SOURCE=mock`.
- Add Supabase public variables in Netlify before enabling `supabase` mode.
- Keep private server keys out of `NEXT_PUBLIC_*`.
- Verify deep routes after each repository migration.
- Run `npm run build` before deployment.

## Current Sprint 26 scope

Completed scope for the first Supabase phase:

- install Supabase client packages.
- add browser and server client factories.
- document setup and migration strategy.
- keep mock repositories untouched.
- keep the app buildable without real Supabase credentials.

## Current Sprint 27-29 scope

Implemented in this phase:

- `/login`, `/register`, `/logout` and `/auth/callback`
- `getCurrentUser()`, `getCurrentProfile()`, `requireAuth()`, `requireRole()` and `requireAdmin()`
- server-side protection for `/app/learner`, `/app/teacher` and `/app/admin`
- targeted `proxy.ts` protection for direct refreshes on protected routes
- `/access-denied` for authenticated users without the right role
- SQL migrations for `profiles` and the minimal LMS schema
- seed script for the current mock formations

## Current Sprint 4 scope

Implemented read-only LMS access when `NEXT_PUBLIC_DATA_SOURCE=supabase`:

- public home catalogue, catalogue, domain, course and curriculum pages read `domains`, `courses`, `course_modules`, `lessons` and `resources` through server-side Supabase repositories
- database rows are mapped to the existing application types before reaching UI components
- mock remains the explicit source when `NEXT_PUBLIC_DATA_SOURCE=mock`

Certificates and advanced resource authoring remain mock/local until their dedicated migration sprints.

## Learner state migration

The learner state is now persisted when the application is configured for Supabase:

- `lib/repositories/supabase/learningRepository.ts` reads and writes `enrollments`, `lesson_progress`, `notes` and `favorites` with the authenticated server-side Supabase client.
- `lib/learning-service.ts` is the sole business layer for learner enrollment, progression, resume targets, totals, percentages, learning time and resource access.
- `/learn`, `/app/learner`, `/app/learner/courses`, `/app/learner/progress` and `/app/learner/resources` use this service rather than localStorage mocks.
- Client controls use Server Actions from `app/learn/actions.ts`; a client-provided user identifier is never trusted.

The existing RLS policies on these tables (`user_id = auth.uid()`) remain the authorization boundary. The service role key is not used for learner state.

Learning time is incremented in whole minutes when a learner leaves a lesson, and each recorded increment is capped at 120 minutes. Percentages are calculated in the service from completed lessons and are not persisted separately.

Resources marked `free` are visible to every learner; `enrolled` resources require an enrollment; `premium` resources are excluded. The current Supabase seed has no resource inserts, so the resource view stays empty until resources are seeded.

Certificates and deliverables remain out of scope and render as empty states. The legacy `/dashboard` route redirects to `/app/learner` so it cannot display an old local-progress view.

Still intentionally deferred:

- password reset flow
- admin UI for changing user roles
- file upload UI backed by Supabase Storage

## Teacher Studio migration

Teacher course authoring is now persisted when the application is configured for Supabase:

- `courses.teacher_id` is the ownership field.
- Course creation starts as `draft`, `private`, `preview`.
- Modules and lessons are edited through Server Actions and the Teacher repository.
- Publishing validates title, description, one module and one lesson before exposing the course as `published` and `public`.
- RLS requires both course ownership and `profiles.role = teacher` for Teacher write access.
- Lesson body content is stored in `lessons.content` for V1 text/markdown authoring.

Depublishing and Teacher-facing learner enrollment analytics are intentionally deferred until the enrollment visibility policy is defined.
