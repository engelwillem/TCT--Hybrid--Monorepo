import type { EmotionalEntryState, RenunganMode } from "./contracts";

export type RenunganApiRequest = {
  entry_state?: EmotionalEntryState | null;
  response_mode: RenunganMode;
  reflection_text?: string;
};

export function toRenunganApiRequest(input: {
  entryState: EmotionalEntryState | null;
  mode: RenunganMode;
  reflectionText?: string;
}): RenunganApiRequest {
  return {
    entry_state: input.entryState,
    response_mode: input.mode,
    reflection_text: input.reflectionText?.trim() || undefined,
  };
}
