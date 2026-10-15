import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";

import { findInkTop, getBubbleBottomOffset } from "./hero-bounds";
import { OnboardingHero, type OnboardingHeroHandle } from "./OnboardingHero";
import { SPEECH_LINES, SpeechBubble } from "./SpeechBubble";
import { advanceSpeech, type OnboardingSpeechState } from "./speech-rotation";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

export const SPEECH_ROTATION_DELAY_MS = 5000;

const BOUNDS_SAMPLE_SIZE = 128;
const BUBBLE_GAP = 20;
const BUBBLE_TAIL_DEPTH = 9;

function isActivationKey(event: KeyboardEvent) {
  return event.key === "Enter" || event.key === " ";
}

export function HeroStage() {
  const reducedMotion = usePrefersReducedMotion();
  const heroRef = useRef<OnboardingHeroHandle>(null);
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
    if (reducedMotion) return;

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
      if (!document.hidden && time - lastSample >= 16) {
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

    const onVisibilityChange = () => {
      if (!document.hidden) lastSample = Number.NEGATIVE_INFINITY;
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    frame = window.requestAnimationFrame(measure);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  const handleHeroTap = () => {
    setSpeech((current) => advanceSpeech({ state: current, reason: "tap", lines: SPEECH_LINES }));
  };

  const activateHero = () => {
    heroRef.current?.activate();
  };

  return (
    <div className="bot-stage">
      <div className="bot-figure" ref={figureRef}>
        <SpeechBubble
          message={message}
          revision={speech.revision}
          anchor={speech.anchorFraction}
        />
        <div
          role="button"
          tabIndex={0}
          className="bot-button"
          aria-label="Assistant avatar. Activate to change message"
          onClick={activateHero}
          onKeyDown={(event) => {
            if (!isActivationKey(event)) return;
            event.preventDefault();
            activateHero();
          }}
        >
          <OnboardingHero
            ref={heroRef}
            onTap={handleHeroTap}
            autoMotionRevision={speech.autoMotionRevision}
          />
        </div>
      </div>
    </div>
  );
}
