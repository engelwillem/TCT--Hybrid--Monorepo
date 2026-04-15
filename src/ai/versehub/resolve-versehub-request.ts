import type { BridgeIntent, EmotionalEntryState } from "@/ai/core/contracts";

export type VersehubBridgeContext = {
  source?: "renungan" | "community";
  intent?: BridgeIntent;
  verseRef?: string;
  entryState?: EmotionalEntryState | null;
};

function toEntryState(value: string | null): EmotionalEntryState | null {
  if (!value) return null;
  if (value === "overwhelmed" || value === "disconnected" || value === "clarity" || value === "connect" || value === "neutral") {
    return value;
  }
  return null;
}

export function parseVersehubBridgeContext(params: URLSearchParams): VersehubBridgeContext {
  const sourceRaw = params.get("source");
  const intentRaw = params.get("intent");

  return {
    source: sourceRaw === "renungan" || sourceRaw === "community" ? sourceRaw : undefined,
    intent: intentRaw === "regulate" || intentRaw === "clarify" || intentRaw === "connect" ? intentRaw : undefined,
    verseRef: params.get("verseRef") || undefined,
    entryState: toEntryState(params.get("entryState")),
  };
}
