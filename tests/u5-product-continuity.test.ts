import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildPublicForgePreview } from "../lib/forge-ai/public-preview";
import { getForgeCourseCreatorHref, getForgeCourseBriefPrefill } from "../lib/forge-ai/creation-intent";
import { getSafeNextPath } from "../lib/auth/redirects";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
test("public preview is deterministic, validated and does not invoke a provider or persist a course", () => {
  const input = { text: "  Comprendre les agents IA et leurs limites  ", formatHint: "practical-workshop" as const };
  const first = buildPublicForgePreview(input);
  assert.deepEqual(first, buildPublicForgePreview(input));
  assert.equal(first.title, input.text.trim());
  assert.equal(first.modules.length, 3);
  assert.equal(first.estimatedMinutes, 90);
  assert.equal(buildPublicForgePreview({ ...input, formatHint: "thematic-module" }).modules.length, 1);
  assert.throws(() => buildPublicForgePreview({ text: "court" }));
  assert.doesNotMatch(read("lib/forge-ai/public-preview.ts"), /fetch\(|supabase|generateText|createCourse|AI_API_KEY/);
  assert.match(read("components/app/ForgeHomeIntent.tsx"), /sans génération IA/);
});
test("preview to auth to create preserves punctuation, format and safe next without another input", () => {
  const preview = buildPublicForgePreview({ text: "Étudier C++ & CSS ? niveau débutant #1 / exemples", formatHint: "guided-course" });
  const destination = getForgeCourseCreatorHref(preview.intent);
  const login = new URL(`/login?next=${encodeURIComponent(destination)}`, "https://learnit.test");
  const restored = getSafeNextPath(login.searchParams.get("next"));
  assert.equal(restored, destination);
  const query = new URL(restored, login.origin).searchParams;
  assert.equal(query.get("intent"), preview.intent.text);
  assert.equal(query.get("format"), "guided-course");
  assert.equal(getForgeCourseBriefPrefill(preview.intent).subject, preview.intent.text);
  assert.equal(getSafeNextPath("//evil.example"), "/app");
  assert.equal(getSafeNextPath("/\\evil.example"), "/app");
});
test("all canonical learning returns explicitly select overview rather than default activity", () => {
  const route = read("app/app/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx");
  for (const name of ["courseHref", "courseBasePath", "overviewHref"]) {
    assert.ok(route.includes(`${name}={\`/app/courses/\${courseSlug}?mode=view\`}`), name);
  }
  assert.ok(route.includes('homeHref: `/app/courses/${courseSlug}?mode=view`'));
});
test("contextual course navigation keeps publication and participants capability gated", () => {
  const nav = read("components/app/CourseContextNavigation.tsx");
  assert.doesNotMatch(nav, /label: "Apprendre"|label: "Modifier"/);
  assert.match(nav, /canPublish \?/);
  assert.match(nav, /canManageMembers \?/);
  assert.match(read("components/app/UnifiedCourseOverview.tsx"), /context.canEdit \?/);
  assert.doesNotMatch(nav, /\/app\/(teacher|learner)/);
  assert.match(read("components/app/UnifiedCourseOverview.tsx"), /active={publication \? "publication" : "overview"}/);
  assert.match(read("app/app/courses/[courseSlug]/participants/page.tsx"), /active="participants"/);
});
test("public Forge preview remains the only contextual Workspace CTA", () => {
  assert.doesNotMatch(read("app/page.tsx"), /Accéder au Workspace/);
  assert.match(read("components/app/ForgeHomeIntent.tsx"), /Continuer dans le Workspace/);
  assert.doesNotMatch(read("components/app/TeacherCourseBuilder.tsx"), /Modifier le titre du module/);
});
test("Learn and Edit use the same Forge rail and focus lifecycle", () => {
  for (const file of ["components/learning/LearnerLessonWorkspace.tsx", "components/app/TeacherAuthoringWorkspace.tsx"]) {
    const source = read(file);
    assert.match(source, /CanonicalCourseWorkspace/);
  }
  const shared = read("components/app/CanonicalCourseWorkspace.tsx");
  for (const primitive of ["ContextualForgeHeader", "CollapsedForgeRail", "useContextualPanel", "FORGE_DRAWER_QUERY"]) assert.ok(shared.includes(primitive));
  const styles = read("styles/journey.scss");
  assert.doesNotMatch(styles, /#[0-9a-fA-F]{3,8}\b|rgba?\(/);
});
test("canonical Learn and Edit compose the shared course topbar", () => {
  for (const file of ["components/app/CanonicalCourseWorkspace.tsx"]) {
    assert.match(read(file), /CanonicalCourseTopbar/);
  }
});
