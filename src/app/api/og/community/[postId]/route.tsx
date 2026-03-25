import { generateShareOGImage } from '@/features/og/share/generate-share-og-image';
import { buildCommunitySharePayload, fetchCommunitySharePost } from '@/lib/share-content';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = {
  width: 1200,
  height: 630,
};

type RouteContext = {
  params: Promise<{ postId: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { postId } = await params;
  const post = await fetchCommunitySharePost(postId);
  const payload = post
    ? buildCommunitySharePayload(post)
    : {
        kind: 'scripture' as const,
        title: 'Community',
        body: 'Bagikan cerita, doa, dan refleksi bersama The Chosen Talks.',
        meta: 'The Chosen Talks',
        imageUrl: null,
        eyebrow: 'Community Share',
      };

  return generateShareOGImage(payload);
}
