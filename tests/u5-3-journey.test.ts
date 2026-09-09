import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { getCourseCardAction } from "../lib/course-card-action";
const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const base = { slug: "design", published: true, public: true, enrolled: false, canEdit: false, primaryHref: "/app/courses/design", primaryLabel: "Consulter", surface: "explore" as const };

test("Explorer joins a public course and exposes owner editing independently of enrollment", () => {
  const visitor = getCourseCardAction(base);
  assert.equal(visitor.enroll, true);
  assert.equal(visitor.href, "/app/courses/design?mode=view");
  assert.equal(visitor.label, "Découvrir");
  assert.equal(visitor.showEdit, false);
  const owner = getCourseCardAction({ ...base, canEdit: true, primaryHref: "/app/courses/design?mode=edit" });
  assert.equal(owner.enroll, true);
  assert.equal(owner.showEdit, true);
  assert.equal(owner.href, visitor.href);
  assert.equal(getCourseCardAction({ ...base, published: false }).enroll, false);
  assert.equal(getCourseCardAction({ ...base, public: false }).enroll, false);
});
test("owner plus enrollment keeps learning primary and editing secondary on one card", () => {
  for (const canEdit of [false, true]) {
    const card = getCourseCardAction({ ...base, enrolled: true, canEdit, primaryHref: "/app/courses/design/lessons/intro?mode=learn" });
    assert.equal(card.enroll, false);
    assert.equal(card.label, "Continuer");
    assert.equal(card.href, "/app/courses/design/lessons/intro?mode=learn");
    assert.equal(card.showEdit, canEdit);
  }
});
test("successful enrollment reuses the secured action and returns to canonical overview", () => {
  const button = read("components/learning/EnrollmentButton.tsx");
  assert.match(button, /await enrollAction\(courseId, courseSlug\)/);
  assert.match(button, /router.push\(`\/app\/courses\/\$\{courseSlug\}\?mode=view`\)/);
  assert.doesNotMatch(button, /router\.(push|replace)\([\s\S]*?`\/learn\//);
  assert.match(read("components/app/UnifiedCourseCard.tsx"), /action.enroll \? <EnrollmentButton/);
});
test("lesson activity has one mode switch and no management navigation", () => {
  const lesson = read("app/app/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx");
  assert.equal((lesson.match(/<UnifiedCourseModeSwitch/g) ?? []).length, 1);
  assert.doesNotMatch(lesson, /CourseContextNavigation/);
  assert.doesNotMatch(read("components/app/TeacherCourseBuilder.tsx"), /contextNavigation/);
  const shell = read("components/app/CanonicalCourseWorkspace.tsx");
  assert.doesNotMatch(shell, /publicationHref|previewHref|CourseContextNavigation|\/app\/(teacher|learner)/);
  assert.doesNotMatch(read("components/app/UnifiedCourseOverview.tsx"), /UnifiedCourseModeSwitch/);
});
test("Learn and Edit delegate both rails to a single collapsible shell", () => {
  for (const file of ["components/learning/LearnerLessonWorkspace.tsx", "components/app/TeacherAuthoringWorkspace.tsx"]) {
    const code = read(file);
    assert.match(code, /<CanonicalCourseWorkspace/);
    assert.doesNotMatch(code, /setIsForgeOpen|setIsStructureOpen|LearningShell/);
  }
  const shell = read("components/app/CanonicalCourseWorkspace.tsx");
  for (const contract of ["data-structure-open", "data-forge-open", "toggleStructure", "toggleForge", "useContextualPanel", "CollapsedForgeRail", "Redimensionner le panneau Forge"]) assert.ok(shell.includes(contract));
  assert.match(shell, /mode === "learn" \? "Comprendre et apprendre" : "Créer et améliorer"/);
});
test("conditional Forge slots have stable lesson and module identity, never index keys", () => {
  const builder = read("components/app/TeacherCourseBuilder.tsx");
  assert.match(builder, /<ForgeLessonAssistant\s+key=\{`lesson:\$\{selectedLesson.id\}`\}/);
  assert.match(builder, /key=\{`module:\$\{selectedModule.id\}`\}/);
  const shell = read("components/app/CanonicalCourseWorkspace.tsx");
  assert.match(shell, /<Fragment key=\{`forge:\$\{selectedId \?\? "course"\}`\}>/);
  assert.doesNotMatch(shell, /key=\{index\}/);
});
