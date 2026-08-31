import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyStructuredFinishReason,
  describeStructuredOutput
} from "../lib/forge-ai/structured-output";
import {
  parseJsonObject,
  validateForgeCourseProposal
} from "../lib/forge-ai/validation";
import { getRuntimeConfig } from "../lib/config/runtime";

const validCourseProposal = {
  audience: "Débutants",
  level: "beginner",
  modules: [{
    description: "Comprendre les bases.",
    lessons: [{ estimatedMinutes: 30, objective: "Pratiquer", title: "Première leçon" }],
    title: "Fondamentaux"
  }],
  objectives: ["Comprendre"],
  prerequisites: [],
  sourceCount: 1,
  summary: "Un parcours progressif.",
  title: "Parcours test"
};

test("parses and validates a valid structured response", () => {
  const parsed = parseJsonObject(JSON.stringify(validCourseProposal));
  const validated = validateForgeCourseProposal(parsed);

  assert.equal(validated.title, "Parcours test");
  assert.equal(validated.modules[0]?.lessons[0]?.title, "Première leçon");
});

test("rejects invalid and empty JSON responses", () => {
  assert.throws(() => parseJsonObject(""), /Réponse IA invalide/);
  assert.throws(() => parseJsonObject("```json\n{}\n```"), /Réponse IA invalide/);
  assert.throws(() => parseJsonObject("[1, 2]"), /objet JSON/);
});

test("rejects an incorrect structure and a missing required business field", () => {
  assert.throws(() => validateForgeCourseProposal({ modules: "invalid" }), /module est requis/);
  assert.throws(
    () => validateForgeCourseProposal({ ...validCourseProposal, title: "" }),
    /titre manquant/
  );
});

test("classifies non-stop AI SDK finishes before output access", () => {
  assert.equal(classifyStructuredFinishReason("stop"), undefined);
  assert.deepEqual(classifyStructuredFinishReason("length"), {
    code: "output_token_limit",
    stage: "finish_reason"
  });
  assert.deepEqual(classifyStructuredFinishReason("content-filter"), {
    code: "response_refusal",
    stage: "finish_reason"
  });
  assert.deepEqual(classifyStructuredFinishReason("other"), {
    code: "response_incomplete",
    stage: "finish_reason"
  });
});

test("records only structural diagnostics, never generated values", () => {
  const diagnostic = describeStructuredOutput('{"title":"private value","modules":[]}');

  assert.deepEqual(diagnostic.keys, ["title", "modules"]);
  assert.equal(JSON.stringify(diagnostic).includes("private value"), false);
});

test("selects the configured provider without changing provider semantics", () => {
  const base = {
    AI_MODEL: "test-model",
    AI_API_KEY: "test-key",
    NEXT_PUBLIC_DATA_SOURCE: "mock"
  };

  assert.equal(getRuntimeConfig({ ...base, AI_PROVIDER: "ai-sdk" }).ai.provider, "ai-sdk");
  assert.equal(
    getRuntimeConfig({ ...base, AI_PROVIDER: "openai-compatible" }).ai.provider,
    "openai-compatible"
  );
});
