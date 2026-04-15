import { generateShareOGImage } from '@/features/og/share/generate-share-og-image';
import {
  buildCommunitySharePayload,
  fetchCommunitySharePost,
  fetchShareAssetSnapshot,
} from '@/lib/share-content';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

type RouteContext = { params: Promise<{ postId: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const { postId } = await params;

  // Read revision from ?v= query param (set by versioned share URL)
  const { searchParams } = new URL(request.url);
  const revision = searchParams.get('v') ?? undefined;

  // 1. Try snapshot-first: read ready ShareAsset — NO AI call here
  const snapshot = await fetchShareAssetSnapshot('community', postId, revision);
  if (snapshot?.status === 'ready' && (snapshot.share_title || snapshot.final_og_image_url)) {
    return generateShareOGImage({
      kind: snapshot.final_og_image_url ? 'media' : 'scripture',
      title: snapshot.share_title || 'Community',
      body: snapshot.share_description || 'Bagikan cerita, doa, dan refleksi bersama The Chosen Talks.',
      meta: snapshot.share_eyebrow || 'The Chosen Talks',
      imageUrl: snapshot.final_og_image_url ?? null,
      eyebrow: snapshot.share_eyebrow || 'Community Share',
    });
  }

  // 2. Fallback: fetch minimal post data and build template payload
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
