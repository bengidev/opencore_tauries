import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { BotAvatar } from "bot-avatars";

import {
  ONBOARDING_HERO_BOT,
  ONBOARDING_HERO_COLOR,
  ONBOARDING_HERO_INK,
  randomizeOnboardingHero,
  tapMotionDurationSeconds,
} from "./hero-bot";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

export type OnboardingHeroHandle = {
  /** User activation: advance speech and play hop/spin-hop motion. */
  activate: () => void;
};

/** Fabric ghost hero whose jump behavior changes with each activation. */
export const OnboardingHero = forwardRef<
  OnboardingHeroHandle,
  {
    onTap: () => void;
    autoMotionRevision: number;
  }
>(function OnboardingHero({ onTap, autoMotionRevision }, ref) {
  const reducedMotion = usePrefersReducedMotion();
  const [variant, setVariant] = useState(() => randomizeOnboardingHero("ghost"));
  const [motionLocked, setMotionLocked] = useState(false);
  const motionLock = useRef(false);
  const lastAutoMotionRevision = useRef(autoMotionRevision);
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const avatar = useRef<HTMLCanvasElement | null>(null);
  const skipUserActivate = useRef(false);

  useEffect(
    () => () => {
      if (unlockTimer.current) clearTimeout(unlockTimer.current);
    },
    [],
  );

  const pokeAvatar = useCallback(() => {
    if (reducedMotion || !avatar.current) return;
    skipUserActivate.current = true;
    avatar.current.click();
    skipUserActivate.current = false;
  }, [reducedMotion]);

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

  const activate = useCallback(
    (options?: { poke?: boolean }) => {
      if (motionLock.current) return;
      onTap();
      playMotion();
      if (options?.poke ?? true) pokeAvatar();
    },
    [onTap, playMotion, pokeAvatar],
  );

  useImperativeHandle(
    ref,
    () => ({
      activate: () => activate({ poke: true }),
    }),
    [activate],
  );

  useEffect(() => {
    if (autoMotionRevision === lastAutoMotionRevision.current) return;
    lastAutoMotionRevision.current = autoMotionRevision;
    playMotion();
    pokeAvatar();
  }, [autoMotionRevision, playMotion, pokeAvatar]);

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
      onClick={(event) => {
        event.stopPropagation();
        if (skipUserActivate.current) return;
        activate({ poke: false });
      }}
    />
  );
});
