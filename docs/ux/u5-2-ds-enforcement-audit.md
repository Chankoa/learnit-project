# U5.2 DS enforcement audit

## Scope and authority

This audit preserves the U5/U5.1 worktree and applies the unified-workspace, contextual-capabilities and DS 1.1 contracts. No resolver, RLS, ownership, enrollment, capabilities, or Forge provider contract was changed.

## User Journey matrix

| Screen | Structure | DS | Fonctionnel | Responsive | Dark | Etat |
| --- | --- | --- | --- | --- | --- | --- |
| 00 Public Home | PASS | PASS | PASS | PASS | PASS | PASS |
| 01 Workspace | PARTIAL | PARTIAL | PARTIAL | AUTH SESSION REQUIRED | AUTH SESSION REQUIRED | PARTIAL |
| 02 Mes parcours | PARTIAL | PARTIAL | PARTIAL | AUTH SESSION REQUIRED | AUTH SESSION REQUIRED | PARTIAL |
| 03 Overview | PASS code | PARTIAL | PASS code | AUTH SESSION REQUIRED | AUTH SESSION REQUIRED | PARTIAL |
| 04 Learn | PASS code | PARTIAL | PASS code | AUTH SESSION REQUIRED | AUTH SESSION REQUIRED | PARTIAL |
| 05 Edit | PASS code | PARTIAL | PASS code | AUTH SESSION REQUIRED | AUTH SESSION REQUIRED | PARTIAL |
| 06 Publication | PASS code | PARTIAL | PASS code | AUTH SESSION REQUIRED | AUTH SESSION REQUIRED | PARTIAL |
| 07 Participants | PASS code | PARTIAL | PASS code | AUTH SESSION REQUIRED | AUTH SESSION REQUIRED | PARTIAL |
| 08 Responsive/Dark | Public PASS | Public PASS | N/A | Public PASS at 1440/1280/900/768/390 | Public PASS | PARTIAL |

`PASS code` means the component and contract tests were verified; it is not a claim of authenticated browser observation.

## Verified DS enforcement

- `CanonicalCourseTopbar` is the shared semantic topbar primitive for Learn and Edit.
- `CourseContextNavigation` has fixed positions for Vue d'ensemble, Apprendre, Modifier, Publication and Participants. Availability remains capability-gated.
- Participants is a canonical course-context surface rather than a generic standalone page.
- Forge remains shared by `ContextualForgeRail`, with shared header, close/expand affordances, drawer focus lifecycle and DS surface token.
- The legacy module-title link and redundant public Workspace CTA were removed.
- New U5.2 styles use DS semantic tokens only.

## Required authenticated smoke

1. Log into a normal local test account, then check each 01--08 surface in Light and Dark.
2. Check overview -> learn -> edit -> learn navigation after hard refresh.
3. Check Structure and Forge drawers at 900, 768 and 390 px: focus trap, Escape, scroll lock and focus return.
4. Check real publication, enrollment and participant counts according to the available course capabilities.

## Turbopack status

The reported `The children should not have changed if we pass in the same set.` error was not reproduced on the public hard-refresh path. The authenticated mode-navigation path could not be exercised because the shared browser session redirects to login. Status: `NOT REPRODUCED`.