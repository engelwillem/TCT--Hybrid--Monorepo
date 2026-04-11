import { describe, expect, it } from "vitest";
import { partitionCommunityPostsByAge } from "./community-lifecycle";
import type { CommunityPost } from "../types";

const basePost = (overrides: Partial<CommunityPost>): CommunityPost =>
  ({
    id: "post-id",
    type: "user_post",
    type_label: "Curahan Hati",
    text: "Post text",
    createdAt: "2026-04-10T00:00:00.000Z",
    author: { id: "author-1", name: "Author" },
    counts: { likes: 0, comments: 0, bookmarks: 0 },
    isLiked: false,
    isBookmarked: false,
    ...overrides,
  }) as CommunityPost;

describe("partitionCommunityPostsByAge", () => {
  it("keeps posts within 24 hours in discussion", () => {
    const now = Date.parse("2026-04-11T00:00:00.000Z");
    const fresh = basePost({
      id: "fresh",
      createdAt: "2026-04-10T12:00:00.000Z",
    });

    const result = partitionCommunityPostsByAge([fresh], now);
    expect(result.discussionPosts.map((item) => item.id)).toEqual(["fresh"]);
    expect(result.archivePosts).toHaveLength(0);
  });

  it("moves posts older than 24 hours into archive", () => {
    const now = Date.parse("2026-04-11T00:00:00.000Z");
    const stale = basePost({
      id: "stale",
      createdAt: "2026-04-09T23:59:59.000Z",
    });

    const result = partitionCommunityPostsByAge([stale], now);
    expect(result.discussionPosts).toHaveLength(0);
    expect(result.archivePosts.map((item) => item.id)).toEqual(["stale"]);
  });

  it("uses expiresAt as canonical lifecycle source when present", () => {
    const now = Date.parse("2026-04-11T00:00:00.000Z");
    const oldButReactivated = basePost({
      id: "reactivated",
      createdAt: "2026-04-01T00:00:00.000Z",
      expiresAt: "2026-04-11T23:59:59.000Z",
    });

    const result = partitionCommunityPostsByAge([oldButReactivated], now);
    expect(result.discussionPosts.map((item) => item.id)).toEqual(["reactivated"]);
    expect(result.archivePosts).toHaveLength(0);
  });

  it("treats invalid timestamps as archive-safe fallback", () => {
    const post = basePost({
      id: "invalid",
      createdAt: "invalid-date",
    });

    const result = partitionCommunityPostsByAge([post], Date.parse("2026-04-11T00:00:00.000Z"));
    expect(result.discussionPosts).toHaveLength(0);
    expect(result.archivePosts.map((item) => item.id)).toEqual(["invalid"]);
  });
});
