"use client";

import { useMemo } from "react";
import { useAuthSession } from "@/auth/use-auth-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCurrentUserAvatarStyle } from "@/lib/avatar-presentation";
import { cn } from "@/lib/utils";
import { MemberPostActionBar } from "./MemberPostActionBar";
import { QuoteCard } from "./QuoteCard";
import { CommunityImageCarousel } from "./CommunityImageCarousel";
import { MessageCircle, MoreHorizontal, Share2, Trash2 } from "lucide-react";

type MemberPostCardProps = {
  className?: string;
  compact?: boolean;
  authorId?: string | null;
  authorName?: string | null;
  authorAvatar?: string | null;
  isOfficial?: boolean;
  isFollowingAuthor?: boolean;
  isMutualFollow?: boolean;
  canFollowAuthor?: boolean;
  type?: string;
  text?: string | null;
  createdAt?: string | null;
  imgSrc?: string | null;
  mediaSrcList?: string[];
  aspectRatio?: "9:16" | "4:5" | "1:1" | "16:9" | "og" | "auto";
  textPosition?: "above" | "below";
  prayLabel?: string;
  prayed?: boolean;
  commentsCount: number;
  bookmarked: boolean;
  bookmarkLabel: string;
  onPray?: () => void;
  onOpenComments: () => void;
  onShare: () => void | Promise<void>;
  onBookmark: () => void;
  canModerate?: boolean;
  canDelete?: boolean;
  onDelete?: () => void;
  onAdminHide?: () => void;
  onAdminExtend24h?: () => void;
  onAdminExpireNow?: () => void;
  onToggleFollowAuthor?: () => void;
  onMessageAuthor?: () => void;
  followBusy?: boolean;
};

export function MemberPostCard({
  className,
  compact = false,
  authorId,
  authorName,
  authorAvatar,
  isOfficial,
  isFollowingAuthor = false,
  isMutualFollow = false,
  canFollowAuthor = false,
  type,
  text,
  createdAt,
  imgSrc,
  mediaSrcList,
  aspectRatio = "auto",
  textPosition = "below",
  prayLabel,
  prayed,
  commentsCount,
  bookmarked,
  bookmarkLabel,
  onPray,
  onOpenComments,
  onShare,
  onBookmark,
  canModerate = false,
  canDelete = false,
  onDelete,
  onAdminHide,
  onToggleFollowAuthor,
  onMessageAuthor,
  followBusy = false,
}: MemberPostCardProps) {
  const { isAuthenticated } = useAuthSession();
  const postTimeLabel = useMemo(() => {
    if (!createdAt) return "Baru saja";
    const posted = new Date(createdAt);
    if (Number.isNaN(posted.getTime())) return "Baru saja";

    const now = new Date();
    const diffMs = posted.getTime() - now.getTime();
    const diffMinutes = Math.round(diffMs / 60000);

    if (Math.abs(diffMinutes) < 1) return "Baru saja";
    if (Math.abs(diffMinutes) < 60) {
      return new Intl.RelativeTimeFormat("id", { numeric: "auto" }).format(diffMinutes, "minute");
    }

    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) {
      return new Intl.RelativeTimeFormat("id", { numeric: "auto" }).format(diffHours, "hour");
    }

    const diffDays = Math.round(diffHours / 24);
    if (Math.abs(diffDays) <= 7) {
      return new Intl.RelativeTimeFormat("id", { numeric: "auto" }).format(diffDays, "day");
    }

    return posted.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [createdAt]);

  const rawText = String(text ?? "").trim();
  const normalizedText =
    rawText.replace(/^\s*[\s\S]*?\*\*[^*]+\*\*[:：]?\s*/u, "").trim() || rawText.trim();
  const hasText = normalizedText.length > 0;

  const premiumQuoteAuthors = [
    "The Shepherd",
    "Sandy Prohaska",
    "Delilah Grimes",
    "Winifred Runte",
    "Ms. Dena Rempel",
    "Darrick Luettgen",
  ];
  const isPremiumQuoteAuthor = authorName && premiumQuoteAuthors.includes(authorName);

  const media = useMemo(() => {
    const list = Array.isArray(mediaSrcList) ? mediaSrcList.filter(Boolean) : [];
    if (list.length > 0) return list;
    return imgSrc ? [imgSrc] : [];
  }, [imgSrc, mediaSrcList]);

  const hasImage = media.length > 0;
  const isQuoteCard = (isPremiumQuoteAuthor && hasText) || (!hasImage && hasText && type === "quote");
  const isTwitterStyle = !isPremiumQuoteAuthor && !hasImage && hasText && type !== "quote" && normalizedText.length < 140;

  const actionBar = (
    <MemberPostActionBar
      postType={type}
      prayLabel={prayLabel}
      prayed={prayed}
      commentsCount={commentsCount}
      bookmarked={bookmarked}
      bookmarkLabel={bookmarkLabel}
      onPray={onPray}
      onOpenComments={onOpenComments}
      onShare={onShare}
      onBookmark={onBookmark}
    />
  );
  const headerMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted/60 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onShare}>
          <Share2 className="h-4 w-4" />
          Bagikan
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onOpenComments}>
          <MessageCircle className="h-4 w-4" />
          Komentar
        </DropdownMenuItem>
        {canDelete ? (
          <DropdownMenuItem onClick={onDelete} className="text-rose-600 focus:text-rose-600">
            <Trash2 className="h-4 w-4" />
            Hapus konten
          </DropdownMenuItem>
        ) : null}
        {canModerate && onAdminHide ? (
          <DropdownMenuItem onClick={onAdminHide}>
            Sembunyikan
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
  const avatarPresentation = useCurrentUserAvatarStyle(authorAvatar, { id: authorId, name: authorName }, 44);

  if (isQuoteCard) {
    return (
      <QuoteCard
        quote={normalizedText}
        authorName={authorName}
        className={className}
        actionSlot={actionBar}
        headerActionSlot={headerMenu}
        compact={compact}
      />
    );
  }

  return (
    <Card
      className={cn(
        "rounded-[32px] md:rounded-[40px] border-0 glass-card overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-premium animate-in fade-in slide-in-from-bottom-4 tct-card-pad",
        className
      )}
    >
      <CardHeader className="p-0 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 group/author cursor-pointer">
            <div className="relative h-11 w-11 shrink-0">
              {/* Avatar Glow */}
              <div className="absolute -inset-1 rounded-full bg-brand/25 opacity-0 blur transition duration-500 group-hover/author:opacity-100" />
              <div className="relative h-full w-full rounded-full bg-surface-muted flex items-center justify-center overflow-hidden border border-border/60 ring-1 ring-border/60 shadow-sm transition-transform duration-500 group-hover/author:scale-105">
                {authorAvatar ? (
                    <img
                      src={authorAvatar}
                      alt={authorName ?? ""}
                      className={cn("h-full w-full object-cover", avatarPresentation.className)}
                      style={avatarPresentation.style}
                    />
                ) : (
                    <>
                        <div className="bg-brand/15 absolute inset-0" />
                        <span className="relative text-brand text-[11px] font-black uppercase tracking-widest">
                        {(authorName ?? "U")[0]}
                        </span>
                    </>
                )}
              </div>
            </div>
            <div>
              <CardTitle className="text-[16px] font-black tracking-tight text-foreground group-hover/author:text-brand transition-colors">
                {authorName ?? "Unknown"}
              </CardTitle>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{postTimeLabel}</p>
                {isOfficial && (
                  <span className="flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-brand ring-1 ring-inset ring-brand/20">
                    <div className="h-1 w-1 rounded-full bg-brand animate-pulse" />
                    Official
                  </span>
                )}
                {canFollowAuthor && isAuthenticated ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ring-1 ring-inset",
                      isMutualFollow
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : isFollowingAuthor
                          ? "bg-sky-50 text-sky-700 ring-sky-200"
                          : "bg-slate-50 text-slate-500 ring-slate-200"
                    )}
                  >
                    {isMutualFollow ? "Mutual" : isFollowingAuthor ? "Following" : "Member"}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canFollowAuthor && isAuthenticated && isMutualFollow && onMessageAuthor ? (
              <button
                type="button"
                onClick={onMessageAuthor}
                className="inline-flex min-h-9 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-3.5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 transition-all hover:border-emerald-300 hover:bg-emerald-100"
              >
                Kirim Pesan
              </button>
            ) : null}
            {canFollowAuthor && isAuthenticated && onToggleFollowAuthor ? (
              <button
                type="button"
                disabled={followBusy}
                onClick={onToggleFollowAuthor}
                className={cn(
                  "inline-flex min-h-9 items-center justify-center rounded-full px-3.5 text-[10px] font-black uppercase tracking-[0.18em] transition-all",
                  isFollowingAuthor
                    ? "border border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-300 hover:bg-sky-100"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                  followBusy ? "opacity-60" : ""
                )}
              >
                {followBusy ? "..." : isFollowingAuthor ? "Following" : "Follow"}
              </button>
            ) : null}
            {headerMenu}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col gap-5">
        {/* Text Above Layout */}
        {hasText && textPosition === "above" && !isTwitterStyle && (
          <p className="max-w-[42rem] px-1 text-[15px] leading-relaxed text-foreground font-medium md:text-[16px]">
            {normalizedText}
          </p>
        )}

        {/* Media Container */}
        {hasImage ? (
          <div className="flex justify-center">
            <CommunityImageCarousel
              images={media}
              altBase={authorName ? `Post by ${authorName}` : "Post image"}
              aspectRatio={aspectRatio}
            />
          </div>
        ) : null}

        {/* Twitter Style Text */}
        {isTwitterStyle && (
          <div className="relative py-8 px-6 rounded-[32px] bg-surface-muted/80 ring-1 ring-border/60 shadow-inner overflow-hidden">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand/8 blur-3xl" />
            <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-brand/6 blur-3xl" />

            <p className="relative z-10 text-[21px] md:text-[24px] font-bold leading-relaxed tracking-tight text-foreground italic">
              {normalizedText}
            </p>
          </div>
        )}

        {/* Standard Text Below */}
        {hasText && textPosition === "below" && !isTwitterStyle && (
          <p className="max-w-[42rem] px-1 text-[15px] leading-relaxed text-foreground font-medium md:text-[16px]">
            {normalizedText}
          </p>
        )}

        <div className="h-px bg-border/70 mt-2" />
        {actionBar}
      </CardContent>
    </Card>
  );
}
