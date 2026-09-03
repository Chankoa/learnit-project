import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { calculateCourseProgress, calculateProgressCounts } from "../lib/course-progress";

const migration = readFileSync(
  new URL("../supabase/migrations/20260903090000_enrolled_course_read_teacher_students.sql", import.meta.url),
  "utf8"
);
const hardeningMigration = readFileSync(
  new URL("../supabase/migrations/20260903091000_harden_enrollment_rls_helpers.sql", import.meta.url),
  "utf8"
);
const pageSource = readFileSync(
  new URL("../app/app/teacher/students/page.tsx", import.meta.url),
  "utf8"
);
const repositorySource = readFileSync(
  new URL("../lib/repositories/supabase/teacherStudentRepository.ts", import.meta.url),
  "utf8"
);

test("course progress counts only completed accessible lessons", () => {
  assert.deepEqual(calculateCourseProgress(["one", "one", "locked", "two"], ["one", "two", "three"]), {
    completedCount: 2,
    totalLessons: 3,
    percentage: 67
  });
  assert.deepEqual(calculateProgressCounts(4, 3), {
    completedCount: 3,
    totalLessons: 3,
    percentage: 100
  });
});

test("Learner policies use a published enrollment check without changing public discovery", () => {
  assert.match(migration, /can_read_enrolled_published_course/);
  assert.match(migration, /courses\.status = 'published'/);
  assert.doesNotMatch(
    migration.match(/create policy "Learners can read enrolled resources"[\s\S]*?\);/)?.[0] ?? "",
    /visibility/
  );
  assert.doesNotMatch(migration, /drop policy if exists "Published courses are public"/);
});

test("Teacher access is read-only, owner-scoped and avoids recursive policy joins", () => {
  assert.match(migration, /teacher_can_read_enrolled_learner\(profiles\.id\)/);
  assert.match(migration, /teacher_owns_course\(lesson_progress\.course_id\)/);
  assert.match(migration, /Teachers can read lesson progress for their courses"[\s\S]*?for select/i);
  assert.doesNotMatch(migration, /Teachers can (?:update|insert|delete).*lesson progress/i);
  assert.match(migration, /security definer[\s\S]*?set search_path = ''/i);
  assert.match(migration, /revoke all on function .* from public/);
  assert.match(hardeningMigration, /create schema if not exists private/);
  assert.match(hardeningMigration, /revoke all on schema private from public, anon/);
  assert.match(hardeningMigration, /private\.teacher_can_read_enrolled_learner\(profiles\.id\)/);
  assert.match(hardeningMigration, /drop function public\.teacher_owns_course/);
});

test("Teacher Students uses real repository fields and no demo copy", () => {
  assert.match(pageSource, /getTeacherStudentTracking/);
  assert.doesNotMatch(pageSource, /Liste fictive|Email fictif|getTeacherStudentRows/);
  assert.match(repositorySource, /\.from\("enrollments"\)/);
  assert.match(repositorySource, /\.from\("lesson_progress"\)/);
  assert.match(repositorySource, /\.from\("profiles"\)/);
  assert.match(repositorySource, /last_accessed_at/);
});
