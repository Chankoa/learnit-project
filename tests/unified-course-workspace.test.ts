import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { buildCourseModeHref } from "../lib/course-mode-href";

const resolver = readFileSync(new URL("../lib/unified-course-workspace.ts", import.meta.url), "utf8");
const relations = readFileSync(new URL("../lib/unified-course-relations.ts", import.meta.url), "utf8");
const courseRoute = readFileSync(new URL("../app/app/courses/[courseSlug]/page.tsx", import.meta.url), "utf8");
const lessonRoute = readFileSync(new URL("../app/app/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx", import.meta.url), "utf8");
const exploreRoute = readFileSync(new URL("../app/app/explore/page.tsx", import.meta.url), "utf8");
const formationRoute = readFileSync(new URL("../app/formations/[slug]/page.tsx", import.meta.url), "utf8");
const authoringWorkspace = readFileSync(new URL("../components/app/TeacherAuthoringWorkspace.tsx", import.meta.url), "utf8");
const courseBuilder = readFileSync(new URL("../components/app/TeacherCourseBuilder.tsx", import.meta.url), "utf8");

test("canonical workspace resolves mode from enrollment and contextual capabilities", () => {
  assert.match(resolver, /const hasEditorialRole = profile\.role === "teacher" \|\| profile\.role === "admin"/);
  assert.match(resolver, /const canEdit = hasEditorialRole && capabilities\.includes\("edit"\)/);
  assert.match(resolver, /const defaultMode: UnifiedCourseMode = canLearn \? "learn" : canEdit \? "edit" : "view"/);
  assert.match(resolver, /requestedMode === "edit" && defaults\.canEdit/);
  assert.match(resolver, /requestedMode === "learn" && defaults\.canLearn/);
  assert.match(resolver, /isPublic \|\| canLearn \|\| capabilities\.includes\("view"\) \|\| canEdit/);
});

test("primary app entry points target canonical course and lesson routes", () => {
  assert.match(relations, /\/app\/courses\/\$\{course\.slug\}\/lessons\/\$\{currentLesson\.slug\}\?mode=learn/);
  assert.match(relations, /\/app\/courses\/\$\{course\.slug\}\?mode=edit/);
  assert.match(exploreRoute, /`\/app\/courses\/\$\{course\.slug\}`/);
  assert.match(formationRoute, /getUnifiedCourseContext\(course\.slug\)/);
  assert.match(formationRoute, /\/app\/courses\/\$\{course\.slug\}\/lessons\/\$\{context\.learning\.resumeLesson\.slug\}\?mode=learn/);
});

test("course and lesson routes keep learn and edit capability-gated in one workspace", () => {
  assert.match(courseRoute, /const nextPath = `\/app\/courses\/\$\{courseSlug\}\$\{requestedMode \? `\?mode=\$\{encodeURIComponent\(requestedMode\)\}` : ""\}`/);
  assert.match(lessonRoute, /buildCourseModeHref\(pathname, requestedMode\)/);
  assert.match(courseRoute, /context\.mode === "edit"/);
  assert.match(courseRoute, /TeacherCourseBuilder/);
  assert.match(courseRoute, /UnifiedCourseOverview/);
  assert.match(lessonRoute, /!context\.canLearn \|\| lesson\.status === "locked"/);
  assert.match(lessonRoute, /UnifiedCourseModeSwitch/);
  assert.match(lessonRoute, /LearnerLessonWorkspace/);
  assert.match(lessonRoute, /TeacherCourseBuilder/);
});

test("canonical mode href replaces mode without duplicating query parameters", () => {
  assert.equal(buildCourseModeHref("/app/courses/design/lessons/introduction?mode=learn", "edit"), "/app/courses/design/lessons/introduction?mode=edit");
  assert.equal(buildCourseModeHref("/app/courses/design/lessons/introduction?mode=edit", "learn"), "/app/courses/design/lessons/introduction?mode=learn");
  assert.equal(buildCourseModeHref("/app/courses/design/lessons/introduction?mode=view", "edit"), "/app/courses/design/lessons/introduction?mode=edit");
  assert.equal(buildCourseModeHref("/app/courses/design/lessons/introduction?lesson=42&mode=learn&tab=content", "edit"), "/app/courses/design/lessons/introduction?lesson=42&mode=edit&tab=content");

  const href = buildCourseModeHref("/app/courses/design/lessons/introduction?mode=learn?mode=edit", "learn");
  assert.equal(href, "/app/courses/design/lessons/introduction?mode=learn");
  assert.deepEqual(new URL(`https://learnit.test${href}`).searchParams.getAll("mode"), ["learn"]);
  assert.doesNotMatch(href, /\?mode=learn\?mode=edit/);
});

test("edit mutations preserve the canonical route without weakening server authorization", () => {
  const actions = readFileSync(new URL("../app/app/teacher/courses/actions.ts", import.meta.url), "utf8");
  const service = readFileSync(new URL("../lib/teacher-service.ts", import.meta.url), "utf8");
  assert.match(actions, /withParams\(`\/app\/courses\/\$\{canonicalCourseSlug\}`/);
  assert.match(service, /requireRole\("teacher"/);
  assert.match(resolver, /hasEditorialRole/);
});

test("canonical authoring return opens the course overview in view mode", () => {
  assert.match(courseBuilder, /`\/app\/courses\/\$\{canonicalCourseSlug\}\?mode=view`/);
  assert.match(resolver, /if \(requestedMode === "view"\) return "view"/);
});

test("authoring drawers keep modal keyboard and scroll behavior", () => {
  assert.match(authoringWorkspace, /document\.body\.style\.overflow = "hidden"/);
  assert.match(authoringWorkspace, /event\.key === "Escape"/);
  assert.match(authoringWorkspace, /role=\{isStructureOverlay \? "dialog" : undefined\}/);
  assert.match(authoringWorkspace, /role=\{isForgeOverlay \? "dialog" : undefined\}/);
});
