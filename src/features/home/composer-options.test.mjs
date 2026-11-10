import { test } from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_MODE_ID,
  MODE_OPTIONS,
  MODEL_OPTIONS,
  optionLabel,
} from "./composer-options.ts";
import { DEFAULT_MODEL } from "./sessions.ts";

test("option ids are unique inside each menu", () => {
  for (const options of [MODEL_OPTIONS, MODE_OPTIONS]) {
    assert.equal(new Set(options.map((option) => option.id)).size, options.length);
  }
});

test("the default model has a menu entry", () => {
  assert.ok(MODEL_OPTIONS.some((option) => option.id === DEFAULT_MODEL));
});

test("the default mode is a listed mode labelled Supervised", () => {
  assert.equal(optionLabel(MODE_OPTIONS, DEFAULT_MODE_ID), "Supervised");
});

test("optionLabel resolves known ids and falls back to the stored id", () => {
  assert.equal(optionLabel(MODEL_OPTIONS, "GPT-5 Mini"), "GPT-5 Mini");
  assert.equal(optionLabel(MODEL_OPTIONS, "some-future-model"), "some-future-model");
});
