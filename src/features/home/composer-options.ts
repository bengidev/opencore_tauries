export type ComposerOption = { id: string; label: string };

// Model ids are stored verbatim on a session, so they double as the label the
// sidebar renders. Keep them in sync with `DEFAULT_MODEL` in sessions.ts.
export const MODEL_OPTIONS: ComposerOption[] = [
  { id: "GPT-5 Sol", label: "GPT-5 Sol" },
  { id: "GPT-5 Mini", label: "GPT-5 Mini" },
  { id: "o4-mini", label: "o4-mini" },
];

export const EFFORT_OPTIONS: ComposerOption[] = [
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
];

export const ACCESS_OPTIONS: ComposerOption[] = [
  { id: "full", label: "Full access" },
  { id: "ask", label: "Ask first" },
  { id: "read", label: "Read only" },
];

export const DEFAULT_EFFORT_ID = "high";
export const DEFAULT_ACCESS_ID = "full";

/**
 * Sessions can carry a model that predates the menu (or arrives from disk), so
 * fall back to the stored id instead of rendering an empty pill.
 */
export function optionLabel(options: ComposerOption[], id: string): string {
  return options.find((option) => option.id === id)?.label ?? id;
}
