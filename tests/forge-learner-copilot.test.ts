import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { getLessonGenerationReasoningEffort } from "../lib/forge-ai/lesson-generation-policy";
import { getMaxOutputTokens } from "../lib/forge-ai/token-budget";
import { validateLearnerForgeResponse } from "../lib/forge-ai/validation";

const promptSource = readFileSync(
  new URL("../lib/forge-ai/prompts.ts", import.meta.url),
  "utf8"
);
const serviceSource = readFileSync(
  new URL("../lib/forge-ai/service.ts", import.meta.url),
  "utf8"
);
const migration = readFileSync(
  new URL("../supabase/migrations/20260902090000_learner_forge_copilot.sql", import.meta.url),
  "utf8"
);
const hardeningMigration = readFileSync(
  new URL("../supabase/migrations/20260903092000_harden_learner_course_source_access.sql", import.meta.url),
  "utf8"
);
const roleNeutralMigration = readFileSync(
  new URL("../supabase/migrations/20260903110000_role_neutral_learning_access.sql", import.meta.url),
  "utf8"
);

test("Learner Forge uses short, action-specific budgets and low reasoning on GPT-5", () => {
  assert.equal(getMaxOutputTokens("learner_question", 4000), 600);
  assert.equal(getMaxOutputTokens("learner_explain", 4000), 800);
  assert.equal(getMaxOutputTokens("learner_freeform", 4000), 900);
  assert.equal(getLessonGenerationReasoningEffort("learner_rephrase", "gpt-5.4"), "low");
  assert.equal(getLessonGenerationReasoningEffort("learner_example", "gpt-4.1-mini"), undefined);
});

test("validates concise Learner output and rejects missing answers", () => {
  const value = validateLearnerForgeResponse({
    answer: "Commencez par identifier l'idée centrale.",
    checkQuestion: "Comment l'expliqueriez-vous ?",
    example: "Un exemple court.",
    sourceReferences: [{ excerpt: "Un passage.", label: "Guide", sourceId: "source-1" }]
  });

  assert.equal(value.answer, "Commencez par identifier l'idée centrale.");
  assert.equal(value.sourceReferences[0]?.sourceId, "source-1");
  assert.throws(
    () => validateLearnerForgeResponse({ answer: "", checkQuestion: "", example: "", sourceReferences: [] }),
    /réponse Learner/
  );
});

test("the prompt contract protects exercises and treats lesson sources as data", () => {
  assert.match(promptSource, /ne donne pas la solution finale/i);
  assert.match(promptSource, /réponse prête à copier/i);
  assert.match(promptSource, /Sources documentaires autorisées/);
  assert.match(promptSource, /ne modifie jamais le cours, la progression, les notes/i);
});

test("the service verifies enrollment and maps every Learner action", () => {
  for (const action of ["explain", "clarify", "rephrase", "example", "question", "freeform"]) {
    assert.match(serviceSource, new RegExp(`${action}: \\"learner_`));
  }
  assert.match(serviceSource, /requireLearningAccess\(\{ id: input\.courseId \}, "\/app"\)/);
  assert.match(serviceSource, /lesson\.status === "locked"/);
});

test("RLS only exposes ready sources for courses enrolled by the current Learner", () => {
  assert.match(migration, /extraction_status = 'ready'/);
  assert.match(migration, /enrollments\.user_id = \(select auth\.uid\(\)\)/);
  assert.match(migration, /public\.current_profile_role\(\) = 'learner'/);
  assert.match(migration, /Learners can insert own ai generation metadata/);
});

test("Learner course sources and Forge source references require published enrollment access", () => {
  assert.match(hardeningMigration, /private\.can_read_enrolled_published_course\(course_id\)/);
  assert.match(hardeningMigration, /private\.can_read_enrolled_published_course\(course_sources\.course_id\)/);
  assert.match(hardeningMigration, /Learners can read enrolled course source files/);
  assert.match(hardeningMigration, /Learners can create enrolled ai generation source refs/);
  assert.match(hardeningMigration, /Learners can read enrolled ai generation source refs/);
});

test("learning Forge policies are enrollment-based and cannot be bypassed by a Teacher profile", () => {
  assert.match(roleNeutralMigration, /private\.can_read_enrolled_published_course\(lessons\.course_id\)/);
  assert.match(roleNeutralMigration, /prompt_type not in \([\s\S]*?'learner_explain'/);
  assert.doesNotMatch(
    roleNeutralMigration.match(/Users can insert own learning ai generation metadata[\s\S]*?\);/)?.[0] ?? "",
    /current_profile_role\(\) = 'learner'/
  );
});
