import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { findInkTop, getBubbleBottomOffset } from "./hero-bounds";
import { OnboardingHero } from "./OnboardingHero";
import { SPEECH_LINES, SpeechBubble } from "./SpeechBubble";
import { advanceSpeech, type OnboardingSpeechState } from "./speech-rotation";

export const SPEECH_ROTATION_DELAY_MS = 5000;

const BOUNDS_SAMPLE_SIZE = 128;
const BUBBLE_GAP = 20;
const BUBBLE_TAIL_DEPTH = 9;

export function HeroStage() {
  const [speech, setSpeech] = useState<OnboardingSpeechState>({
    index: 0,
    revision: 0,
    anchorFraction: 0.5,
    autoMotionRevision: 0,
  });
  const figureRef = useRef<HTMLDivElement>(null);
  const message = SPEECH_LINES[speech.index] ?? SPEECH_LINES[0];

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSpeech((current) => advanceSpeech({ state: current, reason: "timer", lines: SPEECH_LINES }));
    }, SPEECH_ROTATION_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [speech.revision]);

  useLayoutEffect(() => {
    const figure = figureRef.current;
    if (!figure) return;
    const canvas = figure.querySelector("canvas");
    const bubble = figure.querySelector<HTMLElement>(".speech-anchor");
    if (!canvas || !bubble) return;
    const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    if (!context) return;
    context.canvas.width = BOUNDS_SAMPLE_SIZE;
    context.canvas.height = BOUNDS_SAMPLE_SIZE;

    let frame = 0;
    let lastSample = Number.NEGATIVE_INFINITY;
    let disposed = false;
    const measure = (time: number) => {
      if (disposed) return;
      if (time - lastSample >= 16) {
        const box = canvas.getBoundingClientRect();
        context.clearRect(0, 0, BOUNDS_SAMPLE_SIZE, BOUNDS_SAMPLE_SIZE);
        context.drawImage(canvas, 0, 0, BOUNDS_SAMPLE_SIZE, BOUNDS_SAMPLE_SIZE);
        const pixels = context.getImageData(0, 0, BOUNDS_SAMPLE_SIZE, BOUNDS_SAMPLE_SIZE).data;
        const inkTop = findInkTop(pixels, BOUNDS_SAMPLE_SIZE, BOUNDS_SAMPLE_SIZE);
        if (inkTop !== null) {
          const heroTop = box.top + (inkTop / BOUNDS_SAMPLE_SIZE) * box.height;
          bubble.style.bottom = `${getBubbleBottomOffset({
            figureBottom: figure.getBoundingClientRect().bottom,
            heroTop,
            gap: BUBBLE_GAP,
            tailDepth: BUBBLE_TAIL_DEPTH,
          })}px`;
        }
        lastSample = time;
      }
      frame = window.requestAnimationFrame(measure);
    };
    frame = window.requestAnimationFrame(measure);
    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const handleHeroTap = () => {
    setSpeech((current) => advanceSpeech({ state: current, reason: "tap", lines: SPEECH_LINES }));
  };

  return (
    <div className="bot-stage">
      <div className="bot-figure" ref={figureRef}>
        <SpeechBubble
          message={message}
          revision={speech.revision}
          anchor={speech.anchorFraction}
        />
        <button
          type="button"
          className="bot-button"
          aria-label="Assistant avatar. Click to change message"
        >
          <OnboardingHero onTap={handleHeroTap} autoMotionRevision={speech.autoMotionRevision} />
        </button>
      </div>
    </div>
  );
}
