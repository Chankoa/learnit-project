# U5.3 canonical journey handoff

## Delivered

- `CanonicalCourseWorkspace` is the shared spatial shell for canonical Learn and Edit: one topbar, one collapsible Parcours rail, central content slot and shared Forge rail.
- `TeacherAuthoringWorkspace` is now a compatibility adapter that retains only the authoring surface provider around that shell.
- Learn no longer renders a second course-management navigation. The compact Learn/Edit switch remains only when both capabilities exist.
- Overview retains the learning CTA as primary and exposes edit as a capability-gated secondary action. Course-level management navigation is limited to overview, publication and participants.
- Explorer uses the existing enrollment server action, returns to the canonical overview after success, and preserves owner editing as a secondary action without requiring an enrollment.
- Forge slots use stable course/module/lesson keys to avoid replacing conditional child trees under a shared identity.

## Security and data boundaries

- No resolver, RLS, ownership, enrollment rule, capability mapping, mutation authorization, database schema, or Forge provider contract changed.
- Enrollment still goes through `enrollAction` and the existing learning service.
- No canonical user flow links to `/app/teacher` or `/app/learner`.

## Validation

- `npm run config:check`: PASS, with the existing legacy-alias warning for `AI_API_KEY` / `AI_MODEL`.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `npx tsx --test tests/*.test.ts`: PASS, 86 tests.
- `git diff --check`: PASS.

## Smoke boundary

No shared authenticated browser session is available. Smoke validation of canonical Overview -> Learn -> Edit -> Learn, publication, participants, responsive drawers and Dark mode is `AUTH SESSION REQUIRED`; no credentials were requested.

## Turbopack

The reported `The children should not have changed if we pass in the same set.` warning was not reproduced in the available public smoke. Its authenticated navigation path was unavailable, so status remains `NOT REPRODUCED`, not resolved.

## Remaining debt

- Complete authenticated visual smoke at 1440, 1280, 900, 768 and 390 px in Light and Dark.
- Verify live Forge provider behavior separately; this sprint preserved provider contracts and used no provider smoke.
- Invitations, comments, collaboration, remix and secure owner-course deletion remain out of scope and unimplemented.