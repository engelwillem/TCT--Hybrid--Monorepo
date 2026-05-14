"use client";

import { AnimatePresence, motion, type Transition } from "framer-motion";
import { EmotionalStatePicker } from "@/components/core/EmotionalStatePicker";
import { AIToneNotice } from "@/components/core/AIToneNotice";
import ReflectPrompt from "./ReflectPrompt";
import { RENUNGAN_MODE_OPTIONS } from "../constants/renungan-mode-options";
import type { EmotionalEntryState, RenunganMode } from "@/features/ux-architecture/types";

type RitualReflectStageProps = {
  show: boolean;
  isDone: boolean;
  isSubmitting: boolean;
  activeActionText: string;
  entryState: EmotionalEntryState | null;
  renunganMode: RenunganMode;
  submittingLabel: string;
  transitionCalm: Transition;
  transitionMicro: Transition;
  onEntryStateChange: (value: EmotionalEntryState | null) => void;
  onModeChange: (mode: RenunganMode) => void;
  onTextChange: (value: string) => void;
  onContinue: () => void;
  onSkip: () => void;
};

export function RitualReflectStage({
  show,
  isDone,
  isSubmitting,
  activeActionText,
  entryState,
  renunganMode,
  submittingLabel,
  transitionCalm,
  transitionMicro,
  onEntryStateChange,
  onModeChange,
  onTextChange,
  onContinue,
  onSkip,
}: RitualReflectStageProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {show ? (
        <motion.div
          key="ritual-reflect"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10, transition: transitionMicro }}
          transition={transitionCalm}
        >
          <ReflectPrompt
            prompt="What is one thing you are feeling today?"
            placeholder="If you want, write a little about what you are feeling."
            ctaLabel="Pray over this"
            sealedLabel="Prayed"
            value={activeActionText}
            onChange={onTextChange}
            onContinue={onContinue}
            secondaryAction={{
              label: "Skip writing, give me one anchor",
              onClick: onSkip,
              disabled: isSubmitting,
            }}
            isDone={isDone}
            isSubmitting={isSubmitting}
            submittingLabel={submittingLabel}
            beforeInputSlot={
              <div className="space-y-4">
                <EmotionalStatePicker value={entryState} onChange={onEntryStateChange} />
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Support mode</p>
                  <div className="flex flex-wrap gap-2">
                    {RENUNGAN_MODE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onModeChange(option.value)}
                        className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                          renunganMode === option.value
                            ? "border-slate-800 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <AIToneNotice tone="gentle" text="Short is okay. Leaving it blank is okay too. We will just take one small step." />
              </div>
            }
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
