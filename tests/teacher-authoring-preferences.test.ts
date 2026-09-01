import assert from "node:assert/strict";
import test from "node:test";

import {
  clampForgePanelWidth,
  FORGE_PANEL_DEFAULT_WIDTH,
  FORGE_PANEL_MAX_WIDTH,
  FORGE_PANEL_MIN_WIDTH,
  FORGE_PANEL_WIDTH_STORAGE_KEY,
  getForgePanelMaxWidth,
  parseForgePanelPreference,
  serializeForgePanelPreference
} from "../lib/teacher-authoring-preferences";

test("keeps Forge width within the desktop viewport and absolute bounds", () => {
  assert.equal(getForgePanelMaxWidth(2_000), FORGE_PANEL_MAX_WIDTH);
  assert.equal(getForgePanelMaxWidth(1_440), 624);
  assert.equal(getForgePanelMaxWidth(1_280), 464);
  assert.equal(getForgePanelMaxWidth(500), FORGE_PANEL_MIN_WIDTH);
  assert.equal(clampForgePanelWidth(100, 1_440), FORGE_PANEL_MIN_WIDTH);
  assert.equal(clampForgePanelWidth(900, 1_440), 624);
  assert.equal(clampForgePanelWidth(FORGE_PANEL_DEFAULT_WIDTH, 1_440), FORGE_PANEL_DEFAULT_WIDTH);
});

test("uses a versioned, minimal and recoverable local preference", () => {
  assert.match(FORGE_PANEL_WIDTH_STORAGE_KEY, /:v1$/);
  assert.equal(serializeForgePanelPreference(400), '{"width":400}');
  assert.equal(parseForgePanelPreference('{"width":400}'), 400);
  assert.equal(parseForgePanelPreference('{"width":"wide"}'), null);
  assert.equal(parseForgePanelPreference("not-json"), null);
  assert.equal(parseForgePanelPreference(null), null);
});
