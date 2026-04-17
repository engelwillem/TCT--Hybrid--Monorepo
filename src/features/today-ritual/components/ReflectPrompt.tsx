'use client';

import { useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMotionConfig } from '../hooks/useMotionConfig';
import type { ReactNode } from "react";

interface ReflectPromptProps {
  title?: string | null;
  placeholder: string;
  ctaLabel: string;
  sealedLabel: string;
  prompt: string;
  value: string;
  onChange: (val: string) => void;
  onContinue: () => void;
  isDone: boolean;
  isSubmitting?: boolean;
  submittingLabel?: string;
  beforeInputSlot?: ReactNode;
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
}

export default function ReflectPrompt({
  title = null,
  prompt,
  placeholder,
  ctaLabel,
  sealedLabel,
  value,
  onChange,
  onContinue,
  isDone,
  isSubmitting = false,
  submittingLabel = "Mendoakan...",
  beforeInputSlot,
  secondaryAction,
}: ReflectPromptProps) {
  const m = useMotionConfig();
  const isFilled = value.trim().length > 0;
  // useId gives a stable, unique ID even in concurrent/server renders
  const textareaId = useId();

  return (
    <section className="flex flex-col mt-6 px-6" aria-labelledby={`${textareaId}-heading`}>
      {/* h2: major ritual section under the h1 page title */}
      {title ? (
        <h2
          id={`${textareaId}-heading`}
          className="text-[12px] font-medium text-foreground/40 tracking-wide mb-3"
        >
          {title}
        </h2>
      ) : (
        <span id={`${textareaId}-heading`} className="sr-only">
          Renungan
        </span>
      )}

      {/* The prompt is the label for the textarea. Using <label> for explicit association. */}
      <label
        htmlFor={textareaId}
        className="text-[17px] leading-[1.6] text-foreground/90 font-medium mb-6 block"
      >
        {prompt}
      </label>

      {beforeInputSlot ? <div className="mb-6">{beforeInputSlot}</div> : null}

      <AnimatePresence mode="wait">
        {!isDone ? (
          <motion.div
            key="input"
            variants={m.v.fade}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: m.tx.micro }}
            transition={m.tx.micro}
          >
            <textarea
              data-testid="today-reflection-textarea"
              id={textareaId}
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="min-h-[130px] w-full resize-none rounded-2xl border border-slate-200/80 bg-white/60 px-5 py-4 text-[16px] leading-[1.6] text-foreground/90 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)] placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all duration-300"
            />
            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                data-testid="today-reflection-submit"
                disabled={!isFilled || isSubmitting}
                onClick={onContinue}
                // Explicit aria-label provides full context for screen reader users
                aria-label={isFilled ? `${ctaLabel} refleksiku` : ctaLabel}
                className={`group w-full max-w-[300px] rounded-full px-6 py-[14px] text-[15px] font-semibold transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isFilled && !isSubmitting
                    ? 'bg-slate-900 text-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:-translate-y-[1px] hover:bg-slate-800 hover:shadow-[0_12px_24px_-12px_rgba(0,0,0,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 active:scale-95'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <span className={isFilled ? 'inline-block transition-transform duration-400 ease-out group-hover:translate-x-[2px]' : undefined}>
                  {isSubmitting ? submittingLabel : ctaLabel}
                </span>
              </button>
              {secondaryAction ? (
                <button
                  type="button"
                  disabled={Boolean(secondaryAction.disabled) || isSubmitting}
                  onClick={secondaryAction.onClick}
                  className="text-[14px] font-medium text-slate-500 transition-colors hover:text-slate-800 focus-visible:outline-none focus-visible:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {secondaryAction.label}
                </button>
              ) : null}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="sealed"
            variants={m.v.seal}
            initial="hidden"
            animate="visible"
            transition={m.tx.calm}
          >
            <textarea
              id={textareaId}
              value={value}
              readOnly
              disabled
              className="min-h-[120px] w-full resize-none rounded-2xl bg-black/[0.02] px-5 py-4 text-[15px] leading-[1.6] text-foreground/65 outline-none"
            />
            <p
              data-testid="today-reflection-sealed"
              className="mt-4 text-[12px] font-medium tracking-wide text-foreground/35"
              role="note"
              aria-label={sealedLabel}
            >
              {sealedLabel}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
