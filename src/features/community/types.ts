
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
  text: string;
  imageUrl?: string;
  createdAt: string;
  author: CommunityUser;
  counts: {
    likes: number;
    comments: number;
    bookmarks: number;
  };
  isLiked: boolean;
  isBookmarked: boolean;
}
