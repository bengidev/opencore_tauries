export type SessionGroupId = "sessions" | "older";

export type Session = {
  id: string;
  title: string;
  branch: string;
  model: string;
  updatedAt: string;
  group: SessionGroupId;
};

export const SESSION_GROUPS: readonly { id: SessionGroupId; label: string }[] = [
  { id: "sessions", label: "Sessions" },
  { id: "older", label: "Older" },
];

export const DEFAULT_MODEL: string = "GPT-5 Sol";

export const MOCK_SESSIONS: readonly Session[] = [
  {
    id: "session-1",
    title: "Plan the desktop chat shell",
    branch: "main",
    model: "GPT-5 Sol",
    updatedAt: "2026-11-09T09:00:00Z",
    group: "sessions",
  },
  {
    id: "session-2",
    title: "Wire the model provider bridge",
    branch: "main",
    model: "GPT-5.1 Luna",
    updatedAt: "2026-11-08T15:30:00Z",
    group: "sessions",
  },
  {
    id: "session-3",
    title: "Review the onboarding hero copy",
    branch: "feat/onboarding",
    model: "Claude Sonnet 4.5",
    updatedAt: "2026-11-06T11:00:00Z",
    group: "sessions",
  },
  {
    id: "session-4",
    title: "Store conversation history locally",
    branch: "main",
    model: "GPT-5 Sol",
    updatedAt: "2026-11-03T08:15:00Z",
    group: "sessions",
  },
  {
    id: "session-5",
    title: "Sketch the settings surface",
    branch: "feat/settings",
    model: "GPT-5.1 Luna",
    updatedAt: "2026-10-28T17:45:00Z",
    group: "older",
  },
  {
    id: "session-6",
    title: "Measure cold-start time",
    branch: "main",
    model: "GPT-5 Sol",
    updatedAt: "2026-10-21T10:20:00Z",
    group: "older",
  },
  {
    id: "session-7",
    title: "Draft the shortcut map",
    branch: "docs/shortcuts",
    model: "Claude Sonnet 4.5",
    updatedAt: "2026-10-11T14:05:00Z",
    group: "older",
  },
  {
    id: "session-8",
    title: "Summarise the rename decision",
    branch: "main",
    model: "GPT-5.1 Luna",
    updatedAt: "2026-09-30T19:40:00Z",
    group: "older",
  },
];

export function filterSessions(sessions: readonly Session[], query: string): Session[] {
  const needle = query.trim().toLowerCase();

  if (!needle) {
    return [...sessions];
  }

  return sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(needle) ||
      session.branch.toLowerCase().includes(needle) ||
      session.model.toLowerCase().includes(needle),
  );
}

export function groupSessions(
  sessions: readonly Session[],
): { id: SessionGroupId; label: string; items: Session[] }[] {
  return SESSION_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    items: sessions.filter((session) => session.group === group.id),
  })).filter((group) => group.items.length > 0);
}

export function sessionTitleFromPrompt(prompt: string, maxLength = 48): string {
  const title = prompt.replace(/\s+/g, " ").trim();

  if (!title) {
    return "New session";
  }

  if (title.length <= maxLength) {
    return title;
  }

  return `${title.slice(0, maxLength - 1).trimEnd()}…`;
}

export function formatUpdatedAt(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const sameYear = date.getUTCFullYear() === now.getUTCFullYear();

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
    timeZone: "UTC",
  }).format(date);
}

export function newSession(id: string, now = new Date()): Session {
  return {
    id,
    title: "New session",
    branch: "main",
    model: DEFAULT_MODEL,
    updatedAt: now.toISOString(),
    group: "sessions",
  };
}
