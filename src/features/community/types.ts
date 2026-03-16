export interface CommunityUser {
  id: string;
  name: string;
  avatarUrl?: string;
  isOfficial?: boolean;
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
  metadata?: {
    ref?: string;
    reference?: string;
    quote?: string;
    media_aspect_ratio?: "4:5" | "og" | "auto";
    text_position?: "above" | "below";
  };
}
