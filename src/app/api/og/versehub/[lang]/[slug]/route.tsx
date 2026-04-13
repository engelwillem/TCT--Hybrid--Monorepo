import { generateShareOGImage } from '@/features/og/share/generate-share-og-image';
import { fetchVerseShareData } from '@/lib/share-content';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = {
  width: 840,
  height: 440,
};

type RouteContext = {
  params: Promise<{ lang: string; slug: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { lang, slug } = await params;
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
