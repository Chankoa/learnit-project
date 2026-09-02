# Sprint 10.L3 — Learner Lesson Workspace + Forge Copilot

## Architecture audit

The existing lesson route already provided the required learning context through `getLearningCourseState`, an enrolled-learner guard, a persistent desktop `LessonSidebar`, and a mobile course drawer in `LearningShell`. The Teacher Forge provider, strict structured-output handling, generation log, retrieval service, feedback primitives, and DS 1.1 tokens were reusable.

Teacher proposal/apply controls were deliberately not shared: a Learner response explains and questions; it never mutates course content.

## Workspace

Desktop follows `Parcours | Contenu | Forge`. Content remains the dominant column. Forge is a collapsible right panel on large screens and an overlay drawer at 1100 px and below. At 980 px and below, Parcours also remains available only through its existing drawer. No panel reserves width while closed.

The visual calibration follows:

- `docs/design/learner-teacher-convergence-reference.png` for the three-zone grammar;
- `docs/design/ds-1.1-reference-light.png` and `docs/design/ds-1.1-reference-dark.png` for hierarchy and panel density;
- DS 1.1 semantic tokens as the normative implementation.

## Learner context

Every request is rebuilt server-side from authoritative data:

- enrolled course id/title;
- module id/title;
- accessible lesson id/title, type, description, objectives, duration and current content;
- lesson position in the ordered course;
- ready course sources only.

The client sends only `courseId`, `lessonId`, the selected action, and an optional question (600 characters maximum). Enrollment and locked-lesson checks run again in the Server Action path.

## Actions and output

One structured contract supports six prompt types:

- `learner_explain`;
- `learner_clarify`;
- `learner_rephrase`;
- `learner_example`;
- `learner_question`;
- `learner_freeform`.

The five visible shortcuts are Expliquer, Clarifier, Reformuler, Donner un exemple and Me questionner. A separate form handles a free question. The response contains a concise answer, optional example, optional comprehension question, and validated source references.

## Pedagogical guardrails

The system prompt requires “understand before answering”. Requests for a completed exercise, assessed answer, or copy-ready deliverable receive a reformulation, hint, method, or guiding question instead of a final solution. Lesson and source content are treated as untrusted contextual data and cannot override system rules.

The copilot never updates progress, notes, lessons, exercises, or course records.

## Provider and budgets

The existing `getForgeAIProvider()` path remains the source of truth. AI SDK, `openai-compatible`, OpenAI, and mock modes use the same strict JSON schema and application validation.

Budgets are intentionally below Teacher generation budgets:

| Action | Max output tokens |
| --- | ---: |
| Questionner | 600 |
| Clarifier / Reformuler | 700 |
| Expliquer / Exemple | 800 |
| Question libre | 900 |

GPT-5-family models use low reasoning effort for these bounded actions.

## Sources and persistence

The migration `20260902090000_learner_forge_copilot.sql` adds no table. It:

- allows enrolled Learners to read only ready sources for their course;
- allows the corresponding private source files to be read server-side;
- extends the existing prompt-type constraint;
- permits Learners to insert/read their own generation metadata;
- permits source links only when the generation belongs to the Learner and the source belongs to an enrolled course.

Only source ids explicitly returned by the validated model response and present in the retrieved context are written to `ai_generation_sources`.

## Errors, responsive and accessibility

Existing provider error codes are translated into calm, actionable Learner messages. Retry repeats only the last explicit action. Loading is announced with `aria-live` and `aria-busy`, disables actions, and prevents double submission.

The Forge drawer supports Escape, focus containment, trigger-focus restoration, body scroll locking, `100dvh`, safe-area insets, and 44 px controls. Light and dark use the same DS semantic tokens. Reduced-motion preferences are respected.

## Deferred

- reliable selected-text or active-section context;
- persistent conversation history and cross-device sessions;
- “Add to my notes” from a response;
- fine-grained citations to exact passages;
- richer orchestration or model routing;
- automatic assessment and scoring (intentionally excluded).

## Recommended 10.L4 direction

Validate the lesson workspace and copilot usage before expanding scope. A later sprint may improve lesson practice/progression and selected-passage context, but should preserve the non-persistent, course-bounded learning assistant model until source-level citation quality is proven.
