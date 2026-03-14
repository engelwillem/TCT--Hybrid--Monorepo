/**
 * @fileOverview Community Service Layer
 *
 * Laravel API is the primary source of truth.
 * Ensures 100% parity with legacy data structures.
 */

import { CommunityPost, CommunityComment } from "@/features/community/types";
import { getAppAccessToken, clearAppAccessToken } from "@/services/app-auth-token";

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
  metadata?: any;
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

const mapApiPost = (post: ApiPost): CommunityPost => ({
  id: String(post.id),
  type: post.type,
  type_label: post.type_label || post.type,
  text: post.text || "",
  title: post.title ?? undefined,
  imageUrl: (post.imageUrl || post.image_path) ?? undefined,
  thumbPath: post.thumb_path ?? undefined,
  mediaPaths: (post.mediaPaths || post.media_paths) ?? undefined,
  isFeatured: Boolean(post.is_featured),
  can_moderate: Boolean(post.can_moderate),
  metadata: post.metadata,
  createdAt: post.createdAt || post.created_at,
  author: {
    id: String(post.author?.id || ""),
    name: post.author?.name || "Member",
    avatarUrl: (post.author?.avatarUrl || post.author?.avatar_url) ?? undefined,
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
  if (status === 401 || status === 403) {
    clearAppAccessToken();
  }
}

async function assertOk(response: Response, message: string): Promise<void> {
  if (response.ok) return;
  handleAuthFailure(response.status);
  throw new ApiError(`${message}: ${response.status}`, response.status);
}

export const CommunityService = {
  async listPosts(): Promise<CommunityPost[]> {
    const response = await fetch("/api/community/posts", {
      method: "GET",
      cache: "no-store",
      headers: buildHeaders(true),
    });

    await assertOk(response, "Failed to fetch posts");
    const payload = await response.json() as ApiEnvelope<{ posts: ApiPost[] }>;
    return (payload?.data?.posts ?? []).map(mapApiPost);
  },

  async createPost(text: string, type: string = 'user_post', images: File[] = []): Promise<CommunityPost> {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('type', type);
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
  }
};
