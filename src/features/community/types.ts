export interface CommunityUser {
  id: string;
  name: string;
  avatarUrl?: string;
  isOfficial?: boolean;
  isFollowing?: boolean;
  isFollowedBy?: boolean;
  isMutualFollow?: boolean;
}

export interface CommunityComment {
  id: string;
  postId: string;
  text: string;
  createdAt: string;
  replyToId?: string | null;
  replyToAuthor?: string | null;
  author: CommunityUser;
}

export interface CommunityPost {
  id: string;
  type: string;
  type_label: string;
  text: string;
  title?: string | null;
  imageUrl?: string | null;
  thumbPath?: string | null;
  mediaPaths?: string[] | null;
  createdAt: string;
  author: CommunityUser;
  counts: {
    likes: number;
    comments: number;
    bookmarks: number;
  };
  isLiked: boolean;
  isBookmarked: boolean;
  isFeatured?: boolean;
  can_moderate?: boolean;
  bookmark_category?: {
    id: string;
    name: string;
    slug: string;
    is_default?: boolean;
  } | null;
  metadata?: {
    ref?: string;
    reference?: string;
    quote?: string;
    preview_media_index?: number;
    media_aspect_ratio?: "9:16" | "4:5" | "1:1" | "16:9" | "og" | "auto";
    text_position?: "above" | "below";
    imageUrl?: string;
    ritual_user_reflection?: string;
    ritual_generated_meditation?: string;
    ritual_verse_text?: string;
    ritual_verse_reference?: string;
    related_verses?: Array<{
      reference?: string;
      text?: string;
    }>;
    interpretation_summary?: string;
    bookmark_origin?: string;
    visibility?: "private_renungan_archive" | "public";
  };
}

export interface BookmarkCategory {
  id: string;
  name: string;
  slug: string;
  is_default?: boolean;
  count?: number;
}
