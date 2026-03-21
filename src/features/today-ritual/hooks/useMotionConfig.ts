'use client';

/**
 * useMotionConfig — Accessibility-Aware Motion Hook
 *
 * Single source of resolved motion tokens for all today ritual components.
 * Respects prefers-reduced-motion at runtime.
 *
 * Usage:
 *   const m = useMotionConfig();
 *   <motion.div variants={m.v.verse} transition={m.tx.slow} ...>
 */

import { useReducedMotion } from 'framer-motion';
import type { Variants, Transition } from 'framer-motion';

import {
  // Variants
  fadeUp,
  verseEntry,
  fadeIn,
  sealReveal,
  aminReveal,
  reducedFade,
  // Full motion transitions
  microTransition,
  baseTransition,
  calmTransition,
  slowTransition,
  // Reduced motion transitions
  reducedTransition,
  reducedCeremonyTransition,
} from '../motion';

export interface MotionConfig {
  /** True if prefers-reduced-motion: reduce is active */
  reduce: boolean;
  /** Resolved variants — pick the right one for the experience layer */
  v: {
    verse: Variants;    // The daily verse (primary entrance)
    section: Variants;  // Step reveal (PrayCard, CompleteState parent)
    seal: Variants;     // Reflection sealed state
    amin: Variants;     // Prayer completion label
    fade: Variants;     // In-place fade (reference line, tomorrow cue)
  };
  /** Resolved transitions — matched to layer weight */
  tx: {
    micro: Transition;     // Button state swap, label change
    base: Transition;      // Standard single-step confirmation
    calm: Transition;      // Section entry, seal entry
    slow: Transition;      // Verse entry, completion, veil lift
  };
}

export function useMotionConfig(): MotionConfig {
  const shouldReduce = useReducedMotion() ?? false;

  if (shouldReduce) {
    return {
      reduce: true,
      v: {
        verse:   reducedFade,
        section: reducedFade,
        seal:    reducedFade,
        amin:    reducedFade,
        fade:    reducedFade,
      },
      tx: {
        // Even in reduced-motion, we keep a very subtle duration.
        // Instant state changes feel like bugs, not accessibility.
        micro: reducedTransition,
        base:  reducedTransition,
        calm:  reducedTransition,
        slow:  reducedCeremonyTransition,
      },
    };
  }

  return {
    reduce: false,
    v: {
      verse:   verseEntry,
      section: fadeUp,
      seal:    sealReveal,
      amin:    aminReveal,
      fade:    fadeIn,
    },
    tx: {
      micro: microTransition,
      base:  baseTransition,
      calm:  calmTransition,
      slow:  slowTransition,
    },
  };
}
