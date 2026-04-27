"use client";

import { AnimatePresence, motion, type Transition } from "framer-motion";
import ReflectPrompt from "./ReflectPrompt";

type RitualReflectStageProps = {
  show: boolean;
  isDone: boolean;
  isSubmitting: boolean;
  activeActionText: string;
  submittingLabel: string;
  transitionCalm: Transition;
  transitionMicro: Transition;
  onTextChange: (value: string) => void;
  onContinue: () => void;
};

export function RitualReflectStage({
  show,
  isDone,
  isSubmitting,
  activeActionText,
  submittingLabel,
  transitionCalm,
  transitionMicro,
  onTextChange,
  onContinue,
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
            placeholder="tulis disini..."
            ctaLabel="Doakan"
            sealedLabel="Telah didoakan"
            value={activeActionText}
            onChange={onTextChange}
            onContinue={onContinue}
            isDone={isDone}
            isSubmitting={isSubmitting}
            submittingLabel={submittingLabel}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
