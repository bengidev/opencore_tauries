import { useEffect, useState } from "react";

export const SPEECH_LINES = [
  "Hello! Ready to explore?",
  "I'm here for any task.",
  "Let's get started.",
] as const;

const WORD_INTERVAL_MS = 240;

type SpeechBubbleProps = {
  message: string;
  revision: number;
  anchor: number;
};

export function SpeechBubble({ message, revision, anchor }: SpeechBubbleProps) {
  const words = message.trim().split(/\s+/).filter(Boolean);
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const items = message.trim().split(/\s+/).filter(Boolean);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(items.length);
      return;
    }

    setVisible(0);
    let count = 0;
    const timer = window.setInterval(() => {
      count += 1;
      setVisible(count);
      if (count >= items.length) window.clearInterval(timer);
    }, WORD_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [message, revision]);

  return (
    <div
      className="speech-anchor"
      style={{
        left: `${anchor * 100}%`,
      }}
    >
      <div className="speech-bubble">
        <p className="speech-text" aria-live="polite" aria-atomic="true">
          {words.slice(0, visible).map((word, index) => (
            <span key={`${revision}-${index}`}>
              {index > 0 && " "}
              <span className="speech-word">{word}</span>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
