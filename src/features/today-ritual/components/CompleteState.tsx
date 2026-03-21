'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';
import { useMotionConfig } from '../hooks/useMotionConfig';

interface CompleteStateProps {
  isCompleted: boolean;
  completionTitle: string;
  completionBody: string;
  cueLabel: string;
  cueText: string;
}

export default function CompleteState({
  isCompleted,
  completionTitle,
  completionBody,
  cueLabel,
  cueText,
}: CompleteStateProps) {
  const m = useMotionConfig();
  const headingId = useId();
  if (!isCompleted) return null;

  return (
    // aria-live="polite" announces this section when it mounts.
    // role="status" is a polite live region appropriate for completion confirmations.
    // aria-atomic="true" ensures the whole message is read, not piecemeal.
    <section
      data-testid="today-completion-state"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-labelledby={headingId}
      className="flex flex-col px-6 pt-12 pb-32"
    >
      <motion.h2
        id={headingId}
        variants={m.v.section}
        initial="hidden"
        animate="visible"
        transition={m.tx.calm}
        className="text-[17px] font-medium text-foreground/80 tracking-wide"
      >
        {completionTitle}
      </motion.h2>

      <motion.p
        variants={m.v.section}
        initial="hidden"
        animate="visible"
        transition={m.reduce ? m.tx.calm : { ...m.tx.calm, delay: 0.2 }}
        className="mt-4 text-[15px] leading-[1.65] text-foreground/65"
      >
        {completionBody}
      </motion.p>

      {/* Tomorrow hook — always the quietest note before closing */}
      <motion.aside
        variants={m.v.fade}
        initial="hidden"
        animate="visible"
        transition={m.reduce ? m.tx.slow : { ...m.tx.slow, delay: 0.6 }}
        aria-label={cueLabel}
        className="mt-16 pt-8 border-t border-black/5 flex flex-col items-start w-full"
      >
        <span className="text-[12px] font-medium text-foreground/30 tracking-wide mb-2" aria-hidden="true">
          {cueLabel}
        </span>
        <p className="tct-serif text-[18px] text-foreground/60 leading-relaxed">
          {cueText}
        </p>
      </motion.aside>
    </section>
  );
}
