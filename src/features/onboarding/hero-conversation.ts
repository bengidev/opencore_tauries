export const CONVERSATION_LINES = [
  "Quiet out here. I like it.",
  "That's the point. Less noise.",
  "Anything worth chasing?",
  "Only the work. Nothing else.",
  "Keep it close. Keep it local.",
  "Ready when it gets serious.",
  "No rush. The current knows.",
  "Then we stay a little longer.",
  "A quieter way to think.",
  "Together, if you want.",
  "No signal lost down here.",
  "Just the deep, and the work.",
  "Good. Let it stay still.",
  "We're already where we need to be.",
  "Then let the water move.",
  "And let the work begin.",
] as const;

export type ConversationPhase = "speaking" | "resting";

export type ConversationState = {
  speakerIndex: number;
  lineIndex: number;
  revision: number;
  phase: ConversationPhase;
};

export const INITIAL_CONVERSATION: ConversationState = {
  speakerIndex: 0,
  lineIndex: 0,
  revision: 0,
  phase: "resting",
};

export function advanceConversation(
  state: ConversationState,
  speakerCount: number,
  lineCount: number,
  nextSpeakerIndex = (state.speakerIndex + 1) % speakerCount,
): ConversationState {
  if (state.phase === "speaking") {
    return { ...state, phase: "resting" };
  }

  return {
    speakerIndex: nextSpeakerIndex,
    lineIndex: state.revision === 0 ? state.lineIndex : (state.lineIndex + 1) % lineCount,
    revision: state.revision + 1,
    phase: "speaking",
  };
}
