export function buildArchiveText(
  reflectionText: string,
  meditation: string,
  verseText: string,
  verseReference: string,
): string {
  return [
    "Renungan Pribadiku",
    "",
    "Isi Hati",
    reflectionText.trim(),
    "",
    "Renungan",
    meditation.trim(),
    "",
    "Ayat",
    verseText.trim(),
    verseReference.trim(),
  ]
    .filter(Boolean)
    .join("\n");
}
