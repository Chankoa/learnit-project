import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const lessonNotes = readFileSync(new URL("../components/learning/LessonNotes.tsx", import.meta.url), "utf8");
const learningActions = readFileSync(new URL("../app/learn/actions.ts", import.meta.url), "utf8");

test("lesson notes retain the local draft through RSC refreshes and serialize autosaves", () => {
  assert.match(lessonNotes, /if \(draftRef\.current\.lessonId === lessonId\) return/);
  assert.match(lessonNotes, /const savingRef = useRef\(false\)/);
  assert.match(lessonNotes, /if \(draftRef\.current\.lessonId === draft\.lessonId\)/);
  assert.match(lessonNotes, /draftRef\.current\.revision === draft\.revision/);
  assert.match(lessonNotes, /setAutosaveCycle/);
  assert.match(lessonNotes, /setStatus\("Enregistrement impossible\. Réessayez\."\)/);
});

test("saving a note does not revalidate the full learning workspace", () => {
  const saveAction = learningActions.match(/export async function saveLessonNoteAction[\s\S]*?\n}/)?.[0] ?? "";
  assert.match(saveAction, /await saveLessonNote\(lessonId, content\)/);
  assert.doesNotMatch(saveAction, /revalidateLearning/);
});