import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const tokens = readFileSync(new URL("../styles/tokens.scss", import.meta.url), "utf8");
const themes = readFileSync(new URL("../styles/themes.scss", import.meta.url), "utf8");
const globals = readFileSync(new URL("../styles/globals.scss", import.meta.url), "utf8");
const appStyles = readFileSync(new URL("../styles/app.scss", import.meta.url), "utf8");

test("DS 1.1 exposes the shared semantic surface and typography tokens", () => {
  for (const token of [
    "--font-size-page-title",
    "--font-size-object-title",
    "--font-size-section-title",
    "--font-size-label",
    "--radius-2xl",
    "--control-height-md",
    "--target-touch"
  ]) {
    assert.match(tokens, new RegExp(`${token.replaceAll("-", "\\-")}\\s*:`));
  }

  for (const token of [
    "--surface-body",
    "--surface-soft",
    "--surface-ai",
    "--surface-control",
    "--text-primary",
    "--text-secondary",
    "--text-soft",
    "--accent-soft",
    "--accent-editor"
  ]) {
    assert.match(themes, new RegExp(`${token.replaceAll("-", "\\-")}\\s*:`));
  }
});

test("violet remains the system primary in both themes", () => {
  const primaryDefinitions = themes.match(/--accent-primary:\s*#[0-9a-f]{6}/gi) ?? [];

  assert.deepEqual(primaryDefinitions, [
    "--accent-primary: #7c3aed",
    "--accent-primary: #8b5cf6"
  ]);
  assert.doesNotMatch(themes, /--accent-primary:\s*var\(--learnit-rose/i);
});

test("shared styles do not consume undefined design tokens", () => {
  const styles = `${tokens}\n${themes}\n${globals}\n${appStyles}`;
  const definitions = new Set(Array.from(styles.matchAll(/--([a-z0-9_-]+)\s*:/gi), (match) => match[1]));
  const usages = new Set(Array.from(styles.matchAll(/var\(--([a-z0-9_-]+)/gi), (match) => match[1]));
  const componentOwnedTokens = new Set(["skeleton-table-columns", "teacher-forge-width"]);
  const undefinedTokens = Array.from(usages).filter(
    (token) => !definitions.has(token) && !componentOwnedTokens.has(token)
  );

  assert.deepEqual(undefinedTokens, []);
});

test("Teacher calibration stays scoped and preserves functional breakpoints", () => {
  assert.match(appStyles, /Design System 1\.1 — visual calibration applied to the Teacher pilot/);
  assert.match(appStyles, /\.teacher-authoring__workspace/);
  assert.match(appStyles, /@media \(max-width: 1279px\)/);
  assert.match(appStyles, /@media \(max-width: 899px\)/);
  assert.match(appStyles, /@media \(max-width: 560px\)/);
  assert.match(appStyles, /@media \(pointer: coarse\)/);
  assert.match(appStyles, /@media \(prefers-reduced-motion: reduce\)/);
});

test("Teacher polish exposes the Structure timeline and desktop Forge resizer", () => {
  assert.match(appStyles, /\.teacher-builder-lessons::before/);
  assert.match(appStyles, /\.teacher-authoring__forge-resize/);
  assert.match(appStyles, /--teacher-forge-width/);
  assert.match(appStyles, /teacher-authoring-drawer-enter/);
});
