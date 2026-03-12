'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bookmark, Heart, MessageCircle, Send, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

export interface SheetComment {
    id: number;
    author: string;
    body: string;
    created_at: string;
    reply_to_id?: number | null;
    reply_to_author?: string | null;
}

export default function QuoteCard({
    payload,
}: {
    payload?: { text: string; author?: string | null; reference?: string | null; ref?: string | null; source?: string | null };
}) {
    const router = useRouter();
    // In Next/Firebase version, we check auth via useUser or similar logic
    const isAuthenticated = true; // Placeholder for now

    const quoteText =
        payload?.text?.trim() ||
        'Setiap langkah kecil hari ini tetap berarti. Kamu tidak berjalan sendiri.';
    
    const pageKey = 'today-quotes';
    const reactionKey = `tct:quote:reactions:${pageKey}`;
    const commentsKey = `tct:quote:comments:${pageKey}`;

    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [likeBase] = useState(124);
    const [bookmarkBase] = useState(37);
    const [comments, setComments] = useState<SheetComment[]>([]);
    const [commentsOpen, setCommentsOpen] = useState(false);

    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(reactionKey);
            const parsed = raw ? JSON.parse(raw) : null;
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
                    updated_at: new Date().toISOString(),
                }),
            );
        } catch {
            // ignore
        }
    }, [reactionKey, liked, bookmarked]);

    const shareQuote = async () => {
        const url = window.location.href;
        const title = 'Quotes • Today';
        try {
            if (navigator.share) {
                await navigator.share({ title, text: quoteText, url });
                return;
            }
            // Fallback
        } catch {
            // ignore
        }
    };

    return (
        <Card className="overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl">
            <CardContent className="px-5 pb-5 pt-5 md:px-7 md:pb-7 md:pt-7">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 shadow-sm">
                            Quotes
                        </span>
                        <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Today Reflection</span>
                    </div>
                    <Sparkles className="h-4 w-4 text-cyan-400/40" />
                </div>

                <div className="relative overflow-hidden rounded-2xl ring-1 ring-slate-900/5 shadow-inner">
                    <div className="aspect-[4/5] md:aspect-[21/9] bg-[radial-gradient(120%_110%_at_5%_95%,rgba(15,23,42,0.95),transparent_45%),radial-gradient(80%_80%_at_82%_20%,rgba(30,58,138,0.6),transparent_55%),linear-gradient(145deg,#0f172a_0%,#1e293b_52%,#0f172a_100%)]" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                        <div className="space-y-1">
                            <div className="text-3xl font-serif text-white/20 select-none">"</div>
                            <p className="font-serif text-lg italic text-slate-200 line-clamp-3 leading-relaxed">
                                Satu kutipan yang menguatkan perjalananmu hari ini.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            className={cn("group tct-pressable inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors", liked ? 'text-rose-500 bg-rose-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50')}
                            onClick={() => setLiked(!liked)}
                        >
                            <Heart className="h-5 w-5" fill={liked ? 'currentColor' : 'none'} />
                        </button>

                        <button
                            type="button"
                            className="group tct-pressable inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <MessageCircle className="h-5 w-5" />
                        </button>

                        <button
                            type="button"
                            className="group tct-pressable inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                            onClick={shareQuote}
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>

                    <button
                        type="button"
                        className={cn("group tct-pressable inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors", bookmarked ? 'text-cyan-600 bg-cyan-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50')}
                        onClick={() => setBookmarked(!bookmarked)}
                    >
                        <Bookmark className="h-5 w-5" fill={bookmarked ? 'currentColor' : 'none'} />
                    </button>
                </div>

                <div className="mt-8 relative overflow-hidden rounded-[2rem] bg-white/[0.03] p-10 md:p-12 border border-white/5 shadow-inner backdrop-blur-sm">
                    <p className="relative font-serif text-[24px] leading-[1.6] tracking-tight text-white md:text-[30px]">
                        {quoteText}
                    </p>
                    <div className="mt-6 flex flex-col gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/80">
                            {payload?.reference ?? 'Quote of the day'}
                        </p>
                        {payload?.ref && (
                            <Link
                                href={`/versehub/id/${payload.ref}`}
                                className="text-[11px] font-bold text-slate-400 hover:text-cyan-500 transition-colors flex items-center gap-1"
                            >
                                Buka dalam Alkitab <Send className="h-2 w-2" />
                            </Link>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
