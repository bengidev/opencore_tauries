import { test } from "node:test";
import assert from "node:assert/strict";

import {
  ACCESS_OPTIONS,
  DEFAULT_ACCESS_ID,
  DEFAULT_EFFORT_ID,
  EFFORT_OPTIONS,
  MODEL_OPTIONS,
  optionLabel,
} from "./composer-options.ts";
import { DEFAULT_MODEL } from "./sessions.ts";

test("option ids are unique inside each menu", () => {
  for (const options of [MODEL_OPTIONS, EFFORT_OPTIONS, ACCESS_OPTIONS]) {
    assert.equal(new Set(options.map((option) => option.id)).size, options.length);
  }
});

test("the default model has a menu entry", () => {
  assert.ok(MODEL_OPTIONS.some((option) => option.id === DEFAULT_MODEL));
});

test("the defaults resolve to the labels the composer shows", () => {
  assert.equal(optionLabel(EFFORT_OPTIONS, DEFAULT_EFFORT_ID), "High");
  assert.equal(optionLabel(ACCESS_OPTIONS, DEFAULT_ACCESS_ID), "Full access");
});

test("optionLabel resolves known ids and falls back to the stored id", () => {
  assert.equal(optionLabel(MODEL_OPTIONS, "GPT-5 Mini"), "GPT-5 Mini");
  assert.equal(optionLabel(MODEL_OPTIONS, "some-future-model"), "some-future-model");
});
