import { generateShareOGImage } from "@/features/og/share/generate-share-og-image";
import { parseRenunganShareToken } from "@/lib/renungan-share";
import { fetchRenunganShareSnapshot } from "@/lib/share-content";

export const runtime = "edge";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { token } = await params;
  const snapshot = await fetchRenunganShareSnapshot(token);
  const payload =
    snapshot
      ? {
          verseReference: snapshot.verse_reference,
          verseText: snapshot.verse_text,
          meditationExcerpt: snapshot.meditation_excerpt,
          theme: snapshot.theme ?? undefined,
        }
      : parseRenunganShareToken(token);

  return generateShareOGImage({
    kind: "scripture",
    title: payload?.verseReference || "Renungan Pribadi",
    body: payload?.meditationExcerpt || "Renungan dari The Chosen Talks.",
    meta: payload?.theme || "The Chosen Talks",
    imageUrl: null,
    eyebrow: "Renungan Share",
  });
}
