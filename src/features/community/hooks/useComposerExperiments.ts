import { useEffect, useState } from "react";

const EXPERIMENT_STORAGE_KEY = "tct:community:experiments:v1";

export type PromptToneVariant = "neutral" | "gentle" | "affirming";
export type PromptLengthVariant = "standard" | "short";
export type DraftRestoreVariant = "simple" | "supportive";

export type ComposerExperimentState = {
  promptTone: PromptToneVariant;
  promptLength: PromptLengthVariant;
  draftRestore: DraftRestoreVariant;
};

const DEFAULT_EXPERIMENTS: ComposerExperimentState = {
  promptTone: "neutral",
  promptLength: "standard",
  draftRestore: "simple",
};

// Simple sticky assignment
function assignExperiments(): ComposerExperimentState {
  if (typeof window === "undefined") return DEFAULT_EXPERIMENTS;

  try {
    const saved = window.localStorage.getItem(EXPERIMENT_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as ComposerExperimentState;
    }

    // Assign variants randomly for MVP
    const assigned: ComposerExperimentState = {
      promptTone: ["neutral", "gentle", "affirming"][Math.floor(Math.random() * 3)] as PromptToneVariant,
      promptLength: ["standard", "short"][Math.floor(Math.random() * 2)] as PromptLengthVariant,
      draftRestore: ["simple", "supportive"][Math.floor(Math.random() * 2)] as DraftRestoreVariant,
    };

    window.localStorage.setItem(EXPERIMENT_STORAGE_KEY, JSON.stringify(assigned));
    return assigned;
  } catch {
    return DEFAULT_EXPERIMENTS;
  }
}

let cachedAssignments: ComposerExperimentState | null = null;

export function useComposerExperiments() {
  const [experiments, setExperiments] = useState<ComposerExperimentState>(DEFAULT_EXPERIMENTS);

  useEffect(() => {
    if (!cachedAssignments) {
      cachedAssignments = assignExperiments();
    }
    setExperiments(cachedAssignments);
  }, []);

  return experiments;
}
