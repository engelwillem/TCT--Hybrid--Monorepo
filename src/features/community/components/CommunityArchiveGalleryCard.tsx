"use client";

import { useMemo } from "react";
import { ArrowUpRight, Bookmark, Heart, MessageCircle, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CommunityPost } from "../types";

const CATEGORY_STYLES: Record<string, { label: string; badgeClassName: string; accentClassName: string }> = {
  quote: {
    label: "Quotes",
    badgeClassName: "bg-sky-500/12 text-sky-700 ring-sky-500/15",
    accentClassName: "from-sky-500/14 via-sky-500/6 to-transparent",
  },
  reflection: {
    label: "Refleksi",
    badgeClassName: "bg-amber-500/12 text-amber-700 ring-amber-500/15",
    accentClassName: "from-amber-500/16 via-amber-500/7 to-transparent",
  },
  prayer_request: {
    label: "Permohonan Doa",
    badgeClassName: "bg-rose-500/12 text-rose-700 ring-rose-500/15",
    accentClassName: "from-rose-500/16 via-rose-500/7 to-transparent",
  },
  testimony: {
    label: "Kesaksian",
    badgeClassName: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/15",
    accentClassName: "from-emerald-500/16 via-emerald-500/7 to-transparent",
  },
  user_post: {
    label: "Curahan Hati",
    badgeClassName: "bg-violet-500/12 text-violet-700 ring-violet-500/15",
    accentClassName: "from-violet-500/16 via-violet-500/7 to-transparent",
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

function buildCardTitle(post: CommunityPost, fallbackLabel: string): string {
  const explicitTitle = String(post.title || "").trim();
  if (explicitTitle) return explicitTitle;

  const source = String(post.text || "").replace(/\s+/g, " ").trim();
  if (!source) return fallbackLabel;

  return source.length > 72 ? `${source.slice(0, 72).trimEnd()}...` : source;
}

function buildExcerpt(post: CommunityPost): string {
  const source = String(post.text || "").replace(/\s+/g, " ").trim();
  if (!source) return "Belum ada ringkasan yang tersedia untuk konten ini.";
  return source.length > 180 ? `${source.slice(0, 180).trimEnd()}...` : source;
}

type CommunityArchiveGalleryCardProps = {
  post: CommunityPost;
  onOpen: () => void;
  onBookmark: () => void;
  onPray: () => void;
  onShare: () => void | Promise<void>;
};

export function CommunityArchiveGalleryCard({
  post,
  onOpen,
  onBookmark,
  onPray,
  onShare,
}: CommunityArchiveGalleryCardProps) {
  const categoryMeta = CATEGORY_STYLES[post.type] ?? {
    label: post.type_label || "Komunitas",
    badgeClassName: "bg-slate-500/12 text-slate-700 ring-slate-500/15",
    accentClassName: "from-slate-500/14 via-slate-500/6 to-transparent",
  };

  const title = useMemo(() => buildCardTitle(post, categoryMeta.label), [categoryMeta.label, post]);
  const excerpt = useMemo(() => buildExcerpt(post), [post]);
  const authorName = String(post.author?.name || "Chosen People");
  const mediaPreview = post.mediaPaths?.[0] || post.imageUrl || null;

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white/82 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.38)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_34px_90px_-46px_rgba(15,23,42,0.42)]">
      <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b", categoryMeta.accentClassName)} />

      <button
        type="button"
        onClick={onOpen}
        className="absolute inset-0 z-10 rounded-[28px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-4 focus-visible:ring-offset-white"
        aria-label={`Buka ${title}`}
      />

      <div className="relative flex h-full flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex min-h-8 items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ring-1",
                categoryMeta.badgeClassName
              )}
            >
              {categoryMeta.label}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">{formatArchiveDate(post.createdAt)}</span>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onBookmark();
            }}
            className={cn(
              "relative z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
              post.isBookmarked
                ? "border-amber-300/70 bg-amber-50 text-amber-700"
                : "border-slate-200/80 bg-white/90 text-slate-500 hover:border-slate-300 hover:text-slate-800"
            )}
            aria-label={post.isBookmarked ? "Hapus dari simpanan" : "Simpan konten"}
          >
            <Bookmark className={cn("h-4 w-4", post.isBookmarked && "fill-current")} />
          </button>
        </div>

        {mediaPreview ? (
          <div className="relative mt-4 overflow-hidden rounded-[24px] border border-white/75 bg-slate-100">
            <img
              src={mediaPreview}
              alt={title}
              className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/12 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="mt-4 rounded-[24px] border border-dashed border-slate-200/80 bg-[linear-gradient(135deg,rgba(248,250,252,0.95),rgba(241,245,249,0.82))] p-5 text-left">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Arsip Community</p>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{excerpt}</p>
          </div>
        )}

        <div className="mt-5 flex flex-1 flex-col">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{authorName}</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/[0.035] px-2.5 py-1 text-[11px] font-semibold text-slate-500">
              Buka
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>

          <h3 className="mt-3 line-clamp-2 text-[19px] font-bold leading-tight tracking-tight text-slate-900">{title}</h3>
          <p className="mt-3 line-clamp-3 text-[14px] leading-6 text-slate-600">{excerpt}</p>
        </div>

        <div className="relative z-20 mt-6 flex items-center justify-between gap-3 border-t border-slate-200/75 pt-4 text-slate-500">
          <div className="flex items-center gap-2 text-[12px] font-semibold">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onPray();
              }}
              className={cn(
                "inline-flex min-h-10 items-center gap-2 rounded-full px-3 transition-colors",
                post.isLiked ? "bg-rose-50 text-rose-700" : "hover:bg-slate-100/80 hover:text-slate-800"
              )}
              aria-label="Sukai konten"
            >
              <Heart className={cn("h-4 w-4", post.isLiked && "fill-current")} />
              <span>{post.counts.likes}</span>
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpen();
              }}
              className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 hover:bg-slate-100/80 hover:text-slate-800"
              aria-label="Buka komentar"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.counts.comments}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              void onShare();
            }}
            className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-[12px] font-semibold hover:bg-slate-100/80 hover:text-slate-800"
            aria-label="Bagikan konten"
          >
            <Share2 className="h-4 w-4" />
            <span>Bagikan</span>
          </button>
        </div>
      </div>
    </Card>
  );
}
