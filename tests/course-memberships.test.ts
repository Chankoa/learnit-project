import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL("../supabase/migrations/20260903100000_course_memberships_foundation.sql", import.meta.url),
  "utf8"
);

test("course memberships are idempotent, contextual, and preserve legacy teacher ownership", () => {
  assert.match(migration, /course_memberships/);
  assert.match(migration, /unique \(course_id, user_id\)/);
  assert.match(migration, /references public\.courses\(id\)\s+on delete cascade/);
  assert.match(migration, /references public\.profiles\(id\)\s+on delete cascade/);
  assert.match(migration, /from public\.courses[\s\S]*teacher_id is not null/);
  assert.match(migration, /on conflict \(course_id, user_id\)\s+do nothing/);
  assert.match(migration, /'owner',\s*'active'/);
  assert.doesNotMatch(migration, /alter table public\.courses[\s\S]*drop column[\s\S]*teacher_id/i);
});

test("membership foundation exposes capabilities without client role promotion", () => {
  assert.match(migration, /course_membership_has_capability/);
  assert.match(migration, /private\.has_course_capability/);
  assert.match(migration, /security definer[\s\S]*set search_path = ''/i);
  assert.match(migration, /when 'owner' then[\s\S]*'manage_members'/);
  assert.match(migration, /No authenticated insert\/update\/delete policy exists/);
  assert.doesNotMatch(migration, /create policy "Users can (?:create|update|delete)/i);
});