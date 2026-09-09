# U5.2 handoff

## Components factorized

- `components/app/CanonicalCourseTopbar.tsx`: shared semantic topbar container used by canonical Learn and Edit shells.
- `components/app/CourseContextNavigation.tsx`: course-mode navigation with capability-gated entries, including Learn.
- `components/app/ContextualForgeRail.tsx`: retained as the common Forge lifecycle and header primitive.

## Existing components retained

- `LearningShell` continues to own pedagogical content, notes, progress and its mobile parcours drawer.
- `TeacherAuthoringWorkspace` continues to own authoring structure, secure existing forms, desktop Forge resize and mobile drawers.
- `UnifiedCourseOverview` continues to own real course metrics, program and publication surface.
- `CanonicalPublicationPanel` continues to own confirmed publish/unpublish and public link copy.

## Completed

- Added the shared course topbar primitive to Learn and Edit.
- Made contextual navigation invariant across View, Learn, Edit, Publication and Participants when capabilities allow it.
- Brought Participants into the canonical course context.
- Removed redundant public and editorial CTAs.
- Preserved public deterministic preview to `/app/create` intent continuity.

## Debt

- Authenticated visual smoke remains required for screens 01--08, responsive drawers and Dark mode.
- The reported Turbopack children error is not reproduced publicly but has not been exercised through authenticated mode navigation.
- Invitations, comments, collaboration and remix remain deferred. Owner-course deletion remains deferred because secure complete cleanup is not implemented.

## Forge provider

The public preview is deterministic and local. No real Forge provider call was tested in this UI/DS pass; Forge provider contracts and server actions were not changed.

## Validation

- `npm run typecheck`: PASS after U5.2 changes.
- U5 targeted tests: PASS, 13 tests.
- Public browser hard refresh: PASS, no page errors and no horizontal overflow.
- Full build/test/config validation must be rerun after the final documentation changes before any commit.