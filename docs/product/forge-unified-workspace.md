# Sprint 10.U1 - Forge Unified Workspace

## Decision

Forge evolves toward one workspace organized around a **Parcours**, not separate Learner and Teacher identities. A person may learn from one Parcours, own another, edit a third, and contribute to a fourth. The available actions depend on their relation to the current object.

This is an architecture and product decision only. It does not rename `courses`, remove existing routes, alter RLS, or replace `profiles.role`.

## Existing audit

| Area | Current distinction | Classification | Direction |
| --- | --- | --- | --- |
| Profile and session | `profiles.role` is `learner`, `teacher`, or `admin`; signup and `requireRole` redirect to a role home | Transitional authorization | Keep while contextual access is introduced. `admin` remains global. |
| App shells and navigation | Learner and Teacher layouts call `requireRole`; `lib/navigation.ts` exposes two separate nav trees | LMS UI inheritance | Replace progressively with a navigation built from available capabilities. |
| Learning | `enrollments`, `lesson_progress`, notes, favorites, lesson completion and the `/learn` reading experience | Domain distinction | Preserve as pedagogical state. It is not a user identity. |
| Course ownership | `courses.teacher_id`, authoring repositories, course sources and builder controls | Domain distinction, currently single-owner | Evolve to contextual ownership/editorial membership without removing `teacher_id` first. |
| Authoring | Creation, cockpit, builder, sources, publication and Forge proposals live under `/app/teacher` | LMS UI inheritance around real editorial operations | Expose the same operations from a Parcours workspace when authorized. |
| Learner routes | `/app/learner`, courses, progress, resources, certificates and `/learn/[slug]` | Mixed | Retain reading/progress flows; converge labels and entry points later. |
| Teacher routes | `/app/teacher`, courses, create, Forge, edit, builder, preview, enrollments | Mixed | Retain all deep links; introduce canonical aliases only after membership is live. |
| Student follow-up | Teacher reads enrolled learner profiles and course progress | LMS capability | Retain as a scoped audience/follow-up capability, not as an identity boundary. |
| Forge AI | Teacher and learner prompt families share `ai_generations`, but policies and UI distinguish roles | LMS UI inheritance | Make the active object, selected content and capabilities the contract. |
| Admin | Global user, domain and publication governance | Domain distinction | Keep separate from course memberships. Some Admin screens are fixture-backed and are not a source of product truth. |

### Current route map

| Intent | Existing stable routes |
| --- | --- |
| Learn and read | `/app/learner`, `/app/learner/courses`, `/app/learner/progress`, `/app/learner/resources`, `/learn/[courseSlug]`, `/learn/[courseSlug]/[lessonSlug]` |
| Create and edit | `/app/teacher`, `/app/teacher/courses`, `/app/teacher/courses/new`, `/app/teacher/courses/forge`, `/app/teacher/courses/[courseId]/edit`, `/builder`, `/preview` |
| Follow enrolled people | `/app/teacher/students`, `/app/teacher/courses/[courseId]/enrollments` |
| Global administration | `/app/admin/...` |

The real business distinctions are: pedagogical enrollment and progress, object ownership, scoped collaboration, object visibility, and global administration. The split navigation, role-specific home redirects, route families, duplicated workspace framing and role-conditioned AI language are inherited LMS presentation choices.

## Central object: Parcours

**Parcours** is the canonical French product term for the structured knowledge object represented today by `courses`. It can be consulted, followed, created, enriched, remixed, shared and published. It may later be a formation, an atelier, a reference path, a curated collection, or another structured unit of knowledge. It is not assumed to be linear in every future use case.

The physical table, service names, identifiers and URLs remain `courses`, `courseId` and existing slugs in this sprint. "Formation" remains appropriate in public catalog, institutional and publication contexts while the present model is course-oriented.

## Forge verbs

| Verb | Meaning | Persistent effect | Minimum authorization |
| --- | --- | --- | --- |
| Consult | Read accessible content without starting a learning relation | None | `can_view` |
| S'inscrire / suivre | Establish a durable pedagogical relationship | Enrollment and later progress/activity | `can_enroll` |
| Apprendre | Intentionally use the Parcours pedagogically | Progress, notes and learning activity when opted into | `can_learn` plus enrollment |
| Créer | Start a new Parcours from an intention or blank structure | New draft owned by its creator | Product-level create entitlement, not a course role |
| Réutiliser | Include a resource or fragment in another context | Reference/provenance record when material | `can_reuse` on source plus edit on destination |
| Remixer | Create a separate derived object with its own lifecycle | New Parcours and derivation link | `can_remix` plus create entitlement |
| Contribuer | Propose a change to an existing object without changing it directly | Contribution and review state | `can_propose` |
| Partager | Change discoverability or grant access | Visibility or invitation/membership | `can_manage_members` or sharing capability |
| Communiquer | Start or participate in discussion tied to an object | Contextual thread/messages | `can_comment` on target |
| Modifier | Directly alter an object | Audited object mutation | `can_edit` |
| Publier | Make a revision publicly or otherwise broadly available | Publication transition | `can_publish` |

### Reuse, remix and contribution

| Action | Original changes? | New lifecycle? | Review required? | Provenance |
| --- | --- | --- | --- | --- |
| Réutiliser | No | No; destination keeps its lifecycle | No by default | Reference to source object/fragment where significant |
| Remixer | No | Yes; a new Parcours or resource is created | No on source, subject to license/policy | Required derivation relationship |
| Contribuer | No until accepted | No; proposal belongs to original's review flow | Yes | Proposal author, target and resulting revision |

Direct editing must never be presented as contribution. A contributor creates a reviewable proposal; an editor or owner decides whether it changes the original.

## Unified navigation

The target information architecture is intent-first. It must show only destinations and actions that the signed-in user is entitled to use.

```text
Accueil
Mes parcours
Explorer
Contributions
Ressources
Activité
Profil

Créer (global CTA when authorized)
Administration (global capability only)
```

`Mes parcours` is the main personal view, not a dashboard of every metric. It aggregates real relations and uses filters:

```text
Tous | J'apprends | Je crée | Je contribue | Partagés avec moi | Brouillons | Terminés
```

Favorites and recent activity are secondary sorting or lightweight filters. A Parcours can appear in several filters without being duplicated in data: an owner may also have an enrollment and therefore learn from their own material.

## Canonical workspace

The canonical object workspace is:

```text
Parcours | Contenu | Forge
```

The content surface remains dominant. The surrounding panels are contextual and capability-aware.

| Relation | Surface and actions |
| --- | --- |
| Viewer | Read Parcours and content; access available resources; no learning state by default. |
| Learner | Viewer actions plus enroll, progress, notes and pedagogical Forge help. |
| Contributor | Learner/viewer actions plus propose an improvement or source. |
| Editor | Contributor actions plus modify content and structure. |
| Owner | Editor actions plus sources, members, sharing and publication. |

On desktop, the Parcours panel and Forge can be persistent or collapsible when reading width stays sufficient. On tablet they become temporary drawers. On mobile, content is full width; Parcours and Forge open as distinct drawers, and editing actions are contextual rather than a second toolbar.

### Read and edit modes

`Contenu` opens in read mode. An authorized person sees a compact `Modifier` action; activating it enters explicit edit mode. The reading experience must not display editorial controls to a learner or viewer. Edit mode uses the existing structure/editor patterns and retains visible draft, saving and publication states.

This preserves the current design principles: reading remains calm and legible; authoring can be denser and decision-oriented. The shared AppShell, rails/drawers, headers, breadcrumbs, tabs, status badges, timelines, iconography, Forge panel and light/dark tokens should become permanent shared primitives.

## Contribution and communication direction

Contribution is deferred implementation, but its workflow is fixed:

```text
Read -> target a Parcours/module/lesson/resource -> propose improvement
     -> Forge assists within the target context -> preview diff -> submit
     -> owner/editor review -> accept, revise, or decline
```

A minimum contribution records: `id`, target type/id, author, proposed change, reason, status, reviewer, review note, submitted/reviewed timestamps, and the target revision/version observed. The accepted proposal records the resulting revision or mutation for traceability.

Communication begins as contextual discussions, not general direct messages. A thread is attached to a Parcours, module, lesson, resource or contribution. Forge may answer when the available context is sufficient; the person can then request community/creator review. A future `Activité` or `Messages` view aggregates these contextual threads without removing their original target.

## Sharing and visibility

Discoverability and permission are separate axes.

| Visibility | Discovery | Access |
| --- | --- | --- |
| `public` | Listed/discoverable according to publication status | Anyone may consult published material; additional capabilities remain scoped. |
| `unlisted` | Not listed or indexed | People with the link may consult if publication policy allows; it does not grant edit/member rights. |
| `private` | Never listed | Only an authorized membership, invitation or global admin access may read. |

An invitation creates or activates a membership. It is not an enrollment. An owner can share a private Parcours with an editor without enrolling them, and can enroll themselves without weakening access rules.

## Forge AI, sources and provenance

Forge is one contextual copilot. Its input contract is: active Parcours, module/lesson/resource target, selected passage where applicable, authorized sources, intent, and the resolved capabilities of the current user. It offers only actions permitted by those capabilities.

| Capability context | Forge actions |
| --- | --- |
| Learner | Explain, clarify, reformulate, illustrate, question, support reasoning. |
| Contributor | Learner actions plus formulate a proposal or source suggestion. |
| Editor | Contributor actions plus prepare edits and structure proposals. |
| Owner | Editor actions plus analyze readiness, publication and member-oriented workflows. |

Forge never publishes, edits, changes progress, accepts a contribution, or grants access by itself. It proposes; a server-authorized human action persists.

Sources are progressing toward shared objects with a scope: private working source, Parcours-linked source, reusable source, or contributed source. This sprint does not create a global library. The direction is to preserve source author, visibility, context and provenance before making sources broadly reusable.

Meaningful reuse and every remix need a lightweight provenance relation: original object, derived object, relation type, source author snapshot, source version if known, and timestamp. This is lineage, not a Git clone.

## Vocabulary

| Context | Canonical UI term | Keep technical/current term |
| --- | --- | --- |
| Central structured object | Parcours | `course`, `courses` |
| Institutional/catalog publication | Formation | existing public/catalog copy |
| Following a Parcours | S'inscrire, Suivre, Apprendre | enrollment |
| Personal aggregation | Mes parcours | learner/teacher course lists |
| Making a new object | Créer un parcours | Teacher creation routes |
| Direct editorial change | Modifier | builder/editor |
| Reviewed proposed change | Contribution / Proposer une amélioration | future contribution |
| Derivative independent object | Remix | future derivation |
| Attached material | Ressource | resources |
| AI working material | Source | course_sources |

## Risks and guardrails

| Risk | Guardrail |
| --- | --- |
| Too many visible capabilities | Render actions from the active context; group advanced owner actions; retain a calm read mode. |
| Confusing follow with contribute | Enrollment is pedagogical; contribution is a review workflow. Use separate CTAs and states. |
| Remix without attribution | Require provenance on remix creation and show lineage where material. |
| Permission creep | Capabilities are server-resolved; no client-supplied membership role; sensitive mutations remain explicit. |
| Social overload | Start with target-attached questions/discussions; no general inbox or feed first. |
| Lost pedagogical focus | Content and progression stay primary; Forge is optional and cannot validate learning. |
| Institutional LMS requirements | Preserve enrollment, progress, cohorts, publication, follow-up and future certification as workspace capabilities. |
| Fixture-backed expectations | Do not promote current simulated admin/student/certificate surfaces as completed product workflows. |

## Migration roadmap

| Phase | Scope | Compatibility rule |
| --- | --- | --- |
| U1 (this sprint) | Decision documents, vocabulary and target architecture | No runtime/schema/RLS change. |
| U2 | Add membership/capability schema, server resolver and backfill strategy | Keep `teacher_id`, enrollment, existing policies and role guards. |
| U3 | Introduce unified navigation and `Mes parcours` read model | Existing Learner/Teacher routes remain the destinations. |
| U4 | Create canonical Parcours workspace and read/edit mode | Alias or link from legacy cockpit/builder/learn routes; no deep-link breakage. |
| U5 | Contributions, provenance and contextual discussions | Add only after membership RLS and audit trail are proven. |
| U6 | Deprecate legacy role-specific entry routes after telemetry and migration | Redirect only when canonical equivalents preserve authorization and context. |

The immediate recommended sequence is U2 membership/capabilities, U3 navigation and Mes parcours, then U4 workspace convergence. U5 must not begin until authorization, source scope and provenance policy are implemented and tested.

## U2 implementation note

U2 adopts `participant` rather than `learner` for the contextual membership role. This keeps enrollment as the sole pedagogical relationship while leaving membership focused on access and collaboration. The first visible convergence is the unified `/app` shell and `Mes parcours`; legacy Learner and Teacher deep links remain supported.

### U2.C learning access

Learning is no longer a global Learner identity check on canonical paths. A person may own Parcours A and learn Parcours B from the same account when B is published and they hold an enrollment. Mes parcours resolves these as one relation per Parcours; an owner enrolled in the same Parcours sees both `Je crée` and `J'apprends`, with `Continuer` or `Revoir` taking priority over `Gérer`.

Explorer remains a discoverability surface for published public Parcours only. Its CTAs are relation-aware: enrolled people continue or review, editors manage, and everyone else consults the public formation page to enroll.