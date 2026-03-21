/**
 * Motion Language System — /today Digital Sanctuary
 *
 * A single source of truth for all animation primitives.
 * Every ritual component must import from here.
 * Never write raw duration/ease inline.
 *
 * Principles:
 * - One easing curve. Calm, editorial, iOS-like.
 * - Duration scaled by layer weight: heavier reveals are slower.
 * - Motion is breath, not performance.
 */

import type { Transition, Variants } from 'framer-motion';

// ─────────────────────────────────────────────────────────
// EASING CURVE — "The Exhale"
// Apple's standard spring-feel in cubic-bezier form.
// Consistent across every animation in the product.
// ─────────────────────────────────────────────────────────
export const ease = [0.16, 1, 0.3, 1] as const;

// ─────────────────────────────────────────────────────────
// DURATION SCALE (seconds)
// Layer-based: heavier moments breathe longer.
// ─────────────────────────────────────────────────────────
export const duration = {
  fast: 0.3,     // Micro: button state swap, inline label change
  base: 0.6,     // Standard: section seal, state swap
  calm: 1.0,     // Content: verse entry, step reveal
  slow: 1.4,     // Ceremony: completion reveal, hydration veil lift
} as const;

// ─────────────────────────────────────────────────────────
// TRANSITION PRESETS
// Pre-assembled for each experience layer.
// ─────────────────────────────────────────────────────────

/** For micro interactions: button swap, inline label. No y movement. */
export const microTransition: Transition = {
  duration: duration.fast,
  ease,
};

/** For content appearing inline: sealed state, input mount. */
export const baseTransition: Transition = {
  duration: duration.base,
  ease,
};

/** For section entry and step reveals. */
export const calmTransition: Transition = {
  duration: duration.calm,
  ease,
};

/** For the primary verse entry and hydration lift. */
export const slowTransition: Transition = {
  duration: duration.slow,
  ease,
};

// ─────────────────────────────────────────────────────────
// VARIANTS — Reusable named states
// ─────────────────────────────────────────────────────────

/** Standard entry: fades up from 10px below. For all section reveals. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

/** For the verse: slightly larger travel (12px) and slower. */
export const verseEntry: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

/** For inline content that fades in-place (no y movement). */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/** For the "seal" — content that slides up slightly when revealed. */
export const sealReveal: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

/** For the prayer "Amin" completion label — fades in from left. */
export const aminReveal: Variants = {
  hidden: { opacity: 0, x: -6 },
  visible: { opacity: 1, x: 0 },
};

// ─────────────────────────────────────────────────────────
// REDUCED MOTION PRIMITIVES
// Used when prefers-reduced-motion: reduce is active.
// Retains opacity-only crossfades — the UI stays alive
// but removes all spatial displacement.
// The core design principle: stillness, not death.
// ─────────────────────────────────────────────────────────

/** Pure opacity fade. No y/x travel. Used for ALL reduced-motion scenarios. */
export const reducedFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/** Reduced motion transition.
 *  Very short but not instant — a hint of breath to signal state change. */
export const reducedTransition: Transition = {
  duration: 0.18,
  ease: 'easeOut',
};

/** Slightly longer reduced-motion transition for ceremony moments.
 *  Completion and verse deserve a tiny extra pause even at reduced-motion. */
export const reducedCeremonyTransition: Transition = {
  duration: 0.28,
  ease: 'easeOut',
};
