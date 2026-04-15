import { callLaravelApi } from '@/lib/laravel-api';

type VerseShareData = {
  ref: string;
  reference: string;
  text: string;
  translation_name?: string | null;
  provider?: string | null;
  og_image_url?: string | null;
  canonical_url?: string | null;
};

export type RenunganShareSnapshot = {
  token: string;
  lang: string;
  verse_reference: string;
  verse_text: string;
  meditation_excerpt: string;
  theme?: string | null;
  expires_at?: string | null;
};

export type ShareAssetSnapshot = {
  revision: string;
  surface: string;
  status: string;
  share_title: string | null;
  share_description: string | null;
  share_eyebrow: string | null;
  og_style: string;
  final_og_image_url: string | null;
  source_image_url: string | null;
  share_meta: Record<string, unknown> | null;
};

type CommunitySharePost = {
  id: string;
  type: string;
  type_label: string;
  text: string;
  title?: string | null;
  imageUrl?: string | null;
  thumbPath?: string | null;
  mediaPaths: string[];
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    isOfficial?: boolean;
  };
  metadata?: {
    ref?: string;
    reference?: string;
    quote?: string;
    preview_media_index?: number;
    media_aspect_ratio?: '4:5' | 'og' | 'auto';
    text_position?: 'above' | 'below';
    imageUrl?: string;
  };
};

type CommunityApiPost = {
  id: string | number;
  type?: string;
  type_label?: string;
  text?: string;
  title?: string | null;
  imageUrl?: string | null;
  image_path?: string | null;
  thumb_path?: string | null;
  mediaPaths?: string[] | null;
  media_paths?: string[] | null;
  metadata?: CommunitySharePost['metadata'];
  createdAt?: string;
  created_at?: string;
  author?: {
    id?: string | number;
    name?: string | null;
    avatarUrl?: string | null;
    avatar_url?: string | null;
    isOfficial?: boolean;
    is_official?: boolean;
    is_admin?: boolean;
  };
};

function resolveApiOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_LARAVEL_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.LARAVEL_API_BASE_URL ||
    'https://api.thechoosentalks.org';
  try {
    return new URL(raw).origin;
  } catch {
    return 'https://api.thechoosentalks.org';
  }
}

function extractKnownAssetPath(pathname: string): string | null {
  if (!pathname) return null;
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (normalized.startsWith('/api/v1/community/media/')) return normalized;
  if (normalized.startsWith('/storage/community/posts/'))
    return normalized.replace('/storage/community/posts/', '/api/v1/community/media/community/posts/');
  if (normalized.startsWith('/storage/') || normalized.startsWith('/api/v1/avatar/')) return normalized;
  const m1 = normalized.indexOf('/api/v1/community/media/');
  if (m1 >= 0) return normalized.slice(m1);
  const m2 = normalized.indexOf('/storage/community/posts/');
  if (m2 >= 0)
    return normalized.slice(m2).replace('/storage/community/posts/', '/api/v1/community/media/community/posts/');
  const m3 = normalized.indexOf('/storage/');
  if (m3 >= 0) return normalized.slice(m3);
  const m4 = normalized.indexOf('/api/v1/avatar/');
  if (m4 >= 0) return normalized.slice(m4);
  return null;
}

function normalizeCommunityAssetUrl(value?: string | null): string | undefined {
  const raw = String(value || '').trim();
  if (!raw) return undefined;
  if (raw.startsWith('blob:') || raw.startsWith('data:image/')) return raw;
  const apiOrigin = resolveApiOrigin();
  try {
    const parsed = new URL(raw);
    const knownPath = extractKnownAssetPath(parsed.pathname);
    if (knownPath) return `${apiOrigin}${knownPath}${parsed.search}${parsed.hash}`;
    return parsed.toString();
  } catch {
    const normalized = raw.startsWith('/') ? raw : `/${raw.replace(/^\/+/, '')}`;
    const knownPath = extractKnownAssetPath(normalized);
    if (knownPath) return `${apiOrigin}${knownPath}`;
    return normalized;
  }
}

function truncateText(value: string, maxLength = 220): string {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trimEnd()}…`;
}

// ---------------------------------------------------------------------------
// Snapshot-first fetch (for OG routes — no AI calls)
// ---------------------------------------------------------------------------

/**
 * Fetch a ready ShareAsset snapshot for OG route rendering.
 * Returns null if not found → caller must use template fallback.
 * NEVER triggers AI generation.
 */
export async function fetchShareAssetSnapshot(
  surface: string,
  subjectId: string,
  revision?: string | null,
): Promise<ShareAssetSnapshot | null> {
  try {
    const encodedSubject = encodeURIComponent(subjectId);
    const queryParam = revision ? `?v=${encodeURIComponent(revision)}` : '';
    const response = await callLaravelApi(
      `/api/v1/share-assets/${surface}/${encodedSubject}/snapshot${queryParam}`,
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as { data?: ShareAssetSnapshot };
    return payload?.data ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Verse share data
// ---------------------------------------------------------------------------

export async function fetchVerseShareData(lang: string, slug: string): Promise<VerseShareData | null> {
  try {
    const response = await callLaravelApi(`/versehub/${lang}/${slug}`);
    if (!response.ok) return null;
    const payload = (await response.json()) as VerseShareData;
    if (!payload?.reference || !payload?.text) return null;
    return payload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Community share post (single-post, no full feed)
// ---------------------------------------------------------------------------

export async function fetchCommunitySharePost(postId: string): Promise<CommunitySharePost | null> {
  try {
    const response = await callLaravelApi(`/api/v1/community/posts/${encodeURIComponent(postId)}/share`);
    if (!response.ok) return null;
    const payload = (await response.json()) as { data?: { post?: CommunityApiPost } };
    const matched = payload?.data?.post;
    if (!matched) return null;

    return {
      id: String(matched.id),
      type: matched.type || 'user_post',
      type_label: matched.type_label || matched.type || 'Community',
      text: matched.text || '',
      title: matched.title ?? null,
      imageUrl: normalizeCommunityAssetUrl(matched.imageUrl || matched.image_path) ?? null,
      thumbPath: normalizeCommunityAssetUrl(matched.thumb_path) ?? null,
      mediaPaths: (matched.mediaPaths || matched.media_paths || [])
        .map((item) => normalizeCommunityAssetUrl(item))
        .filter((item): item is string => Boolean(item)),
      metadata: matched.metadata,
      createdAt: matched.createdAt || matched.created_at || '',
      author: {
        id: String(matched.author?.id || ''),
        name: matched.author?.name || 'Member',
        avatarUrl: normalizeCommunityAssetUrl(matched.author?.avatarUrl || matched.author?.avatar_url) ?? null,
        isOfficial: Boolean(
          matched.author?.isOfficial || matched.author?.is_official || matched.author?.is_admin,
        ),
      },
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Renungan snapshot
// ---------------------------------------------------------------------------

export async function fetchRenunganShareSnapshot(token: string): Promise<RenunganShareSnapshot | null> {
  try {
    const response = await callLaravelApi(`/api/v1/renungan/share/${encodeURIComponent(token)}`);
    if (!response.ok) return null;
    const payload = (await response.json()) as { data?: RenunganShareSnapshot };
    if (!payload?.data?.verse_reference || !payload?.data?.verse_text || !payload?.data?.meditation_excerpt) {
      return null;
    }
    return payload.data;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Payload builders
// ---------------------------------------------------------------------------

export function buildCommunitySharePayload(post: CommunitySharePost, snapshot?: ShareAssetSnapshot | null) {
  const rawPreviewIndex = post.metadata?.preview_media_index;
  const selectedPreviewIndex =
    Number.isInteger(rawPreviewIndex) && Number(rawPreviewIndex) >= 0 ? Number(rawPreviewIndex) : 0;
  const selectedMediaUrl = post.mediaPaths[selectedPreviewIndex] || null;
  const mediaUrl =
    selectedMediaUrl || post.thumbPath || post.mediaPaths[0] || post.imageUrl || post.metadata?.imageUrl || null;
  const text = truncateText(post.text || post.metadata?.quote || post.title || '');
  const reference = post.metadata?.reference || post.metadata?.ref || null;

  // Prefer AI-generated copy from snapshot if available
  const title = snapshot?.share_title || post.title || post.type_label || 'Community';
  const body = snapshot?.share_description || text || 'Bagikan momen dan cerita yang menguatkan bersama komunitas.';
  const eyebrow = snapshot?.share_eyebrow || 'Community Share';
  const meta = reference ? `${reference} • ${post.author.name}` : `${post.author.name} • Community`;
  const imageUrl = snapshot?.final_og_image_url || mediaUrl;

  return {
    kind: (imageUrl ? 'media' : 'scripture') as 'media' | 'scripture',
    title,
    body,
    meta,
    imageUrl,
    eyebrow,
  };
}
