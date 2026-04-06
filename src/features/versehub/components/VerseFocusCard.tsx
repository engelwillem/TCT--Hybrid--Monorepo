"use client";

import { Bookmark, Heart, MessageSquare, MessageSquareText, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerseData } from "@/features/versehub/types";

interface VerseFocusCardProps {
  bookmarked: boolean;
  bookmarkCount: number;
  chapterRouteFromVerse: string;
  liked: boolean;
  likeCount: number;
  onBackToReader: () => void;
  onBookmark: () => void;
  onLike: () => void;
  onOpenImage: () => void;
  onShare: () => void;
  verseData: VerseData;
}

export function VerseFocusCard({
  bookmarked,
  bookmarkCount,
  chapterRouteFromVerse,
  liked,
  likeCount,
  onBackToReader,
  onBookmark,
  onLike,
  onOpenImage,
  onShare,
  verseData,
}: VerseFocusCardProps) {
  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[34px] p-5 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#91A0C7]">Verse Focus</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">{verseData.reference}</h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/60">
              Ayat tunggal ini tetap berada dalam ekosistem reader VerseHub, jadi Anda bisa bookmark, share, dan kembali ke chapter tanpa kehilangan konteks.
            </p>
          </div>
          <button
            type="button"
            onClick={onBackToReader}
            className="inline-flex items-center gap-2 rounded-full bg-foreground/5 dark:bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-foreground/60 transition hover:bg-foreground/10"
            aria-label={`Kembali ke reader ${chapterRouteFromVerse}`}
          >
            <MessageSquareText className="h-3.5 w-3.5" />
            Reader
          </button>
        </div>
      </section>

      <section className="glass-panel group overflow-hidden rounded-[40px] p-4 md:p-5">
        <div className="overflow-hidden rounded-[24px] ring-1 ring-black/[0.04] md:rounded-[32px]">
          <img
            src={verseData.og_image_url}
            alt="Shared Verse"
            className="aspect-[1200/630] w-full cursor-zoom-in object-cover transition-transform duration-700 group-hover:scale-105"
            onClick={onOpenImage}
            loading="lazy"
          />
        </div>
      </section>

      <section className="glass-panel overflow-hidden rounded-[40px]">
        <div className="p-5 md:p-7">
          <blockquote className="relative">
            <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 text-slate-400/10" aria-hidden>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 11H6V7a4 4 0 0 1 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M18 11h-4V7a4 4 0 0 1 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M10 11v6H6v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 11v6h-4v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="pl-6 md:pl-10">
              <div className="text-[21px] italic leading-[1.85] text-slate-800/95 md:text-[23px]">
                {verseData.text}
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold text-slate-400/80">
                <span className="uppercase tracking-[0.2em]">{verseData.provider ?? "versehub"}</span>
                {verseData.translation_name && (
                  <>
                    <span className="opacity-40">•</span>
                    <span className="tracking-widest">{verseData.translation_name}</span>
                  </>
                )}
              </div>
            </div>
          </blockquote>

          <div className="mt-10 flex items-center justify-between border-t border-black/5 pt-6">
            <div className="flex items-center gap-1">
              <button
                onClick={onLike}
                className={cn(
                  "flex h-11 items-center gap-2.5 rounded-full px-5 transition-all active:scale-90",
                  liked ? "bg-rose-500/10 text-rose-500" : "text-slate-500 hover:bg-slate-100"
                )}
              >
                <Heart className={cn("h-5 w-5", liked ? "fill-current" : "")} />
                <span className="text-sm font-bold tabular-nums">{liked ? `You + ${likeCount - 1}` : likeCount}</span>
              </button>

              <button className="flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition-all hover:bg-slate-100 active:scale-95">
                <MessageSquare className="h-5 w-5" />
              </button>

              <button
                onClick={onShare}
                className="flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition-all hover:bg-slate-100 active:scale-95"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={onBookmark}
              className={cn(
                "flex h-11 items-center gap-2.5 rounded-full px-5 transition-all active:scale-95",
                bookmarked ? "bg-[#2A67FF]/10 text-[#2A67FF]" : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <Bookmark className={cn("h-5 w-5", bookmarked ? "fill-current" : "")} />
              <span className="text-sm font-bold tabular-nums">{bookmarked ? `You + ${bookmarkCount - 1}` : bookmarkCount}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
