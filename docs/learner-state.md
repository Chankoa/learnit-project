# Learner state and learning engine

Sprint 5 makes Supabase the source of truth for the learner journey when `NEXT_PUBLIC_DATA_SOURCE=supabase`.

## Tables used

- `enrollments`
  - one row per learner/course
  - `unique (user_id, course_id)` prevents duplicate enrollments
  - stores `status`, `current_lesson_id`, `started_at`, `completed_at`, `last_accessed_at` and `learning_time_minutes`
- `lesson_progress`
  - one row per learner/lesson
  - `unique (user_id, lesson_id)` makes progress idempotent
  - stores `completed`, `completed_at`, `created_at`, `updated_at` and `learning_time_minutes`
- `notes`
  - one row per learner/lesson
  - currently used by lesson notes
- `favorites`
  - one row per learner/resource
  - currently used by learner resources

No new table is required for Sprint 5.

## Lesson progress model

The current schema reuses the existing `lesson_progress` table instead of adding a status enum.

Application status is derived as:

- no row: `not_started`
- row exists and `completed = false`: `in_progress`
- row exists and `completed = true`: `completed`

`lesson_progress.created_at` is treated as the lesson `started_at` timestamp. It is written only when the row is first created and is not overwritten on later visits.

## Course progress

Course progress is derived in `lib/learning-service.ts`:

```txt
completed accessible lessons / total accessible lessons
```

The percentage is not stored in the database.

Locked lessons are excluded from the progress denominator. Completed progress rows for inaccessible lessons are ignored in the percentage calculation.

## Resume logic

The resume target is computed in this order:

1. `enrollments.current_lesson_id` if it is accessible and not completed.
2. latest non-completed `lesson_progress` row by `updated_at`.
3. first accessible lesson without completed progress.
4. last accessible lesson when the course is complete.

The CTA label is:

- `Commencer` for `not-started`
- `Continuer` for `in-progress`
- `Revoir` for `completed`

## Lesson navigation

Sprint 8.2 corrige la navigation haute des leçons.

- Le breadcrumb d'une leçon pointe directement vers `/app/learner` pour **Espace apprenant**.
- Le libellé haut de `LearningShell` est également un lien vers `/app/learner`.
- Le retour à la formation reste `/learn/[courseSlug]`.

Cette navigation ne dépend pas de `history.back()`.

## RLS

The learner state tables use `user_id = auth.uid()` policies:

- learners can read and write their own enrollments
- learners can read and write their own lesson progress
- learners can read and write their own notes
- learners can read and write their own favorites

The learner repository uses the authenticated server-side Supabase client. It does not use `SUPABASE_SERVICE_ROLE_KEY`.

## Current limits

- Exercise submissions and certificates are not implemented in Sprint 5.
- Resource rows are not seeded in the current Supabase dataset, so favorites can remain empty.
- The historical localStorage learner components remain in the codebase for demo compatibility but are no longer used by the Supabase learner pages.
