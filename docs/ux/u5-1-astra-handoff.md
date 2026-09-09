# U5.1 Astra recovery handoff

## Astra recovered

The uncommitted diff on `sprint-10-u5-unified-user-journey-ds` adds a deterministic public Forge preview, carries its validated intent to the existing creator URL, consolidates Learn/Edit Forge panels around `ContextualForgeRail`, and adds shared contextual course navigation. It updates public and workspace composition, overview links, authoring/learner shells, journey styling, and targeted continuity tests. No resolver, RLS, authorization, Forge mutation, or server-context file is changed by the recovery diff.

## Terra completed

- Verified the public preview in the browser: it is labelled as a deterministic, local structure and its Workspace CTA carries the encoded intent.
- Verified public responsive widths at 1440, 1280, 900, 768 and 390 px.
- Fixed a 390 px header overflow: the desktop login control now uses the explicit `site-header__login` responsive rule, avoiding a conflict between global button display and Tailwind's `hidden` utility.
- Verified the public page in Dark and Light theme modes with no horizontal overflow.
- Confirmed module title editing is available from a selected Structure module through the existing secured `updateTeacherModuleAction`.
- Confirmed `/app` redirects to login when no authenticated browser session is available; no authenticated smoke was attempted.

## Still open

- Authenticated visual smoke for Workspace, Mes parcours, course overview, Learn, Edit and Publication.
- Manual confirmation of Forge drawers and resize behavior in an authenticated browser session at 900, 768 and 390 px.

## User Journey matrix

| Screen | Structure | DS | Responsive | Dark | Functional |
| --- | --- | --- | --- | --- | --- |
| 00 Public Home | PASS | PARTIAL | PASS | PASS | PASS |
| 01 Workspace | PARTIAL | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | PARTIAL |
| 02 Create Intent | PARTIAL | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | PARTIAL |
| 03 Generated Path | PARTIAL | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | PARTIAL |
| 04 Mes parcours | PARTIAL | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | PARTIAL |
| 05 Course Overview | PARTIAL | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | PARTIAL |
| 06 Learn | PARTIAL | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | PARTIAL |
| 07 Edit | PARTIAL | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | PARTIAL |
| 08 Publication | PARTIAL | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | PARTIAL |

`PARTIAL` for authenticated screens means the route/component contract and targeted tests were inspected, not that the screen was browser-observed.

## Functional gates

| Gate | Status | Evidence |
| --- | --- | --- |
| Public preview | PASS | Browser-rendered deterministic preview with disclosure |
| Intention transfer | PASS | Browser CTA and targeted test preserve intent/format |
| Register/login next | PARTIAL | Redirect and safe-next unit coverage; authenticated completion not smoked |
| Create | PARTIAL | Existing creator URL contract tested; auth smoke pending |
| Publish | PARTIAL | Capability-gated contextual navigation tested; auth smoke pending |
| Explore | PARTIAL | Existing canonical route contract tested; auth smoke pending |
| Enroll | PARTIAL | Existing UI path retained; auth smoke pending |
| Learn | PARTIAL | Shared Forge lifecycle and route contracts tested; auth smoke pending |
| Learn <-> Edit | PARTIAL | Canonical mode and return-route tests pass |
| Forge Learn | PARTIAL | Shared lifecycle tests pass; auth smoke pending |
| Forge Edit | PARTIAL | Shared lifecycle tests pass; auth smoke pending |
| Overview navigation | PASS | Explicit overview links and capability gating tested |
| RLS unchanged | PASS | Recovery diff does not touch Supabase/RLS or authorization files |

## Manual validation needed

1. Log into the local browser session with a normal test account.
2. Smoke 01--08 at 1440, 900, 768 and 390 px, including theme switching.
3. Check real publication, enrollment, participant and authoring actions with their available capabilities.
4. Open/close Forge and Structure drawers with Escape/Tab, and resize desktop Forge in Learn/Edit.