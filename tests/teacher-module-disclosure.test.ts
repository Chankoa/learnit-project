import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const disclosure = readFileSync(
  new URL("../components/app/TeacherModuleDisclosure.tsx", import.meta.url),
  "utf8"
);
const builder = readFileSync(new URL("../components/app/TeacherCourseBuilder.tsx", import.meta.url), "utf8");

test("module disclosure exposes an accessible local collapse contract", () => {
  assert.match(disclosure, /aria-controls=\{controlsId\}/);
  assert.match(disclosure, /aria-expanded=\{isOpen\}/);
  assert.match(disclosure, /hidden=\{!isOpen\}/);
  assert.match(disclosure, /setExpanded\(\(current\) => !current\)/);
});

test("the selected lesson keeps its module visible without changing navigation state", () => {
  assert.match(disclosure, /const isOpen = forcedOpen \|\| expanded/);
  assert.match(disclosure, /disabled=\{forcedOpen\}/);
  assert.match(builder, /forcedOpen=\{containsSelectedLesson\}/);
  assert.match(builder, /teacher-module-lessons-\$\{module\.id\}/);
});

test("resource forms preserve their existing server actions inside distinct panels", () => {
  assert.match(builder, /action=\{createTeacherLessonResourceAction\.bind/);
  assert.match(builder, /action=\{uploadTeacherLessonResourceAction\.bind/);
  assert.match(builder, /className="teacher-resource-form"/);
  assert.match(builder, />Ajouter un lien</);
  assert.match(builder, />Téléverser un fichier</);
});
