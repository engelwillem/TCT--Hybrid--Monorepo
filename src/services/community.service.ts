/**
 * @fileOverview Community Service Layer
 *
 * Laravel API is the primary source of truth.
 * Mock in-memory state remains as a local fallback when API is unreachable.
 */

import { CommunityPost, CommunityComment } from "@/features/community/types";
import { MOCK_POSTS, MOCK_COMMENTS, MOCK_USERS } from "@/features/community/mock";
import { getAppAccessToken } from "@/services/app-auth-token";

let posts: CommunityPost[] = [...MOCK_POSTS];
let comments: CommunityComment[] = [...MOCK_COMMENTS];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface ApiEnvelope<T> {
  data?: T;
}

interface ApiPost {
  id: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  counts: {
    likes: number;
    comments: number;
    bookmarks: number;
  };
  isLiked: boolean;
  isBookmarked: boolean;
}

interface ApiComment {
  id: string;
  postId: string;
  text: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

const mapApiPost = (post: ApiPost): CommunityPost => ({
  id: String(post.id),
  text: post.text || "",
  imageUrl: post.imageUrl,
  createdAt: post.createdAt || "Baru saja",
  author: {
    id: String(post.author?.id || ""),
    name: post.author?.name || "Member",
    avatarUrl: post.author?.avatarUrl,
  },
  counts: {
    likes: Number(post.counts?.likes || 0),
    comments: Number(post.counts?.comments || 0),
    bookmarks: Number(post.counts?.bookmarks || 0),
  },
  isLiked: Boolean(post.isLiked),
  isBookmarked: Boolean(post.isBookmarked),
});

const mapApiComment = (comment: ApiComment): CommunityComment => ({
  id: String(comment.id),
  postId: String(comment.postId),
  text: comment.text || "",
  createdAt: comment.createdAt || "Baru saja",
  author: {
    id: String(comment.author?.id || ""),
    name: comment.author?.name || "Member",
    avatarUrl: comment.author?.avatarUrl,
  },
});

const buildHeaders = (needsAuth = false): HeadersInit => {
  let headers: HeadersInit = {
    "Content-Type": "application/json",
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

async function parseJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export const CommunityService = {
  async listPosts(): Promise<CommunityPost[]> {
    try {
      const response = await fetch("/api/community/posts", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) throw new Error(`Failed to fetch posts: ${response.status}`);

      const payload = await parseJson<ApiEnvelope<{ posts: ApiPost[] }>>(response);
      const nextPosts = (payload?.data?.posts ?? []).map(mapApiPost);

      if (nextPosts.length > 0) {
        posts = nextPosts;
      }

      return nextPosts.length > 0 ? nextPosts : [...posts];
    } catch {
      await delay(150);
      return [...posts];
    }
  },

  async createPost(text: string, imageUrl?: string): Promise<CommunityPost> {
    try {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: buildHeaders(true),
        body: JSON.stringify({ text, imageUrl }),
      });

      if (!response.ok) throw new Error(`Failed to create post: ${response.status}`);

      const payload = await parseJson<ApiEnvelope<{ post: ApiPost }>>(response);
      if (!payload?.data?.post) throw new Error("Malformed create post payload");

      const created = mapApiPost(payload.data.post);
      posts = [created, ...posts.filter((item) => item.id !== created.id)];
      return created;
    } catch {
      await delay(150);
      const newPost: CommunityPost = {
        id: Date.now().toString(),
        text,
        imageUrl,
        createdAt: "Baru saja",
        author: MOCK_USERS.me,
        counts: { likes: 0, comments: 0, bookmarks: 0 },
        isLiked: false,
        isBookmarked: false,
      };

      posts = [newPost, ...posts];
      return newPost;
    }
  },

  async toggleLike(postId: string): Promise<void> {
    try {
      const response = await fetch(`/api/community/posts/${postId}/pray`, {
        method: "POST",
        headers: buildHeaders(true),
      });

      if (!response.ok) throw new Error(`Failed to toggle pray reaction: ${response.status}`);

      const payload = await parseJson<ApiEnvelope<{ post: ApiPost }>>(response);
      if (payload?.data?.post) {
        const updated = mapApiPost(payload.data.post);
        posts = posts.map((item) => (item.id === postId ? updated : item));
      }
    } catch {
      await delay(80);
      posts = posts.map((item) =>
        item.id === postId
          ? {
              ...item,
              isLiked: !item.isLiked,
              counts: {
                ...item.counts,
                likes: item.counts.likes + (item.isLiked ? -1 : 1),
              },
            }
          : item,
      );
    }
  },

  async toggleBookmark(postId: string): Promise<void> {
    try {
      const response = await fetch(`/api/community/posts/${postId}/bookmark`, {
        method: "POST",
        headers: buildHeaders(true),
      });

      if (!response.ok) throw new Error(`Failed to toggle bookmark: ${response.status}`);

      const payload = await parseJson<ApiEnvelope<{ post: ApiPost }>>(response);
      if (payload?.data?.post) {
        const updated = mapApiPost(payload.data.post);
        posts = posts.map((item) => (item.id === postId ? updated : item));
      }
    } catch {
      await delay(80);
      posts = posts.map((item) =>
        item.id === postId
          ? {
              ...item,
              isBookmarked: !item.isBookmarked,
            }
          : item,
      );
    }
  },

  async listComments(postId: string): Promise<CommunityComment[]> {
    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) throw new Error(`Failed to fetch comments: ${response.status}`);

      const payload = await parseJson<ApiEnvelope<{ comments: ApiComment[] }>>(response);
      const nextComments = (payload?.data?.comments ?? []).map(mapApiComment);

      comments = [
        ...comments.filter((item) => item.postId !== postId),
        ...nextComments,
      ];

      return nextComments;
    } catch {
      await delay(100);
      return comments.filter((item) => item.postId === postId);
    }
  },

  async addComment(postId: string, text: string): Promise<CommunityComment> {
    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: buildHeaders(true),
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error(`Failed to add comment: ${response.status}`);

      const payload = await parseJson<ApiEnvelope<{ comment: ApiComment }>>(response);
      if (!payload?.data?.comment) throw new Error("Malformed comment payload");

      const created = mapApiComment(payload.data.comment);
      comments = [...comments, created];
      posts = posts.map((item) =>
        item.id === postId
          ? {
              ...item,
              counts: {
                ...item.counts,
                comments: item.counts.comments + 1,
              },
            }
          : item,
      );

      return created;
    } catch {
      await delay(120);
      const newComment: CommunityComment = {
        id: Date.now().toString(),
        postId,
        text,
        createdAt: "Baru saja",
        author: MOCK_USERS.me,
      };

      comments = [...comments, newComment];
      posts = posts.map((item) =>
        item.id === postId
          ? {
              ...item,
              counts: {
                ...item.counts,
                comments: item.counts.comments + 1,
              },
            }
          : item,
      );

      return newComment;
    }
  },
};
