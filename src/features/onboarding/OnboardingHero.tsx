import { useCallback, useEffect, useRef, useState } from "react";
import { BotAvatar } from "bot-avatars";

import {
  ONBOARDING_HERO_BOT,
  ONBOARDING_HERO_COLOR,
  ONBOARDING_HERO_INK,
  randomizeOnboardingHero,
  tapMotionDurationSeconds,
} from "./hero-bot";
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/** Crisp hero whose shape and jump behavior change with each tap. */
export function OnboardingHero({
  onTap,
  autoMotionRevision,
}: {
  onTap: () => void;
  autoMotionRevision: number;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [variant, setVariant] = useState(() => randomizeOnboardingHero("ghost"));
  const [motionLocked, setMotionLocked] = useState(false);
  const motionLock = useRef(false);
  const lastAutoMotionRevision = useRef(autoMotionRevision);
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const avatar = useRef<HTMLCanvasElement | null>(null);
  const suppressAutomaticClick = useRef(false);
  const lastMotionRevision = useRef(autoMotionRevision);

  useEffect(
    () => () => {
      if (unlockTimer.current) clearTimeout(unlockTimer.current);
    },
    [],
  );

  const playMotion = useCallback(() => {
    if (motionLock.current) return;
    const next = randomizeOnboardingHero(variant.type);
    if (reducedMotion) {
      setVariant(next);
      return;
    }

    motionLock.current = true;
    setMotionLocked(true);
    unlockTimer.current = setTimeout(() => {
      setVariant(next);
      motionLock.current = false;
      setMotionLocked(false);
      unlockTimer.current = null;
    }, Math.ceil(tapMotionDurationSeconds(variant, next.speed) * 1000) + 50);
  }, [reducedMotion, variant]);

  useEffect(() => {
    if (autoMotionRevision === lastAutoMotionRevision.current) return;
    lastAutoMotionRevision.current = autoMotionRevision;
    playMotion();
  }, [autoMotionRevision, playMotion]);

  useEffect(() => {
    if (autoMotionRevision === lastMotionRevision.current) return;
    lastMotionRevision.current = autoMotionRevision;
    if (!reducedMotion && autoMotionRevision > 0 && avatar.current) {
      suppressAutomaticClick.current = true;
      avatar.current.click();
      suppressAutomaticClick.current = false;
    }
  }, [autoMotionRevision, reducedMotion]);

  const handleTap = () => {
    if (motionLock.current) return;
    onTap();
    playMotion();
  };

  return (
    <BotAvatar
      ref={avatar}
      {...ONBOARDING_HERO_BOT}
      {...variant}
      paused={reducedMotion || ONBOARDING_HERO_BOT.paused}
      size="100%"
      color={ONBOARDING_HERO_COLOR}
      ink={ONBOARDING_HERO_INK}
      face="eyes"
      className="bot"
      interactive={ONBOARDING_HERO_BOT.interactive && !motionLocked}
      aria-hidden="true"
      onClick={() => {
        if (suppressAutomaticClick.current) return;
        handleTap();
      }}
    />
  );
}
