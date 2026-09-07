import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { effectiveCourseCapabilities } from "../lib/auth/authoring-capabilities";
import { getSafeNextPath } from "../lib/auth/redirects";

const registerPage = readFileSync(new URL("../app/register/page.tsx", import.meta.url), "utf8");
const loginPage = readFileSync(new URL("../app/login/page.tsx", import.meta.url), "utf8");
const header = readFileSync(new URL("../components/layout/Header.tsx", import.meta.url), "utf8");
const authActions = readFileSync(new URL("../app/auth/actions.ts", import.meta.url), "utf8");
const forgeActions = readFileSync(new URL("../app/app/teacher/forge/actions.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../supabase/migrations/20260907054237_role_neutral_authoring.sql", import.meta.url), "utf8");
const courseAuthoring = readFileSync(new URL("../lib/auth/course-authoring.ts", import.meta.url), "utf8");

test("public registration creates one account without selecting a role", () => {
  assert.doesNotMatch(registerPage, /name="role"|Type de compte|Apprenant|Enseignant/);
  assert.match(authActions, /const role = publicRegistrationCompatibilityRole/);
  assert.match(authActions, /data:\s*{\s*name,\s*role\s*}/);
  assert.match(authActions, /redirect\(nextPath\)/);
});

test("auth redirects retain a safe intent and default to the unified home", () => {
  assert.equal(getSafeNextPath("/app/create?intent=test"), "/app/create?intent=test");
  assert.equal(getSafeNextPath("https://attacker.example/app"), "/app");
  assert.equal(getSafeNextPath("//attacker.example/app"), "/app");
  assert.match(loginPage, /getSafeNextPath/);
  assert.match(header, /href="\/login"/);
  assert.match(header, /href="\/register"/);
  assert.doesNotMatch(header, /href="\/app"/);
});

test("authoring is owner-scoped, while global admin retains its existing override", () => {
  const authoring = ["view", "edit", "publish", "manage_members"] as const;
  assert.deepEqual(effectiveCourseCapabilities([...authoring], true, true), [...authoring]);
  assert.deepEqual(effectiveCourseCapabilities([...authoring], false, true), ["view"]);
  assert.deepEqual(effectiveCourseCapabilities([...authoring], false, true, true), [...authoring]);
  assert.deepEqual(effectiveCourseCapabilities([...authoring], true, false), []);
  assert.match(courseAuthoring, /requireActiveProfile/);
  assert.match(courseAuthoring, /getCourseCapabilities/);
});

test("RLS atomically creates owner membership and replaces teacher role gates", () => {
  assert.match(migration, /create trigger sync_course_owner_membership after insert or update of teacher_id on public\.courses/);
  assert.match(migration, /insert into public\.course_memberships \(course_id, user_id, role, status, accepted_at\)/);
  assert.match(migration, /'owner', 'active'/);
  assert.match(migration, /create policy "Owners can create their courses"/);
  assert.match(migration, /teacher_id = \(select auth\.uid\(\)\)\s+and private\.is_active_account\(\)/);
  assert.doesNotMatch(migration, /current_profile_role\(\) = 'teacher'/);
});

test("manual and Forge creation both enter canonical edit mode", () => {
  assert.match(authActions, /redirect\(nextPath\)/);
  assert.match(forgeActions, /destination: `\/app\/courses\/\$\{course\.slug\}\?mode=edit&message=/);
  assert.doesNotMatch(forgeActions, /destination: `\/app\/teacher\/courses/);
});