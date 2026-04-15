import type { EmotionalEntryState } from "@/ai/core/contracts";

export function buildVersehubClarifyUrl(input: {
  verseRef: string;
  source: "renungan";
  entryState?: EmotionalEntryState | null;
}) {
  const params = new URLSearchParams({
    source: input.source,
    intent: "clarify",
    verseRef: input.verseRef,
  });

  if (input.entryState) {
    params.set("entryState", input.entryState);
  }

  return `/versehub/id?${params.toString()}`;
}
