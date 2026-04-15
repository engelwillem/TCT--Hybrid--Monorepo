import { generateShareOGImage } from '@/features/og/share/generate-share-og-image';
import { fetchVerseShareData, fetchShareAssetSnapshot } from '@/lib/share-content';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = { width: 840, height: 440 };

type RouteContext = { params: Promise<{ lang: string; slug: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const { lang, slug } = await params;

  // Read revision from ?v= (set by versioned share URL)
  const { searchParams } = new URL(request.url);
  const revision = searchParams.get('v') ?? undefined;
  const subjectId = `${lang}:${slug}`;

  // 1. Snapshot-first: read ready ShareAsset — NO AI call here
  const snapshot = await fetchShareAssetSnapshot('versehub', subjectId, revision);
  if (snapshot?.status === 'ready' && (snapshot.share_title || snapshot.final_og_image_url)) {
    return generateShareOGImage({
      kind: 'scripture',
      title: snapshot.share_title || 'VerseHub',
      body: snapshot.share_description || 'Firman yang dibagikan dari The Chosen Talks.',
      meta: snapshot.share_eyebrow || 'The Chosen Talks',
      imageUrl: snapshot.final_og_image_url ?? null,
      eyebrow: snapshot.share_eyebrow || 'VerseHub Share',
    });
  }

  // 2. Fallback: fetch raw verse data and build template payload
  const verse = await fetchVerseShareData(lang, slug);

  return generateShareOGImage({
    kind: 'scripture',
    title: verse?.reference || 'VerseHub',
    body: verse?.text || 'Firman yang dibagikan dari The Chosen Talks.',
    meta: verse?.translation_name || verse?.provider || 'The Chosen Talks',
    imageUrl: verse?.og_image_url ?? null,
    eyebrow: 'VerseHub Share',
  });
}
