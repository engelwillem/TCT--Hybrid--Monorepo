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
  if (normalized.startsWith('/api/v1/community/media/')) {
    return normalized;
  }
  if (normalized.startsWith('/storage/community/posts/')) {
    return normalized.replace('/storage/community/posts/', '/api/v1/community/media/community/posts/');
  }
  if (normalized.startsWith('/storage/') || normalized.startsWith('/api/v1/avatar/')) {
    return normalized;
  }
  const communityMediaMarker = normalized.indexOf('/api/v1/community/media/');
  if (communityMediaMarker >= 0) return normalized.slice(communityMediaMarker);
  const communityStorageMarker = normalized.indexOf('/storage/community/posts/');
  if (communityStorageMarker >= 0) return normalized.slice(communityStorageMarker).replace('/storage/community/posts/', '/api/v1/community/media/community/posts/');
  const storageMarker = normalized.indexOf('/storage/');
  if (storageMarker >= 0) return normalized.slice(storageMarker);
  const avatarMarker = normalized.indexOf('/api/v1/avatar/');
  if (avatarMarker >= 0) return normalized.slice(avatarMarker);
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
    if (knownPath) {
      return `${apiOrigin}${knownPath}${parsed.search}${parsed.hash}`;
    }
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

export async function fetchCommunitySharePost(postId: string): Promise<CommunitySharePost | null> {
  try {
    const response = await callLaravelApi('/api/v1/community/posts');
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      data?: { posts?: CommunityApiPost[]; archivePosts?: CommunityApiPost[] };
    };
    const allPosts = [
      ...(Array.isArray(payload?.data?.posts) ? payload.data.posts : []),
      ...(Array.isArray(payload?.data?.archivePosts) ? payload.data.archivePosts : []),
    ];
    const matched = allPosts.find((item) => String(item.id) === String(postId));
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
          matched.author?.isOfficial || matched.author?.is_official || matched.author?.is_admin
        ),
      },
    };
  } catch {
    return null;
  }
}

export function buildCommunitySharePayload(post: CommunitySharePost) {
  const rawPreviewIndex = post.metadata?.preview_media_index;
  const selectedPreviewIndex =
    Number.isInteger(rawPreviewIndex) && Number(rawPreviewIndex) >= 0 ? Number(rawPreviewIndex) : 0;
  const selectedMediaUrl = post.mediaPaths[selectedPreviewIndex] || null;
  const mediaUrl =
    selectedMediaUrl ||
    post.thumbPath ||
    post.mediaPaths[0] ||
    post.imageUrl ||
    post.metadata?.imageUrl ||
    null;
  const text = truncateText(post.text || post.metadata?.quote || post.title || '');
  const reference = post.metadata?.reference || post.metadata?.ref || null;

  if (mediaUrl) {
    return {
      kind: 'media' as const,
      title: post.title || post.type_label || 'Community',
      body: text || 'Bagikan momen dan cerita yang menguatkan bersama komunitas.',
      meta: reference ? `${reference} • ${post.author.name}` : `${post.author.name} • Community`,
      imageUrl: mediaUrl,
      eyebrow: 'Community Share',
    };
  }

  return {
    kind: 'scripture' as const,
    title: post.title || post.type_label || 'Community Reflection',
    body: post.metadata?.quote || text || 'Bagikan refleksi yang menguatkan iman hari ini.',
    meta: reference ? `${reference} • ${post.author.name}` : `${post.author.name} • Community`,
    imageUrl: mediaUrl,
    eyebrow: post.type === 'reflection' ? 'Shared Reflection' : 'Community Share',
  };
}
