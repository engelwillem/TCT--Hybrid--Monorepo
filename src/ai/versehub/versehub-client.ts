export async function fetchVersehubMentorInsight(lang: string, verseRef: string) {
  const response = await fetch(`/api/versehub/${encodeURIComponent(lang)}/${encodeURIComponent(verseRef)}/mentor`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch versehub mentor insight");
  }

  return response.json();
}
