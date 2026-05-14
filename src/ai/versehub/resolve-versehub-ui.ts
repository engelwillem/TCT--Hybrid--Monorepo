import type { VerseHubAssistMode } from "@/ai/core/contracts";
import type { VersehubBridgeContext } from "@/ai/versehub/resolve-versehub-request";

export type VersehubUiHints = {
  showClarifyCard: boolean;
  defaultActionOrder: VerseHubAssistMode[];
  introLabel?: string;
};

export function resolveVersehubUiHints(context: VersehubBridgeContext): VersehubUiHints {
  if (context.source === "renungan" && context.intent === "clarify") {
    return {
      showClarifyCard: true,
      defaultActionOrder: ["explain_simple", "practical_meaning", "context", "related_verses", "prayer_from_verse"],
      introLabel: context.entryState
        ? `This verse came from your "${context.entryState}" moment. Let's explore its meaning calmly.`
        : "This verse came from Reflection. Let's explore its meaning calmly.",
    };
  }

  return {
    showClarifyCard: false,
    defaultActionOrder: ["explain_simple", "context", "practical_meaning", "related_verses", "prayer_from_verse"],
  };
}
