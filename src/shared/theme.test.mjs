import assert from "node:assert/strict";
import test from "node:test";

import { resolveInitialTheme } from "./theme.ts";

test("a stored theme wins over the system preference", () => {
  assert.equal(resolveInitialTheme("light", true), "light");
  assert.equal(resolveInitialTheme("dark", false), "dark");
});

test("with nothing stored the system preference decides", () => {
  assert.equal(resolveInitialTheme(null, true), "dark");
  assert.equal(resolveInitialTheme(null, false), "light");
});

test("an unknown stored value falls back to the system preference", () => {
  assert.equal(resolveInitialTheme("sepia", true), "dark");
  assert.equal(resolveInitialTheme("", false), "light");
});
