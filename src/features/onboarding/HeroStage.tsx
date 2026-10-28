import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { placeBubble } from "./bubble-placement";
import {
  advanceConversation,
  CONVERSATION_LINES,
  INITIAL_CONVERSATION,
} from "./hero-conversation";
import { createSharkRoster, type SharkHero } from "./hero-roster";
import type { OceanFrame } from "./ocean/engine";
import type { GlassZone } from "./ocean/renderer";
import { SharkOcean } from "./SharkOcean";
import { SpeechBubble } from "./SpeechBubble";

export const SPEECH_HOLD_MS = 5200;
export const SPEECH_REST_MS = 900;

const COPY_CLEARANCE = 24;
const HEADER_CLEARANCE = 12;

type StageRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};



export function HeroStage({
  theme,
  headerInset,
  footerInset,
}: {
  theme: "light" | "dark";
  headerInset: number;
  footerInset: number;
}) {
  const [heroes] = useState<SharkHero[]>(createSharkRoster);
  const [conversation, setConversation] = useState(INITIAL_CONVERSATION);
  const [glassZone, setGlassZone] = useState<GlassZone | null>(null);
  const speakerId = heroes[conversation.speakerIndex]?.id ?? 1;
  const line = CONVERSATION_LINES[conversation.lineIndex] ?? CONVERSATION_LINES[0];
  const active = conversation.phase === "speaking";

  const stageRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const anchorPositionRef = useRef<{ left: number; top: number } | null>(null);
  const lastSpeakerRef = useRef<number | null>(null);
  const frameRef = useRef<OceanFrame | null>(null);
  const copyRectRef = useRef<StageRect | null>(null);
  const speakerRef = useRef(speakerId);
  const activeRef = useRef(active);
  const bubbleSizeRef = useRef({ width: 0, height: 0 });
  const readyRef = useRef(false);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    speakerRef.current = speakerId;
    activeRef.current = active;
  }, [speakerId, active]);

  const measureBubble = useCallback(() => {
    const bubble = bubbleRef.current;
    if (!bubble) return;
    bubbleSizeRef.current = { width: bubble.offsetWidth, height: bubble.offsetHeight };
  }, []);

  const positionBubble = useCallback((frame: OceanFrame) => {
    if (!activeRef.current) return;

    const anchor = anchorRef.current;
    const bubble = bubbleRef.current;
    const head = frame.heads.find((candidate) => candidate.id === speakerRef.current);
    if (!anchor || !bubble || !head) return;

    const placement = placeBubble({
      headX: head.x,
      headY: head.y,
      stageWidth: frame.width,
      stageHeight: frame.height,
      bubbleWidth: bubbleSizeRef.current.width,
      bubbleHeight: bubbleSizeRef.current.height,
      safeTop: headerInset + HEADER_CLEARANCE,
      avoid: copyRectRef.current,
      avoidPad: COPY_CLEARANCE,
    });

    const target = { left: placement.left, top: placement.top };
    if (lastSpeakerRef.current !== speakerRef.current) {
      lastSpeakerRef.current = speakerRef.current;
      anchorPositionRef.current = target;
    } else if (anchorPositionRef.current) {
      const follow = 0.35;
      anchorPositionRef.current = {
        left: anchorPositionRef.current.left + (target.left - anchorPositionRef.current.left) * follow,
        top: anchorPositionRef.current.top + (target.top - anchorPositionRef.current.top) * follow,
      };
    } else {
      anchorPositionRef.current = target;
    }

    const position = anchorPositionRef.current;
    const tailX = Math.max(
      14,
      Math.min(head.x - position.left, bubbleSizeRef.current.width - 14),
    );

    anchor.style.transform = `translate3d(${position.left}px, ${position.top}px, 0)`;
    anchor.style.visibility = placement.visible ? "visible" : "hidden";
    bubble.dataset.placement = placement.placement;
    bubble.style.setProperty("--tail-x", `${tailX}px`);
  }, [headerInset]);

  const positionGlass = useCallback((frame: OceanFrame) => {
    const panel = copyRef.current;
    if (!panel) return;
    const next = frame.glassOccupied ? "true" : "false";
    if (panel.dataset.crossed !== next) panel.dataset.crossed = next;
  }, []);

  const handleFrame = useCallback(
    (frame: OceanFrame) => {
      frameRef.current = frame;
      if (!readyRef.current) {
        readyRef.current = true;
        setReady(true);
      }
      positionBubble(frame);
      positionGlass(frame);
    },
    [positionBubble, positionGlass],
  );

  const pickSpeaker = useCallback(
    (currentIndex: number, frame: OceanFrame) => {
      const copy = copyRectRef.current;
      const { width, height } = bubbleSizeRef.current;
      if (!copy || width === 0 || height === 0) {
        return (currentIndex + 1) % heroes.length;
      }

      for (let step = 1; step < heroes.length; step += 1) {
        const index = (currentIndex + step) % heroes.length;
        const head = frame.heads.find((candidate) => candidate.id === heroes[index].id);
        if (!head) continue;

        const placement = placeBubble({
          headX: head.x,
          headY: head.y,
          stageWidth: frame.width,
          stageHeight: frame.height,
          bubbleWidth: width,
          bubbleHeight: height,
          safeTop: headerInset + HEADER_CLEARANCE,
          avoid: copy,
          avoidPad: COPY_CLEARANCE,
        });
        if (placement.visible) return index;
      }

      return (currentIndex + 1) % heroes.length;
    },
    [headerInset, heroes],
  );

  useEffect(() => {
    const delay = active ? SPEECH_HOLD_MS : SPEECH_REST_MS;
    const timer = window.setTimeout(() => {
      setConversation((current) => {
        const frame = frameRef.current;
        const nextIndex =
          current.phase === "resting" && frame
            ? pickSpeaker(current.speakerIndex, frame)
            : (current.speakerIndex + 1) % heroes.length;
        return advanceConversation(current, heroes.length, CONVERSATION_LINES.length, nextIndex);
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [active, conversation.revision, heroes.length, pickSpeaker]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const copy = copyRef.current;
    if (!stage || !copy) return;

    const update = () => {
      const stageRect = stage.getBoundingClientRect();
      const copyRect = copy.getBoundingClientRect();
      if (stageRect.width < 1 || stageRect.height < 1) return;

      const left = copyRect.left - stageRect.left;
      const top = copyRect.top - stageRect.top;
      copyRectRef.current = {
        left,
        top,
        right: left + copyRect.width,
        bottom: top + copyRect.height,
      };
      const nextZone = {
        x: left,
        y: top,
        width: copyRect.width,
        height: copyRect.height,
        radius: 18,
      };
      setGlassZone((previous) =>
        previous &&
        previous.x === nextZone.x &&
        previous.y === nextZone.y &&
        previous.width === nextZone.width &&
        previous.height === nextZone.height &&
        previous.radius === nextZone.radius
          ? previous
          : nextZone,
      );
      if (frameRef.current) positionGlass(frameRef.current);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    observer.observe(copy);
    return () => observer.disconnect();
  }, [positionGlass]);

  useLayoutEffect(() => {
    measureBubble();
    if (!active) return;

    const frame = frameRef.current;
    if (frame) positionBubble(frame);
  }, [active, conversation.revision, line, measureBubble, positionBubble]);

  return (
    <section
      className="onboarding-content"
      aria-labelledby="onboarding-title"
      ref={stageRef}
    >
      <SharkOcean
        heroes={heroes}
        onFrame={handleFrame}
        theme={theme}
        glassZone={glassZone}
        headerInset={headerInset}
        footerInset={footerInset}
      />

      <div className="speech-layer" aria-hidden="true">
        <div
          ref={anchorRef}
          className="speech-anchor"
          data-ready={ready}
          data-visible={active}
        >
          <div ref={bubbleRef} className="speech-bubble">
            <SpeechBubble
              key={conversation.revision}
              message={line}
              revision={conversation.revision}
              active={active}
            />
          </div>
        </div>
      </div>

      <div className="copy-column">
        <div className="copy-content" ref={copyRef}>
          <div className="copy-panel" aria-hidden="true" />
          <div className="copy-body">
            <p className="eyebrow">
              <span>01</span> PRIVATE INTELLIGENCE / DESKTOP
            </p>
            <h1 id="onboarding-title">
              A quieter way
              <br />
              <em>to think.</em>
            </h1>
            <p className="intro">
              OpenCore keeps your AI tools close, local, and ready when the work gets serious.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
