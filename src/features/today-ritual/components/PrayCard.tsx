'use client';

import { useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMotionConfig } from '../hooks/useMotionConfig';

interface PrayCardProps {
  label: string;
  text: string;
  ctaLabel: string;
  completionLabel: string;
  onComplete: () => void;
  isCompleted: boolean;
}

export default function PrayCard({
  label,
  text,
  ctaLabel,
  completionLabel,
  onComplete,
  isCompleted,
}: PrayCardProps) {
  const m = useMotionConfig();
  const headingId = useId();

  return (
    <section className="flex flex-col px-6" aria-labelledby={headingId}>
      {/* h2: sibling section to Refleksi, under the h1 page title */}
      <h2
        id={headingId}
        className="text-[12px] font-medium text-foreground/40 tracking-wide mb-3"
      >
        {label}
      </h2>

      {/* Prayer text as a blockquote — it's a curated spiritual citation */}
      <blockquote className="tct-serif text-[20px] leading-[1.6] text-foreground/80">
        {text}
      </blockquote>

      <div className="mt-8 flex justify-start">
        <AnimatePresence mode="wait">
          {!isCompleted ? (
            <motion.button
              key="btn"
              data-testid="today-prayer-submit"
              exit={{ opacity: 0, transition: m.tx.micro }}
              onClick={onComplete}
              // Aria-label gives a complete action description for VoiceOver/TalkBack
              aria-label={`${ctaLabel} — tandai doa selesai`}
              className="rounded-full bg-black/[0.05] border border-black/5 px-8 py-[12px] text-[15px] font-medium text-foreground/80 transition-colors hover:bg-black/[0.08] active:scale-95"
            >
              {ctaLabel}
            </motion.button>
          ) : (
            <motion.p
              key="text"
              data-testid="today-prayer-completed"
              variants={m.v.amin}
              initial="hidden"
              animate="visible"
              transition={m.tx.base}
              className="py-[12px] text-[16px] font-medium text-foreground tracking-wide"
            >
              {completionLabel}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
