import type { EmotionalEntryState } from "@/ai/core/contracts";

export type CommunityComposerMode = "default" | "prayer_request" | "reflection" | "support_reply";

export type CommunityAiAssistAction =
  | "refine"
  | "shorten"
  | "make_prayer_request"
  | "gentler_tone"
  | "suggest_caption";

export function resolveVisibleCommunityActions(input: {
  mode: CommunityComposerMode;
  entryState?: EmotionalEntryState | null;
}): CommunityAiAssistAction[] {
  if (input.mode === "prayer_request") {
    return ["refine", "shorten", "gentler_tone"];
  }

  if (input.entryState === "overwhelmed" || input.entryState === "disconnected") {
    return ["refine", "shorten"];
  }

  return ["refine", "shorten", "make_prayer_request"];
}
