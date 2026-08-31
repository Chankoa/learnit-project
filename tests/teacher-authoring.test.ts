import assert from "node:assert/strict";
import test from "node:test";

import {
  getTeacherPublicationHref,
  isTeacherAuthoringPath,
  teacherAuthoringSurfaceLabels,
  teacherAuthoringSurfaces
} from "../lib/teacher-authoring";

test("limits Focus Mode to a Teacher course builder route", () => {
  assert.equal(isTeacherAuthoringPath("/app/teacher/courses/course-1/builder"), true);
  assert.equal(isTeacherAuthoringPath("/app/teacher/courses/course-1/builder/"), true);
  assert.equal(isTeacherAuthoringPath("/app/teacher/courses/course-1/edit"), false);
  assert.equal(isTeacherAuthoringPath("/app/learner/courses/course-1/builder"), false);
});

test("opens the existing publish dialog only for a publishable draft", () => {
  assert.equal(
    getTeacherPublicationHref({ canPublish: true, courseId: "course-1", isPublished: false }),
    "/app/teacher/courses/course-1/edit?tab=publication&publish=1"
  );
  assert.equal(
    getTeacherPublicationHref({ canPublish: false, courseId: "course-1", isPublished: false }),
    "/app/teacher/courses/course-1/edit?tab=publication"
  );
  assert.equal(
    getTeacherPublicationHref({ canPublish: true, courseId: "course-1", isPublished: true }),
    "/app/teacher/courses/course-1/edit?tab=publication"
  );
});

test("defines the three stable Focus Mode surfaces and labels", () => {
  assert.deepEqual(teacherAuthoringSurfaces, ["information", "content", "resources"]);
  assert.equal(teacherAuthoringSurfaceLabels.information, "Informations");
  assert.equal(teacherAuthoringSurfaceLabels.content, "Contenu");
  assert.equal(teacherAuthoringSurfaceLabels.resources, "Ressources");
});
