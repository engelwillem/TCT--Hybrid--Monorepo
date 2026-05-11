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
            prompt="What is one thing you are feeling today?"
            placeholder="write here..."
            ctaLabel="Pray"
            sealedLabel="Prayed"
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
