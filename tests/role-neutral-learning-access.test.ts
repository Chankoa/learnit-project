import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const learningService = readFileSync(new URL("../lib/learning-service.ts", import.meta.url), "utf8");
const coursePage = readFileSync(new URL("../app/learn/[courseSlug]/page.tsx", import.meta.url), "utf8");
const lessonPage = readFileSync(new URL("../app/learn/[courseSlug]/[lessonSlug]/page.tsx", import.meta.url), "utf8");
const explorePage = readFileSync(new URL("../app/app/explore/page.tsx", import.meta.url), "utf8");
const formationPage = readFileSync(new URL("../app/formations/[slug]/page.tsx", import.meta.url), "utf8");
const readModel = readFileSync(new URL("../lib/unified-course-relations.ts", import.meta.url), "utf8");
const migration = readFileSync(
  new URL("../supabase/migrations/20260903110000_role_neutral_learning_access.sql", import.meta.url),
  "utf8"
);

test("canonical learning access requires an active profile, published course, and own enrollment", () => {
  assert.match(learningService, /export async function requireLearningAccess/);
  assert.match(learningService, /requireActiveProfile\(nextPath\)/);
  assert.match(learningService, /course\.status !== "published"/);
  assert.match(learningService, /learningRepository\.getEnrollment\(course\.id\)/);
  assert.doesNotMatch(
    learningService.match(/export async function requireLearningAccess[\s\S]*?return \{ course, enrollment, profile \};/)?.[0] ?? "",
    /requireRole\("learner"\)/
  );
});

test("course enrollment remains available only from a published public landing page", () => {
  assert.match(coursePage, /allowPublicEnrollment: true/);
  assert.match(learningService, /options\.allowPublicEnrollment && course\.visibility === "public"/);
  assert.match(lessonPage, /requireLearningAccess\(courseSlug, `\/learn\/\$\{courseSlug\}\/\$\{lessonSlug\}`\)/);
  assert.doesNotMatch(coursePage, /requireRole\("learner"\)/);
  assert.doesNotMatch(lessonPage, /requireRole\("learner"\)/);
});

test("read model preserves one card for owner plus enrollment and prioritizes learning CTAs", () => {
  assert.match(readModel, /if \(!enrollment && !isLegacyOwner && membershipsForCourse\.length === 0/);
  const primaryLabelBlock = readModel.match(/const primaryLabel[\s\S]*?const primaryHref/)?.[0] ?? "";
  assert.match(primaryLabelBlock, /enrollment\.status === "completed"/);
  assert.ok(primaryLabelBlock.indexOf('"Revoir"') < primaryLabelBlock.indexOf('"Gérer"'));
  assert.ok(primaryLabelBlock.indexOf('"Continuer"') < primaryLabelBlock.indexOf('"Gérer"'));
});

test("Explorer stays public-only while relation-aware CTAs and formation CTA use real relations", () => {
  assert.match(explorePage, /getLmsCatalog\(\)/);
  assert.match(explorePage, /getUnifiedCourseRelations\(profile\)/);
  assert.match(explorePage, /relation\?\.primaryLabel \?\? "Consulter"/);
  assert.match(formationPage, /getCourseCapabilities\(profile\.id, course\.id\)/);
  assert.match(formationPage, /learningState\?\.enrollment/);
  assert.doesNotMatch(formationPage, /profile\.role === "learner"/);
});

test("RLS makes enrolled published course reads role-neutral without altering authoring policies", () => {
  for (const policy of [
    "Users can read enrolled published courses",
    "Users can read enrolled published course modules",
    "Users can read enrolled published lessons",
    "Users can read enrolled resources",
    "Users can read enrolled ready course sources",
    "Users can read enrolled course source files"
  ]) {
    assert.match(migration, new RegExp(policy));
  }
  assert.match(migration, /Users enroll themselves in published public courses/);
  assert.match(migration, /courses\.status = 'published'/);
  assert.match(migration, /courses\.visibility = 'public'/);
  assert.match(migration, /private\.can_read_enrolled_published_course/);
  assert.match(migration, /Teachers can insert their authoring ai generation metadata/);
  assert.doesNotMatch(
    migration.match(/Users can read enrolled published courses[\s\S]*?\);/)?.[0] ?? "",
    /current_profile_role\(\) = 'learner'/
  );
});
