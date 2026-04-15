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
        ? `Ayat ini dibawa dari keadaan "${context.entryState}". Mari lihat maknanya dengan tenang.`
        : "Ayat ini dibawa dari Renungan. Mari lihat maknanya dengan tenang.",
    };
  }

  return {
    showClarifyCard: false,
    defaultActionOrder: ["explain_simple", "context", "practical_meaning", "related_verses", "prayer_from_verse"],
  };
}
