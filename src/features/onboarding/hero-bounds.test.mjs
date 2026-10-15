import assert from "node:assert/strict";
import test from "node:test";
import { findInkTop, getBubbleBottomOffset } from "./hero-bounds.ts";

test("finds the topmost visible row and ignores transparent pixels", () => {
  const pixels = new Uint8ClampedArray(4 * 3 * 4);
  pixels[(1 * 3 + 2) * 4 + 3] = 17;
  pixels[(2 * 3) * 4 + 3] = 255;

  assert.equal(findInkTop(pixels, 3, 4), 1);
});

test("positions the bubble above the measured hero edge with a safe gap", () => {
  assert.equal(
    getBubbleBottomOffset({
      figureBottom: 600,
      heroTop: 440.625,
      gap: 8,
      tailDepth: 9,
    }),
    176.375,
  );
});
