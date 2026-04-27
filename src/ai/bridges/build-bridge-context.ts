import type { EmotionalEntryState } from "@/ai/core/contracts";

export function buildVersehubClarifyUrl(input: {
  verseRef: string;
  source: "renungan";
  entryState?: EmotionalEntryState | null;
  initialMentorContext?: string | null;
}) {
  const params = new URLSearchParams({
    source: input.source,
    intent: "clarify",
    verseRef: input.verseRef,
  });

  if (input.entryState) {
    params.set("entryState", input.entryState);
  }

  const normalizedContext = String(input.initialMentorContext || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1200);
  if (normalizedContext) {
    params.set("initialMentorContext", normalizedContext);
  }

  return `/versehub/id?${params.toString()}`;
}
