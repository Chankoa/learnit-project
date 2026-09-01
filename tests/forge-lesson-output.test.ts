import assert from "node:assert/strict";
import test from "node:test";

import {
  getLessonGenerationGuidance,
  getLessonGenerationReasoningEffort
} from "../lib/forge-ai/lesson-generation-policy";
import { getMaxOutputTokens } from "../lib/forge-ai/token-budget";
import { validateForgeLessonContentProposal } from "../lib/forge-ai/validation";

const validLessonProposal = {
  estimatedMinutes: 40,
  furtherReading: "",
  intro: "Une introduction concise.",
  keyTakeaways: ["Retenir le principe essentiel"],
  objectives: ["Appliquer la méthode"],
  practice: "Mettre la méthode en pratique sur un cas simple.",
  sections: [{
    callout: "",
    calloutType: "none",
    code: "",
    codeLanguage: "",
    content: "Une explication structurée et exploitable.",
    example: "",
    title: "Comprendre la méthode"
  }],
  sourceReferences: [],
  summary: "Une proposition structurée.",
  title: "Leçon test"
};

test("keeps action-specific lesson output budgets under the global cap", () => {
  assert.equal(getMaxOutputTokens("lesson_generate", 4000), 3600);
  assert.equal(getMaxOutputTokens("lesson_improve", 4000), 3000);
  assert.equal(getMaxOutputTokens("lesson_generate", 2400), 2400);
});

test("uses low reasoning only for GPT-5 lesson generation and improvement", () => {
  assert.equal(getLessonGenerationReasoningEffort("lesson_generate", "gpt-5-mini"), "low");
  assert.equal(getLessonGenerationReasoningEffort("lesson_improve", "gpt-5.4"), "low");
  assert.equal(getLessonGenerationReasoningEffort("lesson_summary", "gpt-5-mini"), undefined);
  assert.equal(getLessonGenerationReasoningEffort("lesson_generate", "gpt-4.1-mini"), undefined);
});

test("bounds generation depth from lesson duration", () => {
  const shortGuidance = getLessonGenerationGuidance("generate", 20);
  const mediumGuidance = getLessonGenerationGuidance("generate", 40);
  const longGuidance = getLessonGenerationGuidance("generate", 90);

  assert.ok(shortGuidance);
  assert.ok(mediumGuidance);
  assert.ok(longGuidance);
  assert.match(shortGuidance, /2 à 3 sections courtes/);
  assert.match(mediumGuidance, /3 à 4 sections/);
  assert.match(longGuidance, /4 à 5 sections/);
  assert.match(mediumGuidance, /complète mais concise/);
});

test("prevents improvement prompts from inflating existing content", () => {
  const guidance = getLessonGenerationGuidance("improve", 40);

  assert.ok(guidance);
  assert.match(guidance, /longueur comparable/);
  assert.match(guidance, /ne duplique pas/);
  assert.match(guidance, /n'allonge pas systématiquement/);
});

test("does not change the prompt policy of unrelated lesson actions", () => {
  assert.equal(getLessonGenerationGuidance("summary", 40), undefined);
  assert.equal(getLessonGenerationGuidance("exercise", 40), undefined);
});

test("keeps the strict lesson proposal contract and required fields", () => {
  const proposal = validateForgeLessonContentProposal(validLessonProposal);

  assert.equal(proposal.title, "Leçon test");
  assert.equal(proposal.sections.length, 1);
  assert.match(proposal.contentMarkdown, /Comprendre la méthode/);
  assert.throws(
    () => validateForgeLessonContentProposal({ ...validLessonProposal, intro: "" }),
    /introduction manquant/
  );
});
