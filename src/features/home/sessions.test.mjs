import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_MODEL,
  MOCK_SESSIONS,
  filterSessions,
  formatUpdatedAt,
  groupSessions,
  newSession,
  sessionTitleFromPrompt,
} from "./sessions.ts";

test("filter matches title, branch, and model case-insensitively", () => {
  const sessions = MOCK_SESSIONS;
  assert.ok(filterSessions(sessions, "provider").length >= 1);
  assert.ok(filterSessions(sessions, "FEAT/SETTINGS").length >= 1);
  assert.ok(filterSessions(sessions, "claude").length >= 1);
  assert.equal(filterSessions(sessions, "").length, sessions.length);
  assert.equal(filterSessions(sessions, "   ").length, sessions.length);
  assert.equal(filterSessions(sessions, "zzz-no-match").length, 0);
});

test("groups keep Sessions before Older and label them", () => {
  const groups = groupSessions(MOCK_SESSIONS);
  assert.deepEqual(groups.map((group) => group.id), ["sessions", "older"]);
  assert.deepEqual(groups.map((group) => group.label), ["Sessions", "Older"]);
  assert.ok(groups.every((group) => group.items.length > 0));
  assert.equal(groups.flatMap((group) => group.items).length, MOCK_SESSIONS.length);
});

test("groups drop empty sections", () => {
  const groups = groupSessions(MOCK_SESSIONS.filter((session) => session.group === "older"));
  assert.deepEqual(groups.map((group) => group.id), ["older"]);
});

test("session titles collapse whitespace and truncate at 48 characters", () => {
  assert.equal(sessionTitleFromPrompt("  Fix   the  composer  "), "Fix the composer");
  const long = "a".repeat(80);
  const title = sessionTitleFromPrompt(long);
  assert.equal(title.length, 48);
  assert.ok(title.endsWith("…"));
  assert.equal(sessionTitleFromPrompt("   "), "New session");
  assert.equal(sessionTitleFromPrompt("Short prompt"), "Short prompt");
});

test("updated dates show the month and day, with the year when it differs", () => {
  const now = new Date("2026-11-10T09:00:00Z");
  assert.equal(formatUpdatedAt("2026-11-09T12:00:00Z", now), "Nov 9");
  assert.equal(formatUpdatedAt("2025-12-31T12:00:00Z", now), "Dec 31, 2025");
});

test("newSession starts in the Sessions group with the default model", () => {
  const session = newSession("session-1", new Date("2026-11-10T09:00:00Z"));
  assert.deepEqual(session, {
    id: "session-1",
    title: "New session",
    branch: "main",
    model: DEFAULT_MODEL,
    updatedAt: "2026-11-10T09:00:00.000Z",
    group: "sessions",
  });
});
