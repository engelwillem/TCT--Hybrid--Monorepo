
export interface CommunityUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  text: string;
  createdAt: string;
  author: CommunityUser;
}

export interface CommunityPost {
  id: string;
  type: string;
  text: string;
  imageUrl?: string;
  mediaPaths?: string[];
  createdAt: string;
  author: CommunityUser & { isOfficial?: boolean };
  counts: {
    likes: number;
    comments: number;
    bookmarks: number;
  };
  isLiked: boolean;
  isBookmarked: boolean;
  isFeatured?: boolean;
  metadata?: {
    ref?: string;
    reference?: string;
    quote?: string;
    media_aspect_ratio?: "4:5" | "og" | "auto";
    text_position?: "above" | "below";
  };
}
