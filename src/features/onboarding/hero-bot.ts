import { autoInk, botAvatarPresets, type BotAvatarSquashEase, type BotAvatarState } from "bot-avatars";

export type OnboardingHeroVariant = {
  type: "ghost";
  state: BotAvatarState;
  speed: number;
  turn: number;
  jumpHeight: number;
  jumpTime: number;
  jumpStretch: number;
  jumpSpin: number;
  jumpLean: number;
  jumpEvery: number;
  jumpLand: number;
  jumpSquash: number;
  jumpSquashTime: number;
  jumpSquashEase: BotAvatarSquashEase;
  jumpGroundTime: number;
  jumpGroundEase: BotAvatarSquashEase;
  jumpRiseTime: number;
  jumpRiseEase: BotAvatarSquashEase;
  jumpClickSquashTime: number;
  whirl: number;
  whirlSize: number;
  whirlWidth: number;
  whirlLength: number;
  whirlTilt: number;
};

const GHOST_BODY = botAvatarPresets.ghost.color;
const GHOST_INK = autoInk(GHOST_BODY);

export const ONBOARDING_HERO_COLOR = GHOST_BODY;
export const ONBOARDING_HERO_INK = GHOST_INK;

export const INITIAL_ONBOARDING_HERO: OnboardingHeroVariant = {
  type: "ghost",
  state: "default",
  speed: 1,
  turn: 0.6,
  jumpHeight: 26,
  jumpTime: 0.68,
  jumpStretch: 1,
  jumpSpin: 0,
  jumpLean: 6,
  jumpEvery: 0,
  jumpLand: 0,
  jumpSquash: 1.15,
  jumpSquashTime: 0.37,
  jumpSquashEase: "pulse",
  jumpGroundTime: 0.11,
  jumpGroundEase: "pulse",
  jumpRiseTime: 0.33,
  jumpRiseEase: "pulse",
  jumpClickSquashTime: 0.24,
  whirl: 0,
  whirlSize: 1,
  whirlWidth: 1,
  whirlLength: 1,
  whirlTilt: 1,
};

const CLICK_EASE_TAIL: Record<BotAvatarSquashEase, number> = {
  sharp: 0,
  pulse: 2 / 7,
  soft: 0.5,
  bouncy: 0.144,
};

export function tapMotionDurationSeconds(variant: OnboardingHeroVariant, speed: number): number {
  return (
    variant.jumpClickSquashTime +
    variant.jumpTime +
    CLICK_EASE_TAIL[variant.jumpSquashEase] * variant.jumpClickSquashTime +
    Math.max(0, variant.jumpGroundTime) +
    variant.jumpRiseTime +
    Math.max(0, variant.jumpLand) +
    0.05
  ) / speed;
}

export function randomizeOnboardingHero(
  currentType: "ghost",
  random: () => number = Math.random,
): OnboardingHeroVariant {
  const spinHop = random() >= 0.5;
  return {
    ...INITIAL_ONBOARDING_HERO,
    type: currentType,
    jumpSpin: spinHop ? 1 : 0,
    whirl: spinHop ? 0.4 : 0,
  };
}

/** Matches the libraries.dev/bots playground defaults for Ghost + Fabric. */
export const ONBOARDING_HERO_BOT = {
  shading: "fabric" as const,
  theme: "auto" as const,
  paused: false,
  interactive: true,
};
