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
            prompt="Apa satu hal yang sedang kamu rasakan hari ini?"
            placeholder="Kalau ingin, tulis sedikit apa yang sedang kamu rasakan."
            ctaLabel="Doakan"
            sealedLabel="Telah didoakan"
            value={activeActionText}
            onChange={onTextChange}
            onContinue={onContinue}
            secondaryAction={{
              label: "Lewati tulisan, beri satu pegangan",
              onClick: onSkip,
              disabled: isSubmitting,
            }}
            isDone={isDone}
            isSubmitting={isSubmitting}
            submittingLabel={submittingLabel}
            beforeInputSlot={
              <div className="flex flex-col gap-6">
                <EmotionalStatePicker value={entryState} onChange={onEntryStateChange} />
                <div className="flex flex-col gap-2.5">
                  <p className="text-[13px] font-medium text-slate-500">Mode bantuan</p>
                  <div className="flex flex-nowrap overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1 gap-2.5">
                    {RENUNGAN_MODE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onModeChange(option.value)}
                        className={`flex-shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                          renunganMode === option.value
                            ? "border-slate-800 bg-slate-900 text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <AIToneNotice tone="gentle" text="Boleh singkat. Boleh juga kosong. Kita ambil satu langkah kecil saja." />
              </div>
            }
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
