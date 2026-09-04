import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const styles = readFileSync(new URL("../styles/globals.scss", import.meta.url), "utf8");

test("learner mobile drawers use DS1 surface and text tokens in both themes", () => {
  const drawerStyles = styles.match(/\.learning-mobile-drawer-overlay \{[\s\S]*?\.learning-mobile-drawer__context \.lesson-sidebar \{/)
    ?.[0] ?? "";

  assert.match(drawerStyles, /background: var\(--surface-panel\)/);
  assert.match(drawerStyles, /color: var\(--text-primary\)/);
  assert.match(drawerStyles, /color: var\(--text-secondary\)/);
  assert.match(drawerStyles, /background: var\(--accent-soft\)/);
  assert.match(drawerStyles, /border-top: 1px solid var\(--border-soft\)/);
  assert.doesNotMatch(drawerStyles, /#[0-9a-f]{3,8}|rgba?\(/i);
  assert.match(styles, /\.learner-forge-overlay[\s\S]*?background: color-mix\(in srgb, var\(--text-primary\) 42%, transparent\)/);
});