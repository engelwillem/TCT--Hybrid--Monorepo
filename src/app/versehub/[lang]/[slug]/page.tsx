
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, Send, Bookmark, X, ChevronLeft, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VersehubReaderPage } from "@/features/versehub/pages/VersehubReaderPage";
import { getAppAccessToken } from '@/services/app-auth-token';

type VerseData = {
    ref: string;
    reference: string;
    text: string;
    translation_name: string | null;
    provider: string | null;
    og_image_url: string;
    canonical_url: string;
};

export default function UnifiedVerseHubPage({ params }: { params: { lang: string; slug: string } }) {
    const { lang, slug } = params;
    const router = useRouter();
    
    // Intelligent Route Differentiation:
    const segments = slug ? slug.split(/[-_.]/) : [];
    const isVerse = segments.length >= 3;
    const isChapter = !isVerse && slug && (
        segments.length === 2 || 
        /^[a-z]+\d+$/i.test(slug)
    );

    const [verse, setVerse] = useState<VerseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(124);
    const [bookmarked, setBookmarked] = useState(false);
    const [bookmarkCount, setBookmarkCount] = useState(37);
    const [ogOpen, setOgOpen] = useState(false);
    
    const accessToken = typeof window !== 'undefined' ? getAppAccessToken() : null;
    const isAuthenticated = Boolean(accessToken);

    // 1. Fetch Verse Content (Real API)
    useEffect(() => {
        if (!slug || isChapter) return;

        let isActive = true;
        const fetchVerse = async () => {
            try {
                const response = await fetch(`/api/versehub/${lang}/${slug}`, {
                    headers: { Accept: 'application/json' },
                    cache: 'no-store'
                });
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('verse_not_found');
                    }
                    throw new Error('fetch_error');
                }
                const data = await response.json();
                if (isActive) {
                    setVerse(data);
                    setLoading(false);
                }
            } catch (e: any) {
                console.error('VerseHub fetch error:', e);
                if (isActive) {
                    setError(e.message);
                    setLoading(false);
                }
            }
        };
        fetchVerse();
        return () => { isActive = false; };
    }, [slug, isChapter, lang]);

    // 2. Fetch User Interaction State (Real Persistence)
    useEffect(() => {
        if (!isAuthenticated || !slug || isChapter) return;
        if (!accessToken) return;
        
        const segments = slug.split('-');
        if (segments.length < 3) return;

        fetch(`/api/versehub/${lang}/actions?book=${segments[0]}&chapter=${segments[1]}`, {
            headers: { 
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`
            },
        })
        .then(r => {
            // Avoid noisy console errors when token has expired.
            if (r.status === 401 || r.status === 403) return null;
            return r.ok ? r.json() : null;
        })
        .then(json => {
            const verseActions = json?.actions?.[slug];
            if (verseActions) {
                setLiked(Boolean(verseActions.favorite));
                setBookmarked(Boolean(verseActions.bookmarked));
            }
        })
        .catch(() => undefined);
    }, [isAuthenticated, accessToken, slug, isChapter, lang]);

    const handleLike = async () => {
        if (!isAuthenticated) {
            router.push('/');
            return;
        }
        const token = getAppAccessToken();
        if (!token) {
            router.push('/login');
            return;
        }
        const nextLiked = !liked;
        const prevLiked = liked;
        
        setLiked(nextLiked);
        setLikeCount(prev => nextLiked ? prev + 1 : prev - 1);

        const segments = slug.split('-');
        try {
            const res = await fetch(`/api/versehub/${lang}/actions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    book: segments[0],
                    chapter: segments[1],
                    verse: segments[2],
                    favorite: nextLiked
                })
            });
            if (!res.ok) throw new Error('Action failed');
        } catch (e) {
            setLiked(prevLiked);
            setLikeCount(prev => prevLiked ? prev + 1 : prev - 1);
        }
    };

    const handleBookmark = async () => {
        if (!isAuthenticated) {
            router.push('/');
            return;
        }
        const token = getAppAccessToken();
        if (!token) {
            router.push('/login');
            return;
        }
        const nextBookmarked = !bookmarked;
        const prevBookmarked = bookmarked;

        setBookmarked(nextBookmarked);
        setBookmarkCount(prev => nextBookmarked ? prev + 1 : prev - 1);

        const segments = slug.split('-');
        try {
            const res = await fetch(`/api/versehub/${lang}/actions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    book: segments[0],
                    chapter: segments[1],
                    verse: segments[2],
                    bookmarked: nextBookmarked
                })
            });
            if (!res.ok) throw new Error('Action failed');
        } catch (e) {
            setBookmarked(prevBookmarked);
            setBookmarkCount(prev => prevBookmarked ? prev + 1 : prev - 1);
        }
    };

    const handleShare = async () => {
        if (!verse) return;
        const shareData = {
            title: verse.reference,
            text: `${verse.reference}\n\n"${verse.text}"\n\nBuka di VerseHub:`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                alert('Teks ayat disalin!');
            }
        } catch (e) { /* ignore */ }
    };

    if (isChapter) {
        return <VersehubReaderPage lang={lang} mode="chapter" initialChapterRef={slug} />;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="h-10 w-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
            </div>
        );
    }

    const isId = lang === 'id';

    if (error === 'verse_not_found' || !verse) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
                <div className="mb-6 h-20 w-20 rounded-full bg-surface-muted border border-border/50 flex items-center justify-center">
                    <X className="h-10 w-10 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-bold mb-2">
                    {isId ? 'Ayat tidak ditemukan' : 'Verse not found'}
                </h1>
                <p className="text-muted-foreground max-w-xs mb-8">
                    {isId 
                        ? 'Maaf, ayat yang Anda cari tidak tersedia atau slug tidak valid.' 
                        : 'Sorry, the verse you are looking for is not available or the slug is invalid.'}
                </p>
                <button
                    onClick={() => router.push(`/versehub/${lang}`)}
                    className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-bold text-background transition hover:bg-brand/90 active:scale-95 shadow-sm"
                >
                    <ChevronLeft className="h-4 w-4" />
                    {isId ? 'Kembali ke Alkitab' : 'Back to Bible'}
                </button>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
                <div className="mb-6 h-20 w-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
                    <Send className="h-10 w-10 text-rose-500" />
                </div>
                <h1 className="text-2xl font-bold mb-2">
                    {isId ? 'Terjadi kesalahan' : 'Something went wrong'}
                </h1>
                <p className="text-muted-foreground max-w-xs mb-8">
                    {isId 
                        ? 'Gagal memuat data ayat. Silakan coba lagi nanti.' 
                        : 'Failed to load verse data. Please try again later.'}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-2 rounded-full bg-surface hover:bg-surface-elevated px-6 py-3 font-bold text-foreground transition active:scale-95 shadow-sm ring-1 ring-border/50"
                >
                    {isId ? 'Coba Lagi' : 'Try Again'}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden bg-mesh">
                {/* mesh bg handled by globals */}
            </div>

            <main className="relative mx-auto max-w-3xl px-4 py-6 md:py-10">
                <div className="space-y-8">
                    <header className="space-y-3">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => router.push(`/versehub/${lang}`)}
                                className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-4 py-1.5 text-[10px] font-bold text-muted-foreground border border-border transition hover:text-foreground hover:bg-surface active:scale-95"
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden></span>
                                VerseHub
                            </button>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => router.push(`/versehub/${lang}`)}
                                    className="text-xs font-bold text-muted-foreground hover:text-foreground"
                                >
                                    {isId ? 'Kembali ke Alkitab' : 'Back to Bible'}
                                </button>
                                <div className="h-3 w-px bg-border" />
                                <button className="text-xs font-bold text-brand">
                                    {isId ? 'EN' : 'ID'}
                                </button>
                            </div>
                        </div>

                        <h1 className="tct-h1 text-foreground">
                            {verse.reference}
                        </h1>
                    </header>

                    <section className="group relative overflow-hidden rounded-[40px] glass-card tct-card-pad border-0 shadow-soft">
                        <div className="overflow-hidden rounded-[24px] md:rounded-[32px] ring-1 ring-black/[0.04]">
                            <img
                                src={verse.og_image_url}
                                alt="Shared Verse"
                                className="aspect-[1200/630] w-full cursor-zoom-in object-cover transition-transform duration-700 group-hover:scale-105"
                                onClick={() => setOgOpen(true)}
                                loading="lazy"
                            />
                        </div>
                    </section>

                    <section className="rounded-[40px] glass-card border-0 shadow-soft overflow-hidden">
                        <div className="tct-card-pad">
                            <blockquote className="relative">
                                <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/10" aria-hidden>
                                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 11H6V7a4 4 0 0 1 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                        <path d="M18 11h-4V7a4 4 0 0 1 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                        <path d="M10 11v6H6v-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M18 11v6h-4v-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>

                                <div className="pl-6 md:pl-10">
                                    <div className="tct-serif text-xl leading-relaxed text-foreground md:text-3xl md:leading-relaxed italic">
                                        {verse.text}
                                    </div>

                                    <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold text-muted-foreground/50">
                                        <span className="uppercase tracking-[0.2em]">{verse.provider ?? 'versehub'}</span>
                                        {verse.translation_name && (
                                            <>
                                                <span className="opacity-40">•</span>
                                                <span className="tracking-widest">{verse.translation_name}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </blockquote>

                            <div className="mt-10 border-t border-border pt-6 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={handleLike}
                                        className={cn(
                                            "flex h-11 items-center gap-2.5 rounded-full px-5 transition-all active:scale-90",
                                            liked ? "bg-rose-500/10 text-rose-500" : "text-muted-foreground hover:bg-surface-muted"
                                        )}
                                    >
                                        <Heart className={cn("h-5 w-5", liked ? "fill-current" : "")} />
                                        <span className="text-sm font-bold tabular-nums">{liked ? `You + ${likeCount - 1}` : likeCount}</span>
                                    </button>

                                    <button
                                        className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted active:scale-95 transition-all"
                                    >
                                        <MessageSquare className="h-5 w-5" />
                                    </button>

                                    <button
                                        onClick={handleShare}
                                        className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted active:scale-95 transition-all"
                                    >
                                        <Send className="h-5 w-5" />
                                    </button>
                                </div>

                                <button
                                    onClick={handleBookmark}
                                    className={cn(
                                        "flex h-11 items-center gap-2.5 rounded-full px-5 transition-all active:scale-95",
                                        bookmarked ? "bg-brand/10 text-brand" : "text-muted-foreground hover:bg-surface-muted"
                                    )}
                                >
                                    <Bookmark className={cn("h-5 w-5", bookmarked ? "fill-current" : "")} />
                                    <span className="text-sm font-bold tabular-nums">{bookmarked ? `You + ${bookmarkCount - 1}` : bookmarkCount}</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    <footer className="text-center py-10">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">thechoosentalks.org</p>
                    </footer>
                </div>
            </main>

            <AnimatePresence>
                {ogOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
                    >
                        <button 
                            onClick={() => setOgOpen(false)}
                            className="absolute top-6 right-6 h-12 w-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-90"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            src={verse.og_image_url}
                            className="max-h-[85vh] w-full max-w-5xl rounded-2xl object-contain shadow-2xl ring-1 ring-white/10"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
