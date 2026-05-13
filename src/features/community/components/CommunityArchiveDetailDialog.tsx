"use client";

import { useMemo } from "react";
import { Archive, MoreHorizontal, Repeat2, Trash2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { CommunityPost } from "../types";
import { CommunityImageCarousel } from "./CommunityImageCarousel";
import { MemberPostActionBar } from "./MemberPostActionBar";
import { resolvePostPublicDate } from "../utils/community-lifecycle";

const CATEGORY_STYLES: Record<string, { label: string; badgeClassName: string }> = {
  quote: {
    label: "Quotes",
    badgeClassName: "bg-sky-500/12 text-sky-700 ring-sky-500/15",
  },
  reflection: {
    label: "Refleksi",
    badgeClassName: "bg-amber-500/12 text-amber-700 ring-amber-500/15",
  },
  prayer_request: {
    label: "Permohonan Doa",
    badgeClassName: "bg-rose-500/12 text-rose-700 ring-rose-500/15",
  },
  testimony: {
    label: "Kesaksian",
    badgeClassName: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/15",
  },
  user_post: {
    label: "Curahan Hati",
    badgeClassName: "bg-violet-500/12 text-violet-700 ring-violet-500/15",
  },
};

function formatArchiveDate(value?: string | null): string {
  if (!value) return "Baru saja";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Baru saja";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

type CommunityArchiveDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: CommunityPost | null;
  onOpenComments: () => void;
  onBookmark: () => void;
  onPray: () => void;
  onRepost: () => void | Promise<void>;
  reposting?: boolean;
  onShare: () => void | Promise<void>;
  canDelete?: boolean;
  onDelete?: () => void;
  canRepost?: boolean;
};

export function CommunityArchiveDetailDialog({
  open,
  onOpenChange,
  post,
  onOpenComments,
  onBookmark,
  onPray,
  onRepost,
  reposting = false,
  onShare,
  canDelete = false,
  onDelete,
  canRepost = true,
}: CommunityArchiveDetailDialogProps) {
  const categoryMeta = post
    ? (CATEGORY_STYLES[post.type] ?? {
        label: post.type_label || "Komunitas",
        badgeClassName: "bg-slate-500/12 text-slate-700 ring-slate-500/15",
      })
    : null;

  const mediaList = useMemo(() => {
    if (!post) return [];
    const list = Array.isArray(post.mediaPaths) ? post.mediaPaths.filter(Boolean) : [];
    if (list.length > 0) return list;
    return post.imageUrl ? [post.imageUrl] : [];
  }, [post]);

  if (!post || !categoryMeta) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-[28px] border border-white/75 bg-white/95 p-5 shadow-[0_34px_90px_-44px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:p-6">
        <article className="space-y-5 pr-8">
          <header className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-500">
                <Archive className="h-3.5 w-3.5" />
                <span>GALERY</span>
                <span>•</span>
                <span>{formatArchiveDate(resolvePostPublicDate(post) || post.createdAt)}</span>
              </div>
              <h3 className="text-[20px] font-black leading-tight tracking-tight text-slate-900">
                {post.title || "Detail postingan"}
              </h3>
              <p className="text-[13px] font-medium text-slate-500">{post.author?.name || "Member"}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "mt-0.5 inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] ring-1",
                  categoryMeta.badgeClassName
                )}
              >
                {categoryMeta.label}
              </span>
              {canDelete && onDelete ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Buka aksi konten"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted/65 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={onDelete} className="text-rose-600 focus:text-rose-600">
                      <Trash2 className="h-4 w-4" />
                      Hapus konten
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          </header>

          {mediaList.length > 0 ? (
            <div className="overflow-hidden rounded-[22px] ring-1 ring-border/60">
              <CommunityImageCarousel
                images={mediaList}
                altBase={post.author?.name ? `Galery oleh ${post.author.name}` : "Gambar galery"}
                uiVariant="archive"
                showCounter={mediaList.length > 1}
              />
            </div>
          ) : null}

          <div className="rounded-[20px] bg-slate-50/75 p-4">
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-800">{post.text || "Konten kosong."}</p>
          </div>

          <div className="space-y-3 border-t border-border/60 pt-4">
            <MemberPostActionBar
              postType={post.type}
              ariaLabelContext="archive"
              prayLabel={post.counts.likes.toString()}
              prayed={post.isLiked}
              commentsCount={post.counts.comments}
              bookmarked={post.isBookmarked}
              bookmarkLabel="Simpan"
              onPray={onPray}
              onOpenComments={onOpenComments}
              onShare={() => {
                void onShare();
              }}
              onBookmark={onBookmark}
            />
            {canRepost ? (
              <button
                type="button"
                onClick={() => {
                  void onRepost();
                }}
                disabled={reposting}
                aria-label={reposting ? "Memproses Repost ke Talks" : "Repost ke Talks"}
                className={cn(
                  "inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-[12px] font-semibold transition-colors",
                  reposting
                    ? "cursor-not-allowed bg-slate-100/90 text-slate-400"
                    : "bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900"
                )}
              >
                <Repeat2 className="h-4 w-4" />
                <span>{reposting ? "Memproses..." : "Repost ke Talks"}</span>
              </button>
            ) : null}
          </div>
        </article>
      </DialogContent>
    </Dialog>
  );
}
