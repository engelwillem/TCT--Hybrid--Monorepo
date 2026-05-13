import { generateShareOGImage } from '@/features/og/share/generate-share-og-image';
import { parseRenunganShareToken } from '@/lib/renungan-share';
import { fetchRenunganShareSnapshot, fetchShareAssetSnapshot } from '@/lib/share-content';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const { token } = await params;

  // Read revision from ?v= (set by versioned share URL)
  const { searchParams } = new URL(request.url);
  const revision = searchParams.get('v') ?? undefined;

  // 1. Snapshot-first: read ready ShareAsset — NO AI call here
  const snapshot = await fetchShareAssetSnapshot('renungan', token, revision);
  if (snapshot?.status === 'ready' && (snapshot.share_title || snapshot.final_og_image_url)) {
    return generateShareOGImage({
      kind: 'scripture',
      title: snapshot.share_title || 'Personal Reflection',
      body: snapshot.share_description || 'Reflection from The Chosen Talks.',
      meta: snapshot.share_eyebrow || 'The Chosen Talks',
      imageUrl: snapshot.final_og_image_url ?? null,
      eyebrow: snapshot.share_eyebrow || 'Reflection Share',
    });
  }

  // 2. Fallback: fetch raw renungan snapshot from backend
  const rawSnapshot = await fetchRenunganShareSnapshot(token);
  const payload = rawSnapshot
    ? {
        verseReference: rawSnapshot.verse_reference,
        verseText: rawSnapshot.verse_text,
        meditationExcerpt: rawSnapshot.meditation_excerpt,
        theme: rawSnapshot.theme ?? undefined,
      }
    : parseRenunganShareToken(token); // final fallback: try to decode base64 token

  return generateShareOGImage({
    kind: 'scripture',
    title: payload?.verseReference || 'Personal Reflection',
    body: payload?.meditationExcerpt || 'Reflection from The Chosen Talks.',
    meta: payload?.theme || 'The Chosen Talks',
    imageUrl: null,
    eyebrow: 'Reflection Share',
  });
}
