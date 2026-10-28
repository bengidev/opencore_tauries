import assert from "node:assert/strict";
import test from "node:test";

import { advanceConversation, INITIAL_CONVERSATION } from "./hero-conversation.ts";

test("the opening rest introduces the first line without advancing it", () => {
  assert.deepEqual(advanceConversation(INITIAL_CONVERSATION, 4, 16, 2), {
    speakerIndex: 2,
    lineIndex: 0,
    revision: 1,
    phase: "speaking",
  });
});

test("speaking hands off to a rest without changing speaker or line", () => {
  const speaking = { speakerIndex: 2, lineIndex: 0, revision: 1, phase: "speaking" };

  assert.deepEqual(advanceConversation(speaking, 4, 16, 3), {
    ...speaking,
    phase: "resting",
  });
});

test("the next rest advances the speaker and the line", () => {
  const resting = { speakerIndex: 2, lineIndex: 0, revision: 1, phase: "resting" };

  assert.deepEqual(advanceConversation(resting, 4, 16, 3), {
    speakerIndex: 3,
    lineIndex: 1,
    revision: 2,
    phase: "speaking",
  });
});

test("falls back to round-robin and wraps both indexes", () => {
  const resting = { speakerIndex: 3, lineIndex: 15, revision: 5, phase: "resting" };

  assert.deepEqual(advanceConversation(resting, 4, 16), {
    speakerIndex: 0,
    lineIndex: 0,
    revision: 6,
    phase: "speaking",
  });
});
