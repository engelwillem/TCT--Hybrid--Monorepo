import { generateShareOGImage } from '@/features/og/share/generate-share-og-image';
import type { ShareOGPayload } from '@/features/og/share/types';
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
    const title = snapshot.share_title || 'Community';
    const body = snapshot.share_description || 'Bagikan cerita, doa, dan refleksi bersama The Chosen Talks.';
    const meta = snapshot.share_eyebrow || 'The Chosen Talks';
    const eyebrow = snapshot.share_eyebrow || 'Community Share';

    if (snapshot.final_og_image_url) {
      return generateShareOGImage({
        kind: 'media',
        title,
        body,
        meta,
        imageUrl: snapshot.final_og_image_url,
        eyebrow,
      });
    }

    return generateShareOGImage({
      kind: 'scripture',
      title,
      body,
      meta,
      eyebrow,
    });
  }

  // 2. Fallback: fetch minimal post data and build template payload
  const post = await fetchCommunitySharePost(postId);
  const payload: ShareOGPayload = post
    ? buildCommunitySharePayload(post)
    : {
        kind: 'scripture' as const,
        title: 'Community',
        body: 'Bagikan cerita, doa, dan refleksi bersama The Chosen Talks.',
        meta: 'The Chosen Talks',
        eyebrow: 'Community Share',
      };

  return generateShareOGImage(payload);
}
