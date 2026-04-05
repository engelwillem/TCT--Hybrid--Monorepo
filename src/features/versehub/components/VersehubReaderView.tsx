"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpenText, ChevronLeft, MessageSquareText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChapterReflectionBreak } from "@/features/versehub/components/ChapterReflectionBreak";
import { VersehubCompletionRitual } from "@/features/versehub/components/VersehubCompletionRitual";
import type { Verse } from "@/features/versehub/types";

interface VersehubReaderViewProps {
    chapterLabel: string;
    sanctuaryTitle: string;
    memberName: string | null;
    liveDateLabel: string;
    verses: Verse[];
    shouldShowChrome: boolean;
    readerContentPadding: string;
    activeMood: string;
    chapterReflectionQuestion: string;
    chapterCompletionReflection: string;
    chapterCompletionSaved: boolean;
    isSavingChapterReflection: boolean;
    isSharingInsight: boolean;
    reflectionError: string | null;
    shareInsightError: string | null;
    hasReachedChapterEnd: boolean;
    scrollViewportRef: React.MutableRefObject<HTMLElement | null>;
    reflectionDrafts: Record<string, string>;
    completedReflections: Record<string, boolean>;
    onBack: () => void;
    onOpenPicker: () => void;
    onOpenExplore: () => void;
    onOpenReflectionsJournal: () => void;
    onOpenVerseMentor: (verse: Verse, userReflection?: string | null) => void;
    onReflectionChange: (key: string, value: string) => void;
    onReflectionComplete: (key: string) => void;
    onCompletionReflectionChange: (value: string) => void;
    onSaveChapterReflection: () => void;
    onShareInsight: () => void;
    onReachedChapterEnd: () => void;
}

const REFLECTION_BREAK_INTERVAL = 10;

const shouldShowMentorNudge = (verse: Verse) => verse.verse === 1 || verse.verse % 5 === 0;

export function VersehubReaderView({
    chapterLabel,
    sanctuaryTitle,
    memberName,
    liveDateLabel,
    verses,
    shouldShowChrome,
    readerContentPadding,
    activeMood,
    chapterReflectionQuestion,
    chapterCompletionReflection,
    chapterCompletionSaved,
    isSavingChapterReflection,
    isSharingInsight,
    reflectionError,
    shareInsightError,
    hasReachedChapterEnd,
    scrollViewportRef,
    reflectionDrafts,
    completedReflections,
    onBack,
    onOpenPicker,
    onOpenExplore,
    onOpenReflectionsJournal,
    onOpenVerseMentor,
    onReflectionChange,
    onReflectionComplete,
    onCompletionReflectionChange,
    onSaveChapterReflection,
    onShareInsight,
    onReachedChapterEnd,
}: VersehubReaderViewProps) {
    const completionSentinelRef = React.useRef<HTMLDivElement | null>(null);

    const reflectionBreaks = React.useMemo(
        () => verses.filter((verse) => verse.verse % REFLECTION_BREAK_INTERVAL === 0 || verse.verse === verses.length),
        [verses]
    );

    const resolveReflectionContext = React.useCallback((verseNumber: number) => {
        const eligibleBreak = reflectionBreaks
            .filter((candidate) => candidate.verse <= verseNumber)
            .sort((left, right) => right.verse - left.verse)[0];

        if (!eligibleBreak) return null;

        const key = `reflection-${eligibleBreak.key}`;
        if (!completedReflections[key]) return null;

        return reflectionDrafts[key]?.trim() || null;
    }, [completedReflections, reflectionBreaks, reflectionDrafts]);

    React.useEffect(() => {
        const rootNode = scrollViewportRef.current;
        const sentinelNode = completionSentinelRef.current;
        if (!rootNode || !sentinelNode) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    onReachedChapterEnd();
                }
            },
            {
                root: rootNode,
                threshold: 0.7,
            }
        );

        observer.observe(sentinelNode);
        return () => observer.disconnect();
    }, [onReachedChapterEnd, scrollViewportRef, verses.length]);

    return (
        <>
            <motion.header
                initial={false}
                animate={shouldShowChrome ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                    "relative z-40 border-b border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(247,243,234,0.72))] backdrop-blur-2xl",
                    !shouldShowChrome && "pointer-events-none"
                )}
            >
                <div className="mx-auto flex max-w-4xl items-start justify-between gap-4 px-6 py-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/82 text-sky-600 ring-1 ring-black/5 shadow-[0_18px_36px_-26px_rgba(15,23,42,0.28)] backdrop-blur-xl transition hover:bg-white active:scale-95"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="ml-auto flex max-w-[24rem] flex-col text-right">
                        <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40">
                            {liveDateLabel}
                        </span>
                        <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#91A0C7]">
                            EKSPLORASI FIRMAN HARI INI
                        </p>
                        <h1 className="mt-2 text-[22px] font-semibold leading-[1.22] tracking-[-0.01em] text-foreground/95 md:text-[25px]">
                            {memberName ? `${memberName}, ${sanctuaryTitle}` : sanctuaryTitle}
                        </h1>
                    </div>
                </div>
            </motion.header>

            <main ref={(node) => { scrollViewportRef.current = node; }} className="relative z-10 flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8">
                <div className="mx-auto max-w-4xl pb-[calc(180px+env(safe-area-inset-bottom,24px))]">
                    <section className="overflow-hidden rounded-[34px] bg-white/84 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.04] backdrop-blur-2xl md:p-7">
                        <div className="flex flex-col gap-5 border-b border-slate-100 pb-5 md:flex-row md:items-end md:justify-between">
                            <div className="max-w-2xl">
                                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#91A0C7]">Reader Engine</p>
                                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{chapterLabel}</h2>
                                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                    Reader mode kini menyelipkan ritme refleksi di tengah bacaan supaya perjalanan pasal terasa lebih seperti sanctuary, bukan sekadar scroll teks.
                                </p>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={onOpenExplore}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-slate-800"
                                >
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Explore
                                </button>
                                <button
                                    type="button"
                                    onClick={onOpenPicker}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-600 transition hover:bg-slate-200"
                                >
                                    <BookOpenText className="h-3.5 w-3.5" />
                                    Ganti Pasal
                                </button>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 md:grid-cols-[1.25fr,0.75fr]">
                            <div className="rounded-[28px] bg-[#FBFAF6] p-4 ring-1 ring-black/[0.04]">
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Bacaan</p>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    {verses.length} ayat siap dibaca. VerseHub akan menyisipkan ruang hening di momen-momen penting sepanjang pasal.
                                </p>
                            </div>
                            <div className="rounded-[28px] bg-[#FBFAF6] p-4 ring-1 ring-black/[0.04]">
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Mood Aktif</p>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    Sanctuary menyesuaikan suasana baca dengan mood <span className="font-semibold text-slate-700">{activeMood}</span>.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4" style={{ paddingBottom: readerContentPadding }}>
                            {verses.map((verse) => {
                                const reflectionKey = `reflection-${verse.key}`;
                                const hasReflectionBreak = reflectionBreaks.some((item) => item.key === verse.key);
                                const userReflection = resolveReflectionContext(verse.verse);

                                return (
                                    <div key={verse.key} className="space-y-4">
                                        <button
                                            type="button"
                                            onClick={() => onOpenVerseMentor(verse, userReflection)}
                                            className="group block w-full rounded-[28px] bg-[#F9F7F2] px-4 py-4 text-left ring-1 ring-black/[0.03] transition hover:bg-white hover:shadow-[0_14px_40px_rgba(15,23,42,0.06)] md:px-5"
                                        >
                                            <div className="flex items-start gap-4">
                                                <span className="mt-1 inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-white px-2 text-[12px] font-black text-slate-500 shadow-sm ring-1 ring-black/[0.04]">
                                                    {verse.verse}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="text-[20px] leading-[1.85] text-slate-800/95 md:text-[23px]">{verse.text}</p>
                                                    <span className="mt-3 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 transition group-hover:text-[#2A67FF]">
                                                        <MessageSquareText className="h-3.5 w-3.5" />
                                                        Buka mentor untuk ayat ini
                                                    </span>
                                                </div>
                                            </div>
                                        </button>

                                        {shouldShowMentorNudge(verse) ? (
                                            <button
                                                type="button"
                                                onClick={() => onOpenVerseMentor(verse, userReflection)}
                                                className="flex w-full items-center gap-2 rounded-[24px] bg-white/75 px-4 py-3 text-left ring-1 ring-black/5 transition hover:bg-white"
                                            >
                                                <motion.span
                                                    animate={{ opacity: [0.55, 1, 0.55], scale: [0.96, 1.04, 0.96] }}
                                                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#eef7ff] text-sky-600"
                                                >
                                                    <Sparkles className="h-4 w-4" />
                                                </motion.span>
                                                <span className="text-[13px] leading-6 text-slate-600">
                                                    Mentor punya perspektif menarik tentang ayat ini. Mau tahu?
                                                </span>
                                            </button>
                                        ) : null}

                                        {hasReflectionBreak ? (
                                            <ChapterReflectionBreak
                                                verseNumber={verse.verse}
                                                promptText={chapterReflectionQuestion}
                                                value={reflectionDrafts[reflectionKey] ?? ""}
                                                isDone={Boolean(completedReflections[reflectionKey])}
                                                onChange={(value) => onReflectionChange(reflectionKey, value)}
                                                onComplete={() => onReflectionComplete(reflectionKey)}
                                            />
                                        ) : null}
                                    </div>
                                );
                            })}

                            <div ref={completionSentinelRef} className="h-6 w-full" aria-hidden="true" />

                            {hasReachedChapterEnd ? (
                                <VersehubCompletionRitual
                                    chapterLabel={chapterLabel}
                                    promptText={chapterReflectionQuestion}
                                    reflectionValue={chapterCompletionReflection}
                                    onReflectionChange={onCompletionReflectionChange}
                                    onSaveReflection={onSaveChapterReflection}
                                    onShareInsight={onShareInsight}
                                    onOpenJournal={onOpenReflectionsJournal}
                                    isReflectionSaved={chapterCompletionSaved}
                                    isSavingReflection={isSavingChapterReflection}
                                    isSharingInsight={isSharingInsight}
                                    reflectionError={reflectionError}
                                    shareError={shareInsightError}
                                />
                            ) : null}
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
