"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ActionBar } from "./ActionBar";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { getVerseShareUrl } from "@/lib/share";

export type FeaturedVerse = {
  ref: string;
  href: string;
  text: string;
  reference: string;
  imageUrl?: string;
};

function VerseQuoteRail({ text }: { text: string }) {
  const lines = String(text ?? "")
    .split(/\r?\n/)
    .map((x) => x.trimEnd());

  return (
    <blockquote className="relative pl-10">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-0 top-0 text-muted-foreground/60"
        aria-hidden
      >
        <path d="M10 11H6V7a4 4 0 0 1 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M18 11h-4V7a4 4 0 0 1 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M10 11v6H6v-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 11v6h-4v-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div className="min-w-0 pt-0.5 pr-1">
        <div className="text-[17px] leading-8 tracking-[-0.01em] md:text-[24px] md:leading-[1.75]">
          {lines.map((line, idx) => (
            <span key={idx}>
              {line}
              {idx < lines.length - 1 ? <br /> : null}
            </span>
          ))}
        </div>
      </div>
    </blockquote>
  );
}

export function VerseHubFeaturedCard({
  verse,
  postId,
  onOpenComments,
}: {
  verse: FeaturedVerse | null | undefined;
  postId?: string;
  onOpenComments?: (id: string) => void;
}) {
  const shareOrigin = typeof window !== "undefined" ? window.location.origin : "";
  
  const highlightImageUrl = useMemo(() => {
    if (verse?.imageUrl) return verse.imageUrl;
    return "/og/verse-highlight-fallback.png";
  }, [verse]);

  const toStaticVersehubHref = (href?: string, ref?: string) => {
    const raw = String(href || '').trim();
    if (raw) {
      const chapterFixed = raw.replace('/chapter/', '/');
      const withOrigin = chapterFixed.startsWith('http')
        ? chapterFixed
        : `https://www.thechoosentalks.org${chapterFixed.startsWith('/') ? '' : '/'}${chapterFixed}`;
      try {
        const url = new URL(withOrigin);
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts[0] === 'versehub' && parts[1] && parts[2]) {
          return `/versehub/${parts[1]}?ref=${encodeURIComponent(parts.slice(2).join('/'))}`;
        }
        if (parts[0] === 'versehub' && parts[1]) {
          return `/versehub/${parts[1]}`;
        }
      } catch {
        // ignore and fallback below
      }
    }
    return ref ? `/versehub/id?ref=${encodeURIComponent(ref)}` : "/versehub/id";
  };

  const verseHref = toStaticVersehubHref(verse?.href, verse?.ref);
  
  const reactionKey = useMemo(
    () => (verse?.ref ? `tct:versehub:featured:reactions:${verse.ref}` : "tct:versehub:featured:reactions:default"),
    [verse?.ref]
  );
  
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeBase] = useState(124);
  const [bookmarkBase] = useState(37);
  const [commentsCount] = useState(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(reactionKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { liked?: boolean; bookmarked?: boolean };
      setLiked(Boolean(parsed?.liked));
      setBookmarked(Boolean(parsed?.bookmarked));
    } catch {
      // ignore
    }
  }, [reactionKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        reactionKey,
        JSON.stringify({
          liked,
          bookmarked,
        })
      );
    } catch {
      // ignore
    }
  }, [reactionKey, liked, bookmarked]);

  const onShare = async () => {
    const url = verse?.ref ? getVerseShareUrl('id', verse.ref) : `${shareOrigin}${verseHref}`;
    const title = verse?.reference || "VerseHub";

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        return;
      }
    } catch {
      // ignore and fallback
    }
  };

  if (!verse) return null;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-1 mb-2">
        <a
          href="/versehub/id"
          className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40 transition hover:text-foreground/70"
          aria-label="Buka VerseHub"
        >
          Sorotan VerseHub
        </a>

        <a href={verseHref} className="block max-w-full px-3" aria-label={`Buka ayat ${verse.reference}`}>
          <h2 className="tct-serif text-[22px] md:text-[24px] leading-tight text-foreground/90 hover:opacity-80 transition-opacity tracking-tight">{verse.reference}</h2>
        </a>
      </div>

      <Card className="rounded-[32px] md:rounded-[40px] border-0 glass-card p-5 transition-all hover:shadow-card">
        <a href={verseHref} className="mt-1 block overflow-hidden rounded-[24px] md:rounded-[32px] ring-1 ring-black/[0.04] shadow-sm transform transition-transform duration-500 hover:scale-[1.01]" aria-label={`Buka highlight ayat ${verse.reference}`}>
          <img
            src={highlightImageUrl}
            alt={`Highlight image ${verse.reference}`}
            className="aspect-[1200/630] w-full object-cover"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = "/og/verse-highlight-fallback.png";
            }}
          />
        </a>
      </Card>

      <Card className="rounded-[32px] md:rounded-[40px] border-0 glass-card">
        <CardContent className="tct-card-pad">
          <a href={verseHref} className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40" aria-label={`Buka ayat ${verse.reference}`}>
            <VerseQuoteRail text={verse.text} />
          </a>

          <div className="mt-6">
            <div className="h-px bg-border/70" aria-hidden />
            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <button
                type="button"
                onClick={() => window.location.assign(verseHref)}
                className="tct-pressable inline-flex items-center justify-center rounded-2xl bg-surface border border-border/50 shadow-sm px-4 py-2.5 font-bold text-[13px] text-foreground/80 transition-all hover:bg-surface-elevated"
              >
                Baca lebih lanjut
              </button>

              <ActionBar
                prayLabel={String(liked ? likeBase + 1 : likeBase)}
                prayed={liked}
                commentsCount={commentsCount}
                bookmarked={bookmarked}
                bookmarkLabel={String(bookmarked ? bookmarkBase + 1 : bookmarkBase)}
                onPray={() => setLiked((v) => !v)}
                onOpenComments={() => {
                  if (postId && onOpenComments) {
                    onOpenComments(postId);
                  } else {
                    window.location.assign(`${verseHref}#comments`);
                  }
                }}
                onShare={onShare}
                onBookmark={() => setBookmarked((v) => !v)}
                className="w-full justify-end lg:w-auto"
                splitSave
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
