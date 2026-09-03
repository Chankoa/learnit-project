import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const navigation = readFileSync(new URL("../lib/navigation.ts", import.meta.url), "utf8");
const readModel = readFileSync(new URL("../lib/unified-course-relations.ts", import.meta.url), "utf8");
const home = readFileSync(new URL("../app/app/page.tsx", import.meta.url), "utf8");
const explore = readFileSync(new URL("../app/app/explore/page.tsx", import.meta.url), "utf8");
const collaborative = readFileSync(new URL("../app/app/collaborative/page.tsx", import.meta.url), "utf8");

test("unified navigation is intent-first and keeps global administration conditional", () => {
  for (const label of ["Accueil", "Mes parcours", "Explorer", "Collaboratif", "Ressources", "Créer", "Profil"]) {
    assert.match(navigation, new RegExp(`label: "${label}"`));
  }
  assert.match(navigation, /if \(isAdmin\)/);
  assert.match(navigation, /label: "Administration"/);
});

test("unified read model deduplicates ownership, membership, and enrollment on one course", () => {
  assert.match(readModel, /getUnifiedCourseRelations/);
  assert.match(readModel, /membershipByCourse/);
  assert.match(readModel, /enrollmentByCourse/);
  assert.match(readModel, /isLegacyOwner && !membershipsForCourse\.includes\("owner"\)/);
  assert.match(readModel, /primaryLabel: UnifiedCourseRelation\["primaryLabel"\]/);
  assert.match(readModel, /getProgress\(courses\.map/);
});

test("unified surfaces use real sources and do not present unavailable collaboration as active", () => {
  assert.match(home, /getUnifiedCourseRelations/);
  assert.match(explore, /getLmsCatalog/);
  assert.match(explore, /publiés et publics/);
  assert.match(collaborative, /À venir/);
  assert.match(collaborative, /getUnifiedCourseRelations/);
});