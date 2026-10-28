import assert from "node:assert/strict";
import test from "node:test";

import { placeBubble } from "./bubble-placement.ts";

const stage = {
  stageWidth: 800,
  stageHeight: 500,
  bubbleWidth: 200,
  bubbleHeight: 50,
  gap: 18,
  edgePad: 10,
};

test("sits above the head and points the tail at it", () => {
  assert.deepEqual(placeBubble({ ...stage, headX: 400, headY: 200 }), {
    left: 300,
    top: 132,
    tailX: 100,
    placement: "above",
    visible: true,
  });
});

test("clamps at the left edge without losing the head", () => {
  const placement = placeBubble({ ...stage, headX: 40, headY: 200 });

  assert.equal(placement.left, 10);
  assert.equal(placement.tailX, 30);
});

test("flips below when there is no room above", () => {
  const placement = placeBubble({ ...stage, headX: 400, headY: 30 });

  assert.equal(placement.placement, "below");
  assert.equal(placement.top, 48);
});

test("hides the bubble when the head leaves the stage", () => {
  const placement = placeBubble({ ...stage, headX: 1000, headY: 200 });

  assert.equal(placement.visible, false);
});

test("keeps the bubble below the header safe line", () => {
  const placement = placeBubble({ ...stage, headX: 400, headY: 200, safeTop: 150 });

  assert.equal(placement.placement, "below");
  assert.ok(placement.top >= 150);
  assert.equal(placement.visible, true);
});

test("flips away from an obstacle that blocks the preferred side", () => {
  const placement = placeBubble({
    ...stage,
    headX: 400,
    headY: 200,
    avoid: { left: 250, top: 120, right: 450, bottom: 190 },
  });

  assert.equal(placement.placement, "below");
  assert.equal(placement.top, 218);
  assert.equal(placement.visible, true);
});

test("hides when neither side clears the obstacle", () => {
  const placement = placeBubble({
    ...stage,
    headX: 400,
    headY: 200,
    avoid: { left: 250, top: 100, right: 450, bottom: 300 },
  });

  assert.equal(placement.visible, false);
});
