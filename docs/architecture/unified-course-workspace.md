# Unified Course Workspace

## Status

Sprint 10.U3 introduces the authenticated canonical Parcours workspace while preserving every legacy route. The implementation composes the existing learning and authoring engines; it does not duplicate their persistence or Forge services.

## Canonical routes

| Route | Purpose |
| --- | --- |
| `/formations/[slug]` | Public, indexable acquisition and discovery surface. |
| `/app/courses/[courseSlug]` | Authenticated canonical overview, enrollment and course mode entry. |
| `/app/courses/[courseSlug]/lessons/[lessonSlug]` | Authenticated canonical lesson. |
| `/learn/...` | Legacy learning route retained for compatibility. |
| `/app/teacher/...` | Legacy authoring, publication and participant routes retained for compatibility. |

Main `/app`, Mes parcours, Explorer and post-creation entry points now target the canonical routes. Public pages remain separate and can send an authenticated person into the canonical workspace.

## Context resolver

`getUnifiedCourseContext(courseSlug, requestedMode)` is the server resolver for a workspace request. It combines:

- the RLS-readable course and structure;
- the current enrollment and progress;
- active course memberships;
- legacy ownership compatibility;
- global administration;
- the resolved course capabilities.

It returns course state, relation labels and explicit `canView`, `canEnroll`, `canLearn`, `canEdit`, `canPublish` and `canManageMembers` decisions. Components consume these server decisions rather than inferring permissions locally. Until editorial RLS is expanded, the resolver intersects edit, publication and participant-management membership capabilities with the existing Teacher/Admin server guard; learning remains role-neutral.

## Modes

The URL carries `?mode=learn`, `?mode=edit` or `?mode=view`.

Default mode:

1. an enrolled person opens Learn, including an owner enrolled in their own course;
2. an editor/owner without enrollment opens Edit;
3. an authenticated public viewer opens View.

An unsupported requested mode never grants a capability. For example, forcing `?mode=edit` falls back to Learn or View unless the resolver returns `canEdit`.

The current production authoring repository remains owner-scoped through `courses.teacher_id` and its existing server guards. Membership-based editor mutations require a dedicated RLS/repository migration before invitations become a live workflow; U3 does not weaken those policies.

## Public and authenticated split

- Published public course, no relation: overview and enrollment in the canonical workspace.
- Published enrolled course, including unlisted/private: learning workspace, progress, notes, resources and Forge learning.
- Draft owner: edit workspace.
- Draft enrolled-only or private outsider: unavailable through RLS and the canonical guard.

Enrollment refreshes the same canonical overview. It does not require a detour through `/learn`.

## Composition

The canonical lesson composes existing, tested building blocks:

- `CourseOutlineRail` / `LessonSidebar` for Parcours navigation;
- `LessonHeader`, `MarkdownLessonContent`, resources, completion, notes and next/previous navigation;
- `LearnerLessonWorkspace` and the existing source-aware Forge learning service;
- `TeacherCourseBuilder`, Teacher Server Actions and Forge authoring in Edit mode;
- `UnifiedCourseModeSwitch` for an explicit owner-plus-enrollment choice.

Forge changes family with the explicit mode: pedagogical support in Learn and authoring proposals in Edit. The two action families are never rendered together.

## Navigation and legacy bridges

The normal authenticated entry points use canonical URLs. Legacy routes are not deleted or forcibly redirected in U3, so saved links, publication correction links and rollback remain safe. Authoring mutations invoked from the canonical builder receive a canonical return destination and revalidate both route families.

Publication, preview and participant management continue to use their existing contextual sub-routes. They are capabilities of the Parcours, not permanent workspace columns.

## Security

- The visual mode is client-visible but never an authorization grant.
- Course visibility, enrollment and membership reads remain enforced by RLS.
- Learning mutations keep their current-user enrollment checks.
- Authoring mutations retain `requireRole("teacher")`, owner-scoped repository queries and RLS.
- U3 adds no migration and changes no provider, storage or AI persistence contract.

## Responsive and accessibility

The canonical lesson reuses the validated lesson focus layout: Parcours and Forge are persistent only when reading width allows it, then become drawers. Drawers retain Escape, focus return and focus trapping. The content remains the primary surface; mobile has no permanent rail.

The mode switch is keyboard-addressable, visible, URL-addressable and uses `aria-current`. Light and Dark share DS1 tokens.
