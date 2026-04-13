import type { CommunityPost } from "../types";

export const DISCUSSION_WINDOW_MS = 24 * 60 * 60 * 1000;

function parseTimestamp(value: unknown): number {
  const raw = String(value || "").trim();
  if (!raw) return 0;
  const timestamp = Date.parse(raw);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function resolveCreatedAtMs(post: CommunityPost): number {
  return parseTimestamp(post.createdAt);
}

function resolvePublicAtMs(post: CommunityPost): number {
  const explicitPublicAt = parseTimestamp(post.publicAt);
  if (explicitPublicAt > 0) return explicitPublicAt;

  const explicitActivatedAt = parseTimestamp(post.activatedAt);
  if (explicitActivatedAt > 0) return explicitActivatedAt;

  return resolveCreatedAtMs(post);
}

function resolveActivatedAtMs(post: CommunityPost): number {
  const explicitActivatedAt = parseTimestamp(post.activatedAt);
  if (explicitActivatedAt > 0) return explicitActivatedAt;

  const metadataActivatedAt = parseTimestamp(post.metadata?.last_activated_at);
  if (metadataActivatedAt > 0) return metadataActivatedAt;

  return resolvePublicAtMs(post);
}

function resolveActiveUntilMs(post: CommunityPost): number {
  const explicitExpiresAt = parseTimestamp(post.expiresAt);
  if (explicitExpiresAt > 0) return explicitExpiresAt;

  const activatedAtMs = resolveActivatedAtMs(post);
  if (activatedAtMs <= 0) return 0;
  return activatedAtMs + DISCUSSION_WINDOW_MS;
}

export function partitionCommunityPostsByAge(posts: CommunityPost[], nowMs: number = Date.now()): {
  discussionPosts: CommunityPost[];
  archivePosts: CommunityPost[];
} {
  return posts.reduce(
    (acc, post) => {
      const activeUntilMs = resolveActiveUntilMs(post);
      if (activeUntilMs > nowMs) {
        acc.discussionPosts.push(post);
      } else {
        acc.archivePosts.push(post);
      }

      return acc;
    },
    {
      discussionPosts: [] as CommunityPost[],
      archivePosts: [] as CommunityPost[],
    }
  );
}

export function sortByNewest(posts: CommunityPost[]): CommunityPost[] {
  return [...posts].sort((a, b) => {
    const aActiveUntilMs = resolveActiveUntilMs(a);
    const bActiveUntilMs = resolveActiveUntilMs(b);
    if (aActiveUntilMs !== bActiveUntilMs) return bActiveUntilMs - aActiveUntilMs;

    const aPublicMs = resolvePublicAtMs(a);
    const bPublicMs = resolvePublicAtMs(b);
    return bPublicMs - aPublicMs;
  });
}

export function resolvePostPublicDate(post: CommunityPost): string | undefined {
  return post.publicAt || post.activatedAt || post.createdAt;
}
