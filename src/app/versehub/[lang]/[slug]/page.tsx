
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, Send, Bookmark, X, ChevronLeft, ArrowLeft, BookOpenText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAppAccessToken } from '@/services/app-auth-token';
import { getVerseShareUrl } from '@/lib/share';
import { VersehubReaderPage } from '@/features/versehub/pages/VersehubReaderPage';

type VerseData = {
    ref: string;
    reference: string;
    text: string;
    translation_name: string | null;
    provider: string | null;
    og_image_url: string;
    canonical_url: string;
};

type ReaderBook = {
    code: string;
    label: string;
    testament: 'ot' | 'nt';
};

type ReaderVerse = {
    key: string;
    verse: number;
    text: string;
};

function ChapterReaderPage({ lang, slug }: { lang: string; slug: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [tab, setTab] = useState<'ot' | 'nt'>('ot');
    const [books, setBooks] = useState<ReaderBook[]>([]);
    const [activeBook, setActiveBook] = useState<string | null>(null);
    const [chapters, setChapters] = useState<number[]>([]);
    const [chapterLabel, setChapterLabel] = useState('');
    const [verses, setVerses] = useState<ReaderVerse[]>([]);

    useEffect(() => {
        let cancelled = false;

        const fetchJson = async (input: string, timeoutMs = 12000) => {
            const controller = new AbortController();
            const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

            try {
                const response = await fetch(input, {
                    cache: 'no-store',
                    signal: controller.signal,
                    headers: {
                        Accept: 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`http_${response.status}`);
                }

                return response.json();
            } finally {
                window.clearTimeout(timeoutId);
            }
        };

        const load = async () => {
            setLoading(true);
            setError(null);

            try {
                const [booksPayload, chapterPayload] = await Promise.all([
                    fetchJson(`/api/versehub/${lang}/books`),
                    fetchJson(`/api/versehub/${lang}/chapter/${slug}`),
                ]);

                if (cancelled) return;

                const nextBooks = Array.isArray(booksPayload?.books) ? booksPayload.books : [];
                const nextVerses = Array.isArray(chapterPayload?.verses) ? chapterPayload.verses : [];
                const nextChapters = Array.isArray(chapterPayload?.chapters) ? chapterPayload.chapters : [];
                const nextBook = chapterPayload?.selected_book ?? slug.split('-')[0] ?? null;

                setBooks(nextBooks);
                setVerses(nextVerses);
                setChapters(nextChapters);
                setActiveBook(nextBook);
                setChapterLabel(chapterPayload?.chapter_label ?? slug);

                if (nextBooks.some((book: ReaderBook) => book.code === nextBook)) {
                    setTab(nextBooks.find((book: ReaderBook) => book.code === nextBook)?.testament === 'nt' ? 'nt' : 'ot');
                }
            } catch {
                if (!cancelled) setError('chapter_not_found');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [lang, slug]);

    const loadBookChapters = async (bookCode: string) => {
        setActiveBook(bookCode);
        try {
            const response = await fetch(`/api/versehub/${lang}/chapters?book=${encodeURIComponent(bookCode)}`, {
                cache: 'no-store',
                headers: {
                    Accept: 'application/json',
                },
            });
            if (!response.ok) return;
            const payload = await response.json();
            setChapters(Array.isArray(payload?.chapters) ? payload.chapters : []);
        } catch {
            // Keep picker usable with existing chapter data.
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 text-slate-300 animate-spin" />
                    <p className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">Menyiapkan Ruang Doa...</p>
                </div>
            </div>
        );
    }

    if (error || verses.length === 0) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
                <div className="mb-6 h-20 w-20 rounded-full bg-surface-muted border border-border/50 flex items-center justify-center">
                    <X className="h-10 w-10 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Pasal tidak ditemukan</h1>
                <p className="text-muted-foreground max-w-xs mb-8">
                    Data pasal belum berhasil dimuat. Coba buka kitab lain atau muat ulang halaman ini.
                </p>
                <button
                    onClick={() => router.push(`/versehub/${lang}`)}
                    className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-bold text-background transition hover:bg-brand/90 active:scale-95 shadow-sm"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Kembali ke Alkitab
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFCF9] text-slate-900 pb-20">
            <header className="sticky top-0 z-40 border-b border-black/5 bg-[#FDFCF9]/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 md:px-6">
                    <button
                        type="button"
                        onClick={() => router.push(`/versehub/${lang}`)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-black/5 transition hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>

                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">VerseHub</p>
                        <h1 className="mt-1 text-sm font-bold tracking-tight text-slate-900">{chapterLabel}</h1>
                    </div>

                    <button
                        type="button"
                        onClick={() => setPickerOpen(true)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-black/5 transition hover:bg-slate-50"
                    >
                        <BookOpenText className="h-5 w-5" />
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
                <section className="rounded-[32px] bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] md:p-7">
                    <div className="border-b border-slate-100 pb-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Bacaan Hari Ini</p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">{chapterLabel}</h2>
                        <p className="mt-2 text-sm text-slate-500">{verses.length} ayat tersedia untuk dibaca dan direnungkan.</p>
                    </div>

                    <div className="mt-6 space-y-5">
                        {verses.map((verse) => (
                            <article key={verse.key} className="rounded-[28px] bg-[#F8F8F5] px-4 py-4 ring-1 ring-black/[0.03] md:px-5">
                                <div className="flex items-start gap-4">
                                    <span className="mt-1 inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-white px-2 text-[12px] font-black text-slate-500 shadow-sm ring-1 ring-black/[0.04]">
                                        {verse.verse}
                                    </span>
                                    <p className="text-[17px] leading-8 text-slate-700 md:text-[18px]">{verse.text}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </main>

            <AnimatePresence>
                {pickerOpen && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.button
                            type="button"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setPickerOpen(false)}
                            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.97, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.97, y: 12 }}
                            className="relative flex h-[82vh] w-full max-w-2xl flex-col overflow-hidden rounded-[36px] bg-white shadow-2xl ring-1 ring-black/5"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">VerseHub</p>
                                    <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900">Koleksi Kitab</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setPickerOpen(false)}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex gap-2 border-b border-slate-100 px-6 py-4">
                                {(['ot', 'nt'] as const).map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => setTab(item)}
                                        className={cn(
                                            'rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] transition',
                                            tab === item ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                                        )}
                                    >
                                        {item === 'ot' ? 'Perjanjian Lama' : 'Perjanjian Baru'}
                                    </button>
                                ))}
                            </div>

                            <div className="grid min-h-0 flex-1 gap-0 md:grid-cols-[1.15fr,0.85fr]">
                                <div className="min-h-0 overflow-y-auto border-b border-slate-100 p-5 md:border-b-0 md:border-r">
                                    <div className="grid grid-cols-2 gap-3">
                                        {books.filter((book) => book.testament === tab).map((book) => (
                                            <button
                                                key={book.code}
                                                type="button"
                                                onClick={() => loadBookChapters(book.code)}
                                                className={cn(
                                                    'rounded-[22px] px-4 py-4 text-left text-sm font-bold transition ring-1',
                                                    activeBook === book.code
                                                        ? 'bg-slate-900 text-white ring-slate-900'
                                                        : 'bg-slate-50 text-slate-700 ring-slate-100 hover:bg-slate-100',
                                                )}
                                            >
                                                {book.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="min-h-0 overflow-y-auto p-5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Pilih Pasal</p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {chapters.map((chapter) => (
                                            <button
                                                key={chapter}
                                                type="button"
                                                onClick={() => {
                                                    if (!activeBook) return;
                                                    setPickerOpen(false);
                                                    router.push(`/versehub/${lang}/${activeBook}-${chapter}`);
                                                }}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                                            >
                                                {chapter}
                                            </button>
                                        ))}
                                        {chapters.length === 0 && (
                                            <p className="text-sm text-slate-500">Pilih kitab terlebih dahulu untuk melihat daftar pasal.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function UnifiedVerseHubPage() {
    const params = useParams<{ lang: string; slug: string }>();
    const lang = params?.lang || 'id';
    const slug = params?.slug || '';
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
            url: getVerseShareUrl(lang, slug)
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
