import type { EmotionalEntryState } from "@/ai/core/contracts";

export function shouldShowEscapeHatch(input: {
  entryState?: EmotionalEntryState | null;
  hasUnsavedDraft: boolean;
  isReplying: boolean;
}): boolean {
  if (input.isReplying) return false;
  if (input.entryState === "overwhelmed" || input.entryState === "disconnected") return true;
  return input.hasUnsavedDraft;
}
