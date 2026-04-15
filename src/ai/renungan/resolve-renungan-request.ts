import type { EmotionalEntryState, RenunganMode, UiDensity } from "@/ai/core/contracts";
import { toRenunganApiRequest } from "@/ai/core/normalize";

export type ResolvedRenunganBehavior = {
  mode: RenunganMode;
  tone: "gentle";
  density: UiDensity;
  maxVisibleFollowUps: number;
  apiRequest: ReturnType<typeof toRenunganApiRequest>;
};

export function resolveDefaultRenunganMode(entryState: EmotionalEntryState | null): RenunganMode {
  switch (entryState) {
    case "clarity":
      return "practical_step";
    case "overwhelmed":
    case "disconnected":
    case "connect":
    case "neutral":
    default:
      return "calm_heart";
  }
}

export function resolveRenunganBehavior(input: {
  entryState: EmotionalEntryState | null;
  selectedMode?: RenunganMode | null;
  reflectionText?: string;
}): ResolvedRenunganBehavior {
  const mode = input.selectedMode ?? resolveDefaultRenunganMode(input.entryState);
  const lowDensity = input.entryState === "overwhelmed" || input.entryState === "disconnected";

  return {
    mode,
    tone: "gentle",
    density: lowDensity ? "low" : "standard",
    maxVisibleFollowUps: lowDensity ? 2 : 4,
    apiRequest: toRenunganApiRequest({
      entryState: input.entryState,
      mode,
      reflectionText: input.reflectionText,
    }),
  };
}
