/**
 * @fileOverview Community Service Layer
 * 
 * Provides an async API boundary for community-related operations.
 * Currently uses in-memory state initialized with mock data.
 */

import { CommunityPost, CommunityComment, CommunityUser } from "@/features/community/types";
import { MOCK_POSTS, MOCK_COMMENTS, MOCK_USERS } from "@/features/community/mock";

// In-memory "database"
let posts: CommunityPost[] = [...MOCK_POSTS];
let comments: CommunityComment[] = [...MOCK_COMMENTS];

/**
 * Simulate network delay
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const CommunityService = {
  /**
   * Fetches the list of all posts
   */
  async listPosts(): Promise<CommunityPost[]> {
    await delay(300); // Simulate API latency
    return [...posts];
  },

  /**
   * Creates a new post
   */
  async createPost(text: string, imageUrl?: string): Promise<CommunityPost> {
    await delay(500);
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
  },

  /**
   * Toggles the like status of a post
   */
  async toggleLike(postId: string): Promise<void> {
    await delay(100);
    posts = posts.map(p => 
      p.id === postId 
        ? { ...p, isLiked: !p.isLiked, counts: { ...p.counts, likes: p.counts.likes + (p.isLiked ? -1 : 1) } } 
        : p
    );
  },

  /**
   * Toggles the bookmark status of a post
   */
  async toggleBookmark(postId: string): Promise<void> {
    await delay(100);
    posts = posts.map(p => 
      p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
    );
  },

  /**
   * Fetches comments for a specific post
   */
  async listComments(postId: string): Promise<CommunityComment[]> {
    await delay(200);
    return comments.filter(c => c.postId === postId);
  },

  /**
   * Adds a comment to a post
   */
  async addComment(postId: string, text: string): Promise<CommunityComment> {
    await delay(400);
    const newComment: CommunityComment = {
      id: Date.now().toString(),
      postId,
      text,
      createdAt: "Baru saja",
      author: MOCK_USERS.me,
    };
    comments = [...comments, newComment];
    
    // Update comment count in posts
    posts = posts.map(p => 
      p.id === postId ? { ...p, counts: { ...p.counts, comments: p.counts.comments + 1 } } : p
    );

    return newComment;
  }
};
