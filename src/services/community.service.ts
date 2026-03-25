/**
 * @fileOverview Community Service Layer
 *
 * Laravel API is the primary source of truth.
 * Ensures 100% parity with legacy data structures.
 */

import { CommunityPost, CommunityComment } from "@/features/community/types";
import { getAppAccessToken, clearAppAccessToken, shouldInvalidateLocalSession } from "@/services/app-auth-token";

class ApiError extends Error {
  constructor(
    public readonly message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiEnvelope<T> {
  data?: T;
}

interface ApiPost {
  id: string;
  type: string;
  type_label?: string;
  text: string;
  title?: string | null;
  imageUrl?: string | null;
  image_path?: string | null;
  thumb_path?: string | null;
  mediaPaths?: string[] | null;
  media_paths?: string[] | null;
  is_featured?: boolean;
  can_moderate?: boolean;
  metadata?: {
    media_aspect_ratio?: "9:16" | "4:5" | "1:1" | "16:9" | "og" | "auto";
    text_position?: "above" | "below";
    imageUrl?: string;
    ref?: string;
    reference?: string;
    quote?: string;
  } | null;
  createdAt?: string;
  created_at: string;
  author: {
    id: string | number;
    name: string | null;
    avatarUrl?: string | null;
    avatar_url?: string | null;
    isOfficial?: boolean;
    is_official?: boolean;
    is_admin?: boolean;
  };
  counts: {
    likes: number;
    comments: number;
    bookmarks: number;
  };
  isLiked: boolean;
  isBookmarked: boolean;
}

const API_BASE_FALLBACK = "https://api.thechoosentalks.org";

const resolveApiOrigin = (): string => {
  const raw =
    process.env.NEXT_PUBLIC_LARAVEL_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    API_BASE_FALLBACK;
  try {
    return new URL(raw).origin;
  } catch {
    return API_BASE_FALLBACK;
  }
};

const extractKnownAssetPath = (pathname: string): string | null => {
  if (!pathname) return null;
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (normalizedPath.startsWith("/api/v1/community/media/")) {
    return normalizedPath;
  }

  if (normalizedPath.startsWith("/storage/community/posts/")) {
    return normalizedPath.replace("/storage/community/posts/", "/api/v1/community/media/community/posts/");
  }

  if (normalizedPath.startsWith("/storage/") || normalizedPath.startsWith("/api/v1/avatar/")) {
    return normalizedPath;
  }

  const communityMediaMarker = normalizedPath.indexOf("/api/v1/community/media/");
  if (communityMediaMarker >= 0) {
    return normalizedPath.slice(communityMediaMarker);
  }

  const communityStorageMarker = normalizedPath.indexOf("/storage/community/posts/");
  if (communityStorageMarker >= 0) {
    return normalizedPath.slice(communityStorageMarker).replace("/storage/community/posts/", "/api/v1/community/media/community/posts/");
  }

  const storageMarker = normalizedPath.indexOf("/storage/");
  if (storageMarker >= 0) {
    return normalizedPath.slice(storageMarker);
  }

  const avatarMarker = normalizedPath.indexOf("/api/v1/avatar/");
  if (avatarMarker >= 0) {
    return normalizedPath.slice(avatarMarker);
  }

  return null;
};

const normalizeCommunityAssetUrl = (value?: string | null): string | undefined => {
  const raw = String(value || "").trim();
  if (!raw) return undefined;
  if (raw.startsWith("blob:") || raw.startsWith("data:image/")) return raw;

  const apiOrigin = resolveApiOrigin();

  try {
    const parsed = new URL(raw);
    const knownPath = extractKnownAssetPath(parsed.pathname);
    if (knownPath) {
      const normalizedPath = `${knownPath}${parsed.search}${parsed.hash}`;
      return `${apiOrigin}${normalizedPath}`;
    }
    return parsed.toString();
  } catch {
    // Handle relative paths below
  }

  const normalized = raw.startsWith("/") ? raw : `/${raw.replace(/^\/+/, "")}`;
  const knownPath = extractKnownAssetPath(normalized);
  if (knownPath) {
    return `${apiOrigin}${knownPath}`;
  }

  return normalized;
};

const mapApiPost = (post: ApiPost): CommunityPost => ({
  id: String(post.id),
  type: post.type,
  type_label: post.type_label || post.type,
  text: post.text || "",
  title: post.title ?? undefined,
  imageUrl: normalizeCommunityAssetUrl(post.imageUrl || post.image_path),
  thumbPath: post.thumb_path ?? undefined,
  mediaPaths: (post.mediaPaths || post.media_paths || [])
    .map((item) => normalizeCommunityAssetUrl(item))
    .filter((item): item is string => Boolean(item)),
  isFeatured: Boolean(post.is_featured),
  can_moderate: Boolean(post.can_moderate),
  metadata: post.metadata ?? undefined,
  createdAt: post.createdAt || post.created_at,
  author: {
    id: String(post.author?.id || ""),
    name: post.author?.name || "Member",
    avatarUrl: normalizeCommunityAssetUrl(post.author?.avatarUrl || post.author?.avatar_url),
    isOfficial: Boolean(post.author?.isOfficial || post.author?.is_official || post.author?.is_admin),
  },
  counts: {
    likes: Number(post.counts?.likes || 0),
    comments: Number(post.counts?.comments || 0),
    bookmarks: Number(post.counts?.bookmarks || 0),
  },
  isLiked: Boolean(post.isLiked),
  isBookmarked: Boolean(post.isBookmarked),
});

const buildHeaders = (needsAuth = false): HeadersInit => {
  let headers: HeadersInit = {
    Accept: "application/json",
  };

  if (needsAuth) {
    const token = getAppAccessToken();
    if (token) {
      headers = {
        ...headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  return headers;
};

function handleAuthFailure(status: number) {
  // Only treat 401 as a confirmed invalid session.
  // 403 can be a transient permission/config issue and should not hard-logout the user.
  if (shouldInvalidateLocalSession(status)) {
    clearAppAccessToken();
  }
}

async function assertOk(response: Response, message: string): Promise<void> {
  if (response.ok) return;
  handleAuthFailure(response.status);
  throw new ApiError(`${message}: ${response.status}`, response.status);
}

async function fetchWithRetry(input: RequestInfo | URL, init: RequestInit, attempts = 2): Promise<Response> {
  let response = await fetch(input, init);

  for (let attempt = 1; attempt < attempts && response.status >= 500; attempt += 1) {
    await new Promise((resolve) => window.setTimeout(resolve, 250 * attempt));
    response = await fetch(input, init);
  }

  return response;
}

export const CommunityService = {
  async listPosts(): Promise<{ posts: CommunityPost[]; archivePosts: CommunityPost[] }> {
    const response = await fetchWithRetry("/api/community/posts", {
      method: "GET",
      cache: "no-store",
      headers: buildHeaders(true),
    });

    await assertOk(response, "Failed to fetch posts");
    const payload = await response.json() as ApiEnvelope<{ posts: ApiPost[], archivePosts?: ApiPost[] }>;
    return {
      posts: (payload?.data?.posts ?? []).map(mapApiPost),
      archivePosts: (payload?.data?.archivePosts ?? []).map(mapApiPost),
    };
  },

  async createPost(
    text: string,
    type: string = 'user_post',
    images: File[] = [],
    metadata?: { media_aspect_ratio?: string }
  ): Promise<CommunityPost> {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('type', type);
    if (metadata?.media_aspect_ratio) {
      formData.append('metadata[media_aspect_ratio]', metadata.media_aspect_ratio);
    }
    images.forEach((file) => {
      formData.append('images[]', file);
    });

    const response = await fetch("/api/community/posts", {
      method: "POST",
      headers: buildHeaders(true),
      body: formData,
    });

    await assertOk(response, "Failed to create post");
    const payload = await response.json() as ApiEnvelope<{ post: ApiPost }>;
    if (!payload?.data?.post) throw new ApiError("Malformed response", 502);
    
    return mapApiPost(payload.data.post);
  },

  async deletePost(postId: string): Promise<void> {
    const response = await fetch(`/api/community/posts?postId=${encodeURIComponent(postId)}`, {
      method: "DELETE",
      headers: buildHeaders(true),
    });

    await assertOk(response, "Failed to delete post");
  },

  async toggleLike(postId: string): Promise<CommunityPost> {
    const response = await fetch(`/api/community/posts/${postId}/pray`, {
      method: "POST",
      headers: buildHeaders(true),
    });

    await assertOk(response, "Failed to toggle pray reaction");
    const payload = await response.json() as ApiEnvelope<{ post: ApiPost }>;
    if (!payload?.data?.post) throw new ApiError("Malformed response", 502);
    
    return mapApiPost(payload.data.post);
  },

  async toggleBookmark(postId: string): Promise<CommunityPost> {
    const response = await fetch(`/api/community/posts/${postId}/bookmark`, {
      method: "POST",
      headers: buildHeaders(true),
    });

    await assertOk(response, "Failed to toggle bookmark");
    const payload = await response.json() as ApiEnvelope<{ post: ApiPost }>;
    if (!payload?.data?.post) throw new ApiError("Malformed response", 502);
    
    return mapApiPost(payload.data.post);
  },

  async getComments(postId: string): Promise<CommunityComment[]> {
    const response = await fetch(`/api/community/posts/${postId}/comments`, {
      method: "GET",
      cache: "no-store",
      headers: buildHeaders(true),
    });

    await assertOk(response, "Failed to fetch comments");
    const payload = await response.json() as ApiEnvelope<{ comments: any[] }>;
    return (payload?.data?.comments ?? []).map((c) => ({
      id: String(c.id),
      postId: String(c.postId),
      text: c.text,
      createdAt: c.createdAt,
      replyToId: c.replyToId,
      replyToAuthor: c.replyToAuthor,
      author: {
        id: String(c.author?.id ?? ""),
        name: String(c.author?.name ?? "Member"),
        avatarUrl: normalizeCommunityAssetUrl(c.author?.avatarUrl),
        isOfficial: Boolean(c.author?.isOfficial),
      },
    }));
  },

  async createComment(postId: string, text: string, replyToCommentId?: string): Promise<CommunityComment> {
    const response = await fetch(`/api/community/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        ...buildHeaders(true),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        text,
        reply_to_comment_id: replyToCommentId ? Number(replyToCommentId) : null,
      }),
    });

    if (!response.ok && response.status === 422) {
      const errorJson = await response.json().catch(() => ({}));
      const message = errorJson?.message || 'Validation Error';
      throw new ApiError(message, 422);
    }

    await assertOk(response, "Failed to create comment");
    const payload = await response.json() as ApiEnvelope<{ comment: any }>;
    if (!payload?.data?.comment) throw new ApiError("Malformed response", 502);

    const c = payload.data.comment;
    return {
      id: String(c.id),
      postId: String(c.postId),
      text: c.text,
      createdAt: c.createdAt,
      replyToId: c.replyToId,
      replyToAuthor: c.replyToAuthor,
      author: {
        id: String(c.author?.id ?? ""),
        name: String(c.author?.name ?? "Member"),
        avatarUrl: normalizeCommunityAssetUrl(c.author?.avatarUrl),
        isOfficial: Boolean(c.author?.isOfficial),
      },
    };
  }
};
