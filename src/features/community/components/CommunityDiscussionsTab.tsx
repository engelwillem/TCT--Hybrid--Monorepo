"use client";

import { Suspense, type MutableRefObject } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { SurfaceBridgeAction } from "@/components/core/SurfaceBridgeAction";
import type { ComposerSubmitResult, PostComposerMetadata } from "./post-composer/types";
import { MemberPostCard } from "./MemberPostCard";
import { CommunitySmartPostComposer } from "./CommunitySmartPostComposer";
import type { CommunityPost, CommunityUser } from "../types";
import type { CommunityComposerType } from "../categories";

type CommunityDiscussionsTabProps = {
  className?: string;
  isLoading: boolean;
  discussionPosts: CommunityPost[];
  isAuthenticated: boolean;
  currentUserId: string;
  followBusyAuthorId: string | null;
  shareBusyPostId: string | null;
  lastPostedId: string | null;
  hasLastPostedInDiscussions: boolean;
  discussionPostRefs: MutableRefObject<Record<string, HTMLDivElement | null>>;
  composerCurrentUser?: CommunityUser;
  onPost: (
    text: string,
    type: CommunityComposerType,
    images?: File[],
    metadata?: PostComposerMetadata
  ) => Promise<ComposerSubmitResult>;
  onRefresh: () => void | Promise<void>;
  resolveAuthorAvatar: (post: CommunityPost) => string | null;
  canDeletePost: (post: CommunityPost) => boolean;
  canEditPost: (post: CommunityPost) => boolean;
  onPray: (postId: string) => void | Promise<void>;
  onBookmark: (postId: string) => void | Promise<void>;
  onOpenComments: (postId: string) => void;
  onShare: (postId: string, text?: string | null) => void | Promise<void>;
  onToggleFollowAuthor: (authorId: string) => void | Promise<void>;
  onEditText: (postId: string, currentText?: string | null) => void | Promise<void>;
  onEditPreview: (post: CommunityPost) => void | Promise<void>;
  onEditBookmarkCategory: (post: CommunityPost) => void | Promise<void>;
  onDeletePost: (postId: string) => void | Promise<void>;
};

export function CommunityDiscussionsTab({
  className,
  isLoading,
  discussionPosts,
  isAuthenticated,
  currentUserId,
  followBusyAuthorId,
  shareBusyPostId,
  lastPostedId,
  hasLastPostedInDiscussions,
  discussionPostRefs,
  composerCurrentUser,
  onPost,
  onRefresh,
  resolveAuthorAvatar,
  canDeletePost,
  canEditPost,
  onPray,
  onBookmark,
  onOpenComments,
  onShare,
  onToggleFollowAuthor,
  onEditText,
  onEditPreview,
  onEditBookmarkCategory,
  onDeletePost,
}: CommunityDiscussionsTabProps) {
  const router = useRouter();

  return (
    <div className={cn("space-y-8", className)}>
      <Suspense fallback={<div className="h-32 w-full animate-pulse rounded-[32px] bg-surface-muted" />}>
        <CommunitySmartPostComposer onPost={onPost} currentUser={composerCurrentUser} />
      </Suspense>

      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/65 px-4 py-3">
        <p className="text-[12px] leading-relaxed text-slate-600">
          If things feel overwhelming, continue privately in your reflection space.
        </p>
        <div className="mt-2">
          <SurfaceBridgeAction target="renungan" label="Continue privately in Reflection" href="/renungan?source=community&intent=regulate" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="space-y-6 rounded-[40px] bg-surface-muted/30 p-8">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 rounded-full" />
                  <Skeleton className="h-3 w-20 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-5/6 rounded-full" />
              <Skeleton className="mt-4 h-48 w-full rounded-[32px]" />
            </div>
          ))}
        </div>
      ) : discussionPosts.length ? (
        <div className="space-y-6">
          {hasLastPostedInDiscussions ? (
            <p
              role="status"
              aria-live="polite"
              className="rounded-2xl border border-sky-100/80 bg-sky-50/40 px-4 py-3 text-[13px] font-medium leading-relaxed text-slate-700"
            >
              Apa yang kamu bagikan bisa menguatkan seseorang.
            </p>
          ) : null}
          {discussionPosts.map((post) => (
            <div
              key={post.id}
              ref={(node) => {
                discussionPostRefs.current[post.id] = node;
              }}
            >
              {lastPostedId === post.id ? (
                <div className="mb-3 flex items-center gap-3 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  <div className="h-px flex-1 bg-slate-200/80" />
                  <span>Just shared</span>
                  <div className="h-px flex-1 bg-slate-200/80" />
                </div>
              ) : null}
              <MemberPostCard
                authorId={post.author.id}
                authorName={post.author.name}
                authorAvatar={resolveAuthorAvatar(post)}
                isAuthenticated={isAuthenticated}
                isOfficial={post.author.isOfficial}
                isFollowingAuthor={Boolean(post.author.isFollowing)}
                isMutualFollow={Boolean(post.author.isMutualFollow)}
                canFollowAuthor={Boolean(currentUserId) && currentUserId !== post.author.id}
                type={post.type}
                text={post.text}
                metadata={post.metadata}
                imgSrc={post.imageUrl || undefined}
                mediaSrcList={post.mediaPaths || undefined}
                aspectRatio={post.metadata?.media_aspect_ratio}
                createdAt={post.createdAt}
                prayLabel={String(post.counts.likes || 0)}
                prayed={post.isLiked}
                commentsCount={post.counts.comments || 0}
                bookmarked={post.isBookmarked}
                bookmarkLabel={String(post.counts.bookmarks || 0)}
                onPray={() => onPray(post.id)}
                onBookmark={() => onBookmark(post.id)}
                onOpenComments={() => onOpenComments(post.id)}
                onShare={() => onShare(post.id, post.text)}
                onToggleFollowAuthor={() => onToggleFollowAuthor(post.author.id)}
                onMessageAuthor={() => router.push(`/inbox/${post.author.id}`)}
                followBusy={followBusyAuthorId === post.author.id}
                canDelete={canDeletePost(post)}
                canEdit={canEditPost(post)}
                canEditPreview={canEditPost(post) && Boolean(post.mediaPaths?.length)}
                canEditBookmarkCategory={post.isBookmarked}
                onEditText={() => onEditText(post.id, post.text)}
                onEditPreview={() => onEditPreview(post)}
                onEditBookmarkCategory={() => void onEditBookmarkCategory(post)}
                onDelete={() => onDeletePost(post.id)}
                isNewlyPosted={lastPostedId === post.id}
                shareBusy={shareBusyPostId === post.id}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-[420px] px-4 pb-24 pt-12">
          <p className="text-[15px] leading-relaxed text-foreground/70">No conversations yet today.</p>
          <button
            onClick={() => onRefresh()}
            className="mt-6 text-[13px] font-medium text-foreground/40 transition-colors hover:text-foreground/70"
          >
            Reload
          </button>
        </div>
      )}
    </div>
  );
}
