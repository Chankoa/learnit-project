import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const resolver = readFileSync(new URL("../lib/unified-course-workspace.ts", import.meta.url), "utf8");
const relations = readFileSync(new URL("../lib/unified-course-relations.ts", import.meta.url), "utf8");
const courseRoute = readFileSync(new URL("../app/app/courses/[courseSlug]/page.tsx", import.meta.url), "utf8");
const lessonRoute = readFileSync(new URL("../app/app/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx", import.meta.url), "utf8");
const exploreRoute = readFileSync(new URL("../app/app/explore/page.tsx", import.meta.url), "utf8");

test("canonical workspace resolves mode from enrollment and contextual capabilities", () => {
  assert.match(resolver, /const defaultMode: UnifiedCourseMode = canLearn \? "learn" : canEdit \? "edit" : "view"/);
  assert.match(resolver, /requestedMode === "edit" && defaults\.canEdit/);
  assert.match(resolver, /requestedMode === "learn" && defaults\.canLearn/);
  assert.match(resolver, /isPublic \|\| canLearn \|\| capabilities\.includes\("view"\) \|\| canEdit/);
});

test("primary app entry points target canonical course and lesson routes", () => {
  assert.match(relations, /\/app\/courses\/\$\{course\.slug\}\/lessons\/\$\{currentLesson\.slug\}\?mode=learn/);
  assert.match(relations, /\/app\/courses\/\$\{course\.slug\}\?mode=edit/);
  assert.match(exploreRoute, /`\/app\/courses\/\$\{course\.slug\}`/);
});

test("course and lesson routes keep learn and edit capability-gated in one workspace", () => {
  assert.match(courseRoute, /context\.mode === "edit"/);
  assert.match(courseRoute, /TeacherCourseBuilder/);
  assert.match(courseRoute, /UnifiedCourseOverview/);
  assert.match(lessonRoute, /!context\.canLearn \|\| lesson\.status === "locked"/);
  assert.match(lessonRoute, /UnifiedCourseModeSwitch/);
  assert.match(lessonRoute, /LearnerLessonWorkspace/);
  assert.match(lessonRoute, /TeacherCourseBuilder/);
});

test("edit mutations preserve the canonical route without weakening server authorization", () => {
  const actions = readFileSync(new URL("../app/app/teacher/courses/actions.ts", import.meta.url), "utf8");
  const service = readFileSync(new URL("../lib/teacher-service.ts", import.meta.url), "utf8");
  assert.match(actions, /withParams\(`\/app\/courses\/\$\{canonicalCourseSlug\}`/);
  assert.match(service, /requireRole\("teacher"/);
  assert.doesNotMatch(resolver, /profile\.role === "teacher"/);
});
