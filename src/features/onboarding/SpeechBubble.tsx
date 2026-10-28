import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

const WORD_INTERVAL_MS = 190;

export function SpeechBubble({
  message,
  revision,
  active,
}: {
  message: string;
  revision: number;
  active: boolean;
}) {
  const words = message.trim().split(/\s+/).filter(Boolean);
  const reducedMotion = usePrefersReducedMotion();
  const [visibleWords, setVisibleWords] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (reducedMotion) {
      setVisibleWords(words.length);
      return;
    }

    setVisibleWords(0);
    let count = 0;
    const timer = window.setInterval(() => {
      count += 1;
      setVisibleWords(count);
      if (count >= words.length) window.clearInterval(timer);
    }, WORD_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [active, message, revision, reducedMotion, words.length]);

  return (
    <p className="speech-text">
      {words.map((word, index) => (
        <span key={`${revision}-${index}`}>
          {index > 0 && " "}
          <span className="speech-word" data-visible={index < visibleWords}>
            {word}
          </span>
        </span>
      ))}
    </p>
  );
}
