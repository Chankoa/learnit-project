import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { getMockForgeRequestKind } from "../lib/forge-ai/mock-dispatch";

const provider = readFileSync(new URL("../lib/forge-ai/provider.ts", import.meta.url), "utf8");

test("mock dispatches lesson content with zero sources without selecting course improvement", () => {
  assert.equal(getMockForgeRequestKind("lesson_generate"), "lesson-content");
  assert.equal(getMockForgeRequestKind("lesson_improve"), "lesson-content");
  assert.equal(getMockForgeRequestKind("course_improvement"), "course-improvement");
  assert.match(provider, /switch \(getMockForgeRequestKind\(request\.promptType\)\)/);
  assert.match(provider, /case "lesson-content":\s+if \(isLessonContentInput\(request\.input\)\) return getMockLessonContentProposal/);
  assert.doesNotMatch(provider, /isCourseImprovement\(request\.input\)[\s\S]{0,160}getMockLessonContentProposal/);
});

test("lesson modes map to lesson content and preserve its source-reference path", () => {
  for (const promptType of ["lesson_generate", "lesson_improve", "lesson_expand", "lesson_examples", "lesson_exercise", "lesson_analyze"] as const) {
    assert.equal(getMockForgeRequestKind(promptType), "lesson-content");
  }
  assert.match(provider, /sourceReferences: \(input\.sourceIds \?\? \[\]\)\.slice\(0, 3\)/);
});

test("mock retains course improvement, revision, lesson suggestion, and learner dispatches", () => {
  assert.equal(getMockForgeRequestKind("course_improvement"), "course-improvement");
  assert.equal(getMockForgeRequestKind("course_analysis"), "course-revision");
  assert.equal(getMockForgeRequestKind("lesson_plan"), "lesson-suggestion");
  assert.equal(getMockForgeRequestKind("learner_explain"), "learner");
  assert.match(provider, /"brief" in input && "courseId" in input && "mode" in input/);
});