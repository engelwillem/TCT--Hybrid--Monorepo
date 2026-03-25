"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowRight,
    BookHeart,
    BookOpenText,
    ChevronLeft,
    Loader2,
    MessageSquareText,
    Sparkles,
    X,
} from "lucide-react";
import AmbienceController from "@/components/versehub/AmbienceController";
import MentorPanel from "@/components/versehub/MentorPanel";
import { cn } from "@/lib/utils";

type Book = {
    code: string;
    label: string;
    testament: "ot" | "nt";
};

type Verse = {
    key: string;
    verse: number;
    text: string;
};

type ChapterPayload = {
    selected_book?: string | null;
    selected_chapter?: number | null;
    chapters?: number[];
    chapter_label?: string;
    verses?: Verse[];
};

interface VersehubReaderPageProps {
    lang: string;
    mode?: "landing" | "chapter";
    initialChapterRef?: string | null;
}

type SanctuaryScene = {
    eyebrow: string;
    quote: string;
    invitation: string;
    reflection: string;
};

const SANCTUARY_SCENES: SanctuaryScene[] = [
    {
        eyebrow: "VerseHub",
        quote: "\"Janganlah kita jemu-jemu berbuat baik...\"",
        invitation: "Masuk sebentar, tenangkan hati, lalu buka firman dengan ritme yang lebih pelan.",
        reflection: "Hari ini bukan tentang buru-buru menyelesaikan bacaan, tetapi tentang memberi ruang bagi firman untuk berbicara.",
    },
    {
        eyebrow: "Daily Mana",
        quote: "\"Firman-Mu itu pelita bagi kakiku...\"",
        invitation: "Mulai dari satu langkah kecil. Explore akan membawa Anda masuk ke kitab dan pasal yang ingin dibaca.",
        reflection: "VerseHub dirancang seperti ruang doa digital: satu layar untuk menerima, lalu satu jalur untuk masuk lebih dalam.",
    },
    {
        eyebrow: "Ruang Doa Digital",
        quote: "\"Tinggallah di dalam Aku...\"",
        invitation: "Pilih jalur baca, nyalakan ambience, dan biarkan scripture guide menemani saat Anda masuk ke ayat.",
        reflection: "Koleksi kitab, ambience Lagusion, dan mentor internal bekerja sebagai satu pengalaman, bukan panel-panel yang terpisah.",
    },
];

const fetchJsonWithTimeout = async (input: string, timeoutMs = 12000) => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(input, {
            cache: "no-store",
            signal: controller.signal,
            headers: {
                Accept: "application/json",
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

export function VersehubReaderPage({
    lang: initialLang,
    mode = "landing",
    initialChapterRef = null,
}: VersehubReaderPageProps) {
    const params = useParams<{ lang: string }>();
    const router = useRouter();
    const lang = params?.lang || initialLang || "id";

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [exploreOpen, setExploreOpen] = useState(false);
    const [mentorOpen, setMentorOpen] = useState(false);
    const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
    const [tab, setTab] = useState<"ot" | "nt">("ot");
    const [books, setBooks] = useState<Book[]>([]);
    const [activeBook, setActiveBook] = useState<string | null>(null);
    const [chapters, setChapters] = useState<number[]>([]);
    const [chapterLabel, setChapterLabel] = useState("");
    const [verses, setVerses] = useState<Verse[]>([]);

    const activeScene = useMemo(() => {
        const index = new Date().getDay() % SANCTUARY_SCENES.length;
        return SANCTUARY_SCENES[index];
    }, []);

    const activeBookLabel = useMemo(
        () => books.find((book) => book.code === activeBook)?.label ?? null,
        [activeBook, books]
    );

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);

            try {
                const booksPayload = await fetchJsonWithTimeout(`/api/versehub/${lang}/books`);
                if (cancelled) return;

                const nextBooks = Array.isArray(booksPayload?.books) ? booksPayload.books : [];
                setBooks(nextBooks);

                if (mode === "chapter" && initialChapterRef) {
                    const chapterPayload = (await fetchJsonWithTimeout(
                        `/api/versehub/${lang}/chapter/${initialChapterRef}`
                    )) as ChapterPayload;

                    if (cancelled) return;

                    const nextBook = chapterPayload.selected_book ?? initialChapterRef.split("-")[0] ?? null;
                    const nextVerses = Array.isArray(chapterPayload.verses) ? chapterPayload.verses : [];
                    const nextChapters = Array.isArray(chapterPayload.chapters) ? chapterPayload.chapters : [];
                    const nextLabel = chapterPayload.chapter_label ?? initialChapterRef;

                    setActiveBook(nextBook);
                    setChapters(nextChapters);
                    setVerses(nextVerses);
                    setChapterLabel(nextLabel);
                    setSelectedVerse(nextVerses[0] ?? null);

                    const matchedBook = nextBooks.find((book: Book) => book.code === nextBook);
                    setTab(matchedBook?.testament === "nt" ? "nt" : "ot");
                } else {
                    setChapterLabel("VerseHub");
                    setVerses([]);
                    setChapters([]);
                    setSelectedVerse(null);
                }
            } catch {
                if (!cancelled) {
                    setError(mode === "chapter" ? "chapter_not_found" : "books_unavailable");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [initialChapterRef, lang, mode]);

    const loadBookChapters = async (bookCode: string) => {
        setActiveBook(bookCode);
        try {
            const payload = await fetchJsonWithTimeout(`/api/versehub/${lang}/chapters?book=${encodeURIComponent(bookCode)}`);
            setChapters(Array.isArray(payload?.chapters) ? payload.chapters : []);
        } catch {
            setChapters([]);
        }
    };

    const openMentorForVerse = (verse: Verse | null) => {
        if (!verse) return;
        setSelectedVerse(verse);
        setExploreOpen(false);
        setMentorOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F6F2EA] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
                    <p className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">Menyiapkan Ruang Doa...</p>
                </div>
            </div>
        );
    }

    if (error && mode === "chapter") {
        return (
            <div className="min-h-screen bg-[#F6F2EA] px-6 py-16 text-center text-slate-900">
                <div className="mx-auto max-w-md rounded-[32px] bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.1)] ring-1 ring-black/5 backdrop-blur-xl">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Pasal tidak ditemukan</p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-500">
                        Data pasal belum berhasil dimuat. Kembali ke landing VerseHub untuk memilih kitab lain.
                    </p>
                    <button
                        type="button"
                        onClick={() => router.push(`/versehub/${lang}`)}
                        className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
                    >
                        Kembali ke VerseHub
                    </button>
                </div>
            </div>
        );
    }

    const firstBookCode = books[0]?.code ?? null;
    const firstBookLabel = books[0]?.label ?? "kitab pertama";
    const firstChapterHref = firstBookCode ? `/versehub/${lang}/${firstBookCode}-1` : null;
    const mentorPreviewVerse = selectedVerse ?? verses[0] ?? null;
    const mentorPreviewLabel = mode === "chapter" && mentorPreviewVerse
        ? `${chapterLabel}:${mentorPreviewVerse.verse}`
        : null;

    return (
        <div className={cn("relative text-slate-900", mode === "landing" ? "h-screen overflow-hidden bg-[#F7F4EC]" : "min-h-screen bg-[#F7F4EC] pb-28")}>
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff_0%,#f6f1e8_38%,#f4efe6_64%,#f7f4ec_100%)]" />
                <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#efe7d4]/50 blur-3xl" />
                <div className="absolute right-[-120px] top-16 h-80 w-80 rounded-full bg-[#f1efe9]/70 blur-3xl" />
                <div className="absolute bottom-[-120px] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-white/60 blur-3xl" />
            </div>

            {mode === "landing" ? (
                <>
                    <header className="absolute inset-x-0 top-0 z-40">
                        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 pt-5 md:px-6">
                            <button
                                type="button"
                                onClick={() => router.push("/today")}
                                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-slate-500 shadow-[0_12px_30px_rgba(15,23,42,0.08)] ring-1 ring-black/5 backdrop-blur-xl transition hover:bg-white"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setExploreOpen(false);
                                    setPickerOpen(true);
                                }}
                                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-slate-500 shadow-[0_12px_30px_rgba(15,23,42,0.08)] ring-1 ring-black/5 backdrop-blur-xl transition hover:bg-white"
                            >
                                <BookOpenText className="h-5 w-5" />
                            </button>
                        </div>
                    </header>

                    <main className="relative z-10 flex h-full flex-col justify-center px-6 pb-[calc(160px+env(safe-area-inset-bottom))] pt-20 text-center md:px-10">
                        <div className="mx-auto max-w-3xl">
                            <p className="text-[11px] font-black uppercase tracking-[0.44em] text-[#91A0C7]">{activeScene.eyebrow}</p>
                            <motion.h1
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="mx-auto mt-10 max-w-[12ch] font-serif text-[50px] italic leading-[1.08] tracking-[-0.04em] text-[#172042] sm:text-[64px] md:text-[78px]"
                            >
                                {activeScene.quote}
                            </motion.h1>
                            <p className="mx-auto mt-7 max-w-xl text-[15px] leading-7 text-slate-600 md:text-base">
                                {activeScene.invitation}
                            </p>
                        </div>
                    </main>

                    <div className="absolute inset-x-0 bottom-[calc(96px+env(safe-area-inset-bottom))] z-40 px-4 md:px-6">
                        <div className="mx-auto flex max-w-xl flex-col gap-3">
                            <button
                                type="button"
                                onClick={() => setExploreOpen(true)}
                                className="group mx-auto inline-flex min-h-[72px] w-full max-w-[360px] items-center justify-between rounded-full bg-white/86 px-5 py-4 text-left shadow-[0_18px_40px_rgba(15,23,42,0.1)] ring-1 ring-black/5 backdrop-blur-2xl transition hover:bg-white"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-500 ring-1 ring-black/5">
                                        <Sparkles className="h-4 w-4" />
                                    </span>
                                    <span>
                                        <span className="block text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Explore</span>
                                        <span className="mt-1 block text-[15px] font-black tracking-tight text-slate-900">
                                            Waktunya Selidiki Firman Lebih Dalam
                                        </span>
                                    </span>
                                </span>
                                <ArrowRight className="h-5 w-5 text-[#2A67FF] transition group-hover:translate-x-0.5" />
                            </button>

                            <div className="mx-auto grid w-full max-w-[420px] grid-cols-3 gap-2 rounded-[30px] bg-white/78 p-2 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ring-1 ring-black/5 backdrop-blur-2xl">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setExploreOpen(false);
                                        setPickerOpen(true);
                                    }}
                                    className="rounded-[22px] px-3 py-3 text-center transition hover:bg-slate-50"
                                >
                                    <BookOpenText className="mx-auto h-4 w-4 text-slate-500" />
                                    <span className="mt-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Kitab</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setExploreOpen(true)}
                                    className="rounded-[22px] px-3 py-3 text-center transition hover:bg-slate-50"
                                >
                                    <BookHeart className="mx-auto h-4 w-4 text-slate-500" />
                                    <span className="mt-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Deep Dive</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setExploreOpen(false);
                                        if (firstChapterHref) router.push(firstChapterHref);
                                    }}
                                    className="rounded-[22px] px-3 py-3 text-center transition hover:bg-slate-50"
                                >
                                    <MessageSquareText className="mx-auto h-4 w-4 text-slate-500" />
                                    <span className="mt-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Mulai</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <header className="sticky top-0 z-40 border-b border-black/5 bg-[#F7F4EC]/88 backdrop-blur-2xl">
                        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 md:px-6">
                            <button
                                type="button"
                                onClick={() => router.push(`/versehub/${lang}`)}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm ring-1 ring-black/5 transition hover:bg-white"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>

                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#91A0C7]">VerseHub</p>
                                <h1 className="mt-1 text-sm font-black tracking-tight text-slate-900">{chapterLabel}</h1>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setExploreOpen(false);
                                    setPickerOpen(true);
                                }}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm ring-1 ring-black/5 transition hover:bg-white"
                            >
                                <BookOpenText className="h-5 w-5" />
                            </button>
                        </div>
                    </header>

                    <main className="relative z-10 mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">
                        <section className="overflow-hidden rounded-[34px] bg-white/84 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.04] backdrop-blur-2xl md:p-7">
                            <div className="flex flex-col gap-5 border-b border-slate-100 pb-5 md:flex-row md:items-end md:justify-between">
                                <div className="max-w-2xl">
                                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#91A0C7]">Reader Engine</p>
                                    <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{chapterLabel}</h2>
                                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                        Reader mode dibuat lebih utilitarian, tetapi tetap satu pengalaman dengan sanctuary VerseHub. Tekan ayat untuk membuka mentor internal.
                                    </p>
                                </div>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={() => setExploreOpen(true)}
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-600 ring-1 ring-black/5 transition hover:bg-slate-100"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        Explore
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => openMentorForVerse(mentorPreviewVerse)}
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-slate-800"
                                    >
                                        <MessageSquareText className="h-4 w-4" />
                                        Buka Mentor
                                    </button>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3 md:grid-cols-[1.25fr,0.75fr]">
                                <div className="rounded-[28px] bg-[#FBFAF6] p-4 ring-1 ring-black/[0.04]">
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Bacaan</p>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        {verses.length} ayat siap dibaca. Tap salah satu ayat untuk membuka scripture guide internal berbasis Laravel.
                                    </p>
                                </div>
                                <div className="rounded-[28px] bg-[#FBFAF6] p-4 ring-1 ring-black/[0.04]">
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Companion</p>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        Ambience Lagusion tetap aktif di reader. Pilih vocal atau instrumental langsung dari floating audio companion.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-4">
                                {verses.map((verse) => (
                                    <button
                                        key={verse.key}
                                        type="button"
                                        onClick={() => openMentorForVerse(verse)}
                                        className="group block w-full rounded-[28px] bg-[#F9F7F2] px-4 py-4 text-left ring-1 ring-black/[0.03] transition hover:bg-white hover:shadow-[0_14px_40px_rgba(15,23,42,0.06)] md:px-5"
                                    >
                                        <div className="flex items-start gap-4">
                                            <span className="mt-1 inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-white px-2 text-[12px] font-black text-slate-500 shadow-sm ring-1 ring-black/[0.04]">
                                                {verse.verse}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-[17px] leading-8 text-slate-700 md:text-[18px]">{verse.text}</p>
                                                <span className="mt-3 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 transition group-hover:text-[#2A67FF]">
                                                    <MessageSquareText className="h-3.5 w-3.5" />
                                                    Buka mentor untuk ayat ini
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </main>
                </>
            )}

            <AnimatePresence>
                {exploreOpen && (
                    <div className="fixed inset-0 z-[60]">
                        <motion.button
                            type="button"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setExploreOpen(false)}
                            className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            transition={{ type: "spring", stiffness: 240, damping: 28 }}
                            className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-3xl rounded-t-[36px] bg-white/96 p-6 shadow-[0_-30px_80px_rgba(15,23,42,0.18)] ring-1 ring-black/5 backdrop-blur-2xl md:left-1/2 md:max-w-2xl md:-translate-x-1/2"
                        >
                            <div className="mx-auto mb-5 h-1.5 w-14 rounded-full bg-slate-200" />
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#91A0C7]">Deep Dive</p>
                                    <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Masuk ke firman tanpa kehilangan rasa heningnya.</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setExploreOpen(false)}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <p className="mt-4 text-sm leading-7 text-slate-600">{activeScene.reflection}</p>

                            <div className="mt-6 grid gap-3 md:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setExploreOpen(false);
                                        setPickerOpen(true);
                                    }}
                                    className="rounded-[26px] bg-[#FBFAF6] p-4 text-left ring-1 ring-black/[0.04] transition hover:bg-slate-50"
                                >
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Koleksi Kitab</p>
                                    <p className="mt-2 text-lg font-black tracking-tight text-slate-900">Buka Perjanjian Lama dan Baru</p>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        Masuk ke daftar kitab, lalu pilih pasal yang ingin Anda baca dengan flow yang lebih tenang.
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    disabled={!firstChapterHref}
                                    onClick={() => {
                                        if (!firstChapterHref) return;
                                        setExploreOpen(false);
                                        router.push(firstChapterHref);
                                    }}
                                    className="rounded-[26px] bg-[#FBFAF6] p-4 text-left ring-1 ring-black/[0.04] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Jalur Cepat</p>
                                    <p className="mt-2 text-lg font-black tracking-tight text-slate-900">Mulai dari {firstBookLabel} 1</p>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        Cocok untuk langsung masuk ke reader utilitarian tanpa kehilangan transisi dari landing.
                                    </p>
                                </button>

                                <div className="rounded-[26px] bg-[#FBFAF6] p-4 text-left ring-1 ring-black/[0.04]">
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Lagusion Companion</p>
                                    <p className="mt-2 text-lg font-black tracking-tight text-slate-900">Vocal dan audio-only tetap tersedia</p>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        Floating audio companion akan menemani bacaan Anda dengan pilihan vocal, piano, acoustic, atau instrumental.
                                    </p>
                                </div>

                                <div className="rounded-[26px] bg-[#FBFAF6] p-4 text-left ring-1 ring-black/[0.04]">
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Mentor Internal</p>
                                    <p className="mt-2 text-lg font-black tracking-tight text-slate-900">Scripture guide aktif saat ayat dibuka</p>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        Mentor tidak memakai AI gateway. Ia menarik refleksi, kaitan ayat, konteks, dan study guidance dari engine Laravel internal.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#91A0C7]">VerseHub</p>
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
                                {(["ot", "nt"] as const).map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => setTab(item)}
                                        className={cn(
                                            "rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] transition",
                                            tab === item ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                        )}
                                    >
                                        {item === "ot" ? "Perjanjian Lama" : "Perjanjian Baru"}
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
                                                    "rounded-[22px] px-4 py-4 text-left text-sm font-bold transition ring-1",
                                                    activeBook === book.code
                                                        ? "bg-slate-900 text-white ring-slate-900"
                                                        : "bg-slate-50 text-slate-700 ring-slate-100 hover:bg-slate-100"
                                                )}
                                            >
                                                {book.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="min-h-0 overflow-y-auto p-5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                                        {activeBookLabel ? `Pilih Pasal ${activeBookLabel}` : "Pilih Pasal"}
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {chapters.map((chapter) => (
                                            <button
                                                key={chapter}
                                                type="button"
                                                onClick={() => {
                                                    if (!activeBook) return;
                                                    setPickerOpen(false);
                                                    setExploreOpen(false);
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

            {mentorOpen && mentorPreviewVerse && mentorPreviewLabel && (
                <MentorPanel
                    verseRef={mentorPreviewVerse.key}
                    lang={lang}
                    verseText={mentorPreviewVerse.text}
                    verseLabel={mentorPreviewLabel}
                    isAuthenticated={true}
                    onClose={() => setMentorOpen(false)}
                />
            )}

            <AmbienceController
                className={cn(
                    "z-[70]",
                    mode === "landing"
                        ? "bottom-[calc(98px+env(safe-area-inset-bottom))] right-4 md:bottom-8 md:right-8"
                        : "bottom-[calc(88px+env(safe-area-inset-bottom))] right-4 md:bottom-8 md:right-8"
                )}
                isDucking={exploreOpen || pickerOpen || mentorOpen}
                activeMoodKey={mode === "landing" ? "hopeful" : "daily"}
                dayIndex={new Date().getDay()}
                onMenuOpen={(isOpen) => {
                    if (isOpen) {
                        setExploreOpen(false);
                    }
                }}
            />

            {error && mode === "landing" && (
                <div className="pointer-events-none absolute left-1/2 top-24 z-40 -translate-x-1/2 px-4">
                    <div className="rounded-full bg-white/85 px-4 py-2 text-[11px] font-bold text-slate-500 shadow-sm ring-1 ring-black/5 backdrop-blur-xl">
                        Koneksi kitab sedang tidak stabil, tetapi sanctuary VerseHub tetap siap dipakai.
                    </div>
                </div>
            )}

            {mode === "landing" && (
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-24 bg-gradient-to-t from-[#F7F4EC] to-transparent" />
            )}
        </div>
    );
}
