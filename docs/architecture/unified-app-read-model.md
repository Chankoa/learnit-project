# Sprint 10.U2 - Unified App Read Model

## Scope

U2 adds a read-first foundation for `/app` and `/app/courses`. It does not replace legacy Learner or Teacher routes, migrate their RLS policies, or introduce contribution, invitations, discussions or remix workflows.

## Contextual role vocabulary

The persisted membership roles are `viewer`, `participant`, `contributor`, `editor` and `owner`.

`participant` replaces `learner` in membership vocabulary. It means a contextual relationship to a Parcours and may unlock future collaboration affordances. It does not record learning state. `enrollments` remains the sole pedagogical relation for starting, progress, notes, activity and completion.

The SQL capability resolver maps active membership roles to: `view`, `comment`, `propose`, `reuse`, `remix`, `edit`, `publish` and `manage_members`. Enrollment is intentionally absent from this list: it depends on course status, visibility and admission policy.

## Ownership compatibility

The migration backfills one active `owner` membership for each non-null `courses.teacher_id` with `ON CONFLICT DO NOTHING`. `teacher_id` remains the legacy ownership source and all existing Teacher RLS stays in place. The backfill does not create enrollments.

## Read model

`getUnifiedCourseRelations(profile)` reads accessible courses, current-user memberships, enrollments and lesson progress. It produces one `UnifiedCourseRelation` per course ID:

- `memberships`: active contextual roles;
- `isLegacyOwner`: `courses.teacher_id` matches the profile;
- `enrollment`: existing pedagogical state, when present;
- `progress` and `lastActivityAt`: derived from real enrollment/progress values;
- `capabilities`: resolved from active role mapping, ownership fallback or global admin;
- `primaryLabel`/`primaryHref`: `Continuer`, `Gérer`, or `Consulter`.

Ownership, membership and enrollment join into one record before rendering. Consequently an owner enrolled in their own Parcours receives one card with both `Je crée` and `J'apprends` metadata.

Queries are bounded: courses, enrollments and memberships load concurrently; progress is fetched once for the returned course IDs. Rendering does not fetch per card.

## Unified routes

| Route | Behavior |
| --- | --- |
| `/app` | Authenticated home with real resume priority, compact personal list and honest collaboration entry. |
| `/app/courses` | Deduplicated personal Parcours list. Filters appear only where a real relation exists. |
| `/app/explore` | Existing public catalog rule: published plus public only. |
| `/app/collaborative` | Teacher follow-up/publication links when the user manages real courses; unavailable collaboration is marked `À venir`. |
| `/app/resources` | Resources from accessible personal Parcours. `resources` and Forge `course_sources` remain distinct. |
| `/app/profile` | Existing profile behavior in the unified shell; compatibility role remains secondary. |

The `Créer` entry deliberately reuses `/app/teacher/courses/new`. The full Parcours workspace is deferred to the next sprint.

## RLS status

`course_memberships` allows users to read their own rows and global admins to read rows. There is no authenticated insert, update or delete policy, so U2 clients cannot self-assign or promote roles. Invitations and member management are deferred.

Legacy course, enrollment, progress, resource and source policies remain authoritative. The private `has_course_capability()` helper is added for future, individually tested policy migrations; U2 does not change the current L3/L3.RLS access behavior.

## Mobile navigation decision

U2 retains the shared header and drawer rather than adding a bottom navigation. This prevents duplicate destinations and keeps the seven-item navigation reachable with accessible labels, Escape close and focus return. The existing rail remains collapsible on desktop and the shared drawer is used below its responsive breakpoint.