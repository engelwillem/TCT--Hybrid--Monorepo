export function buildArchiveText(
  reflectionText: string,
  meditation: string,
  verseText: string,
  verseReference: string,
): string {
  return [
    "My Personal Reflection",
    "",
    "Heart Notes",
    reflectionText.trim(),
    "",
    "Reflection",
    meditation.trim(),
    "",
    "Verse",
    verseText.trim(),
    verseReference.trim(),
  ]
    .filter(Boolean)
    .join("\n");
}
