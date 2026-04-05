"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookHeart, BookOpenText, ChevronLeft, MessageSquareText, Sparkles } from "lucide-react";
import { MOOD_QUICK_STARTS } from "@/features/versehub/constants";
import { MoodQuickStart } from "@/features/versehub/components/MoodQuickStart";
import type { SanctuaryScene } from "@/features/versehub/types";

interface VersehubLandingViewProps {
    activeScene: SanctuaryScene;
    landingContentPadding: string;
    firstChapterHref: string | null;
    firstBookLabel: string;
    continueReadingHref: string | null;
    continueReadingLabel: string | null;
    onContinueReading: () => void;
    onBackToday: () => void;
    onOpenPicker: () => void;
    onOpenExplore: () => void;
    onQuickStartMood: (moodKey: string) => void;
    onStartFirstChapter: () => void;
    liveDateLabel: string;
    memberName: string | null;
    activeMood: string;
}

export function VersehubLandingView({
    activeScene,
    landingContentPadding,
    firstChapterHref,
    firstBookLabel,
    continueReadingHref,
    continueReadingLabel,
    onContinueReading,
    onBackToday,
    onOpenPicker,
    onOpenExplore,
    onQuickStartMood,
    onStartFirstChapter,
    liveDateLabel,
    memberName,
    activeMood,
}: VersehubLandingViewProps) {
    return (
        <>
            <motion.header
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top,0px)]"
            >
                <div className="mx-auto flex max-w-4xl items-start justify-between gap-4 px-6 pt-5 md:px-6">
                    <button
                        type="button"
                        onClick={onBackToday}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--vh-surface)]/60 text-[var(--vh-accent)] ring-1 ring-[var(--vh-border)] shadow-[0_18px_36px_-26px_rgba(0,0,0,0.5)] backdrop-blur-xl transition hover:bg-[var(--vh-surface)]/80 active:scale-95"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="ml-auto flex max-w-[24rem] flex-col text-right">
                        <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--vh-text-muted)]">
                            {liveDateLabel}
                        </span>
                        <h1 className="text-[22px] font-semibold leading-[1.22] tracking-[-0.01em] text-[var(--vh-text-primary)] md:text-[25px]">
                            Selamat datang kembali,
                        </h1>
                        {memberName ? (
                            <p className="mt-1 text-[16px] font-semibold leading-[1.35] tracking-[-0.01em] text-[var(--vh-text-secondary)] md:text-[18px]">
                                {memberName}
                            </p>
                        ) : (
                            <p className="mt-1 text-[13px] font-medium leading-[1.45] tracking-[0.01em] text-[var(--vh-text-muted)] md:text-[14px]">
                                Chosen People
                            </p>
                        )}
                    </div>
                </div>
            </motion.header>

            <main className="relative z-10 flex flex-1 flex-col justify-center px-6 pt-20 text-center md:px-10" style={{ paddingBottom: landingContentPadding }}>
                <div className="mx-auto max-w-3xl">
                    <p className="text-[11px] font-black uppercase tracking-[0.44em] text-[var(--vh-text-muted)]">{activeScene.eyebrow}</p>
                    <motion.h1
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="mx-auto mt-10 max-w-[12ch] font-serif text-[50px] italic leading-[1.08] tracking-[-0.04em] text-white sm:text-[64px] md:text-[78px]"
                        style={{ textShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
                    >
                        {activeScene.quote}
                    </motion.h1>
                    <p className="mx-auto mt-7 max-w-xl text-[15px] leading-7 text-[var(--vh-text-secondary)] md:text-base">
                        {activeScene.invitation}
                    </p>

                    <MoodQuickStart
                        options={MOOD_QUICK_STARTS}
                        activeMood={activeMood}
                        onSelect={onQuickStartMood}
                    />
                </div>
            </main>

            <div className="absolute inset-x-0 z-40 px-4 md:px-6" style={{ bottom: "calc(96px + env(safe-area-inset-bottom, 24px))" }}>
                <div className="mx-auto flex max-w-xl flex-col gap-3">
                    {continueReadingHref && continueReadingLabel ? (
                        <button
                            type="button"
                            onClick={onContinueReading}
                            className="group mx-auto inline-flex min-h-[64px] w-full max-w-[360px] items-center justify-between rounded-full bg-[var(--vh-surface)]/60 px-5 py-4 text-left shadow-[0_18px_40px_rgba(0,0,0,0.3)] ring-1 ring-[var(--vh-border)] backdrop-blur-2xl transition hover:bg-[var(--vh-surface)]/80 active:scale-[0.98]"
                        >
                            <span>
                                <span className="block text-[10px] font-black uppercase tracking-[0.24em] text-[var(--vh-text-muted)]">Continue Reading</span>
                                <span className="mt-1 block text-[14px] font-black tracking-tight text-[var(--vh-text-primary)]">{continueReadingLabel}</span>
                            </span>
                            <ArrowRight className="h-5 w-5 text-[var(--vh-accent)]" />
                        </button>
                    ) : null}

                    <button
                        type="button"
                        onClick={onOpenExplore}
                        className="group mx-auto inline-flex min-h-[72px] w-full max-w-[360px] items-center justify-between rounded-full bg-[var(--vh-surface)]/80 px-5 py-4 text-left shadow-[0_18px_40px_rgba(0,0,0,0.3)] ring-1 ring-[var(--vh-border)] backdrop-blur-2xl transition hover:bg-[var(--vh-surface)] active:scale-[0.98]"
                    >
                        <span className="flex items-center gap-3">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-[var(--vh-text-secondary)] ring-1 ring-[var(--vh-border)]">
                                <Sparkles className="h-4 w-4 text-[var(--vh-accent)]/80 group-hover:text-[var(--vh-accent)] transition-colors" />
                            </span>
                            <span>
                                <span className="block text-[10px] font-black uppercase tracking-[0.24em] text-[var(--vh-text-muted)]">Pilihan Harian</span>
                                <span className="mt-1 block text-[15px] font-black tracking-tight text-[var(--vh-text-primary)]">
                                    Saran Bacaan Hari Ini
                                </span>
                            </span>
                        </span>
                        <ArrowRight className="h-5 w-5 text-[var(--vh-accent)] transition group-hover:translate-x-0.5" />
                    </button>

                    <button
                        type="button"
                        onClick={onOpenPicker}
                        className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-semibold text-[var(--vh-text-muted)] transition hover:bg-white/5 hover:text-[var(--vh-text-primary)]"
                    >
                        <BookOpenText className="h-4 w-4" />
                        Pilih dari daftar kitab
                    </button>

                    {firstChapterHref ? (
                        <p className="text-center text-[11px] text-[var(--vh-text-muted)] mt-2">
                            Jalur cepat tersedia dari <span className="font-semibold text-[var(--vh-text-secondary)]">{firstBookLabel} 1</span>
                        </p>
                    ) : null}
                </div>
            </div>
        </>
    );
}
