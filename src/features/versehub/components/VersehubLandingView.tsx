"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookHeart, BookOpenText, ChevronLeft, Compass, Sparkles } from "lucide-react";
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
                <div className="mx-auto flex max-w-5xl items-start justify-between gap-4 px-6 pt-5 md:px-8">
                    <button
                        type="button"
                        onClick={onBackToday}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[var(--vh-surface)]/68 text-[var(--vh-accent)] shadow-[0_18px_36px_-26px_rgba(0,0,0,0.5)] backdrop-blur-xl transition hover:bg-[var(--vh-surface)]/86 active:scale-95"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="ml-auto rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-4 py-3 text-right shadow-[0_24px_60px_-40px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
                        <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-[var(--vh-text-muted)]">
                            {liveDateLabel}
                        </span>
                        <h1 className="mt-2 text-[18px] font-semibold leading-tight tracking-[-0.02em] text-[var(--vh-text-primary)] md:text-[20px]">
                            {memberName ? `${memberName}, selamat datang kembali` : "Selamat datang kembali"}
                        </h1>
                        <p className="mt-1 text-[12px] font-medium text-[var(--vh-text-secondary)]">
                            Ruang baca yang tenang untuk melanjutkan ritme firman.
                        </p>
                    </div>
                </div>
            </motion.header>

            <main className="relative z-10 flex flex-1 flex-col overflow-y-auto px-6 md:px-8" style={{ paddingBottom: landingContentPadding }}>
                <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center py-24 md:py-32">
                    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                        <motion.section
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="overflow-hidden rounded-[38px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,14,20,0.82),rgba(16,19,26,0.74))] p-6 shadow-[0_36px_120px_-56px_rgba(0,0,0,0.72)] backdrop-blur-3xl md:p-8"
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[10px] font-black uppercase tracking-[0.26em] text-[var(--vh-text-muted)]">
                                    {activeScene.eyebrow}
                                </span>
                                <span className="inline-flex rounded-full border border-[var(--vh-accent)]/18 bg-[var(--vh-accent)]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[var(--vh-accent)]">
                                    Ritual baca harian
                                </span>
                            </div>

                            <motion.h1
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.68, ease: "easeOut", delay: 0.08 }}
                                className="mt-6 max-w-[11ch] font-serif text-[46px] italic leading-[1.02] tracking-[-0.045em] text-[var(--vh-text-primary)] sm:text-[60px] md:text-[72px]"
                                style={{
                                    textShadow: "0 12px 34px rgba(15, 23, 42, 0.18)",
                                }}
                            >
                                {activeScene.quote}
                            </motion.h1>

                            <p className="mt-6 max-w-2xl text-[15px] leading-7 text-[var(--vh-text-secondary)] md:text-base">
                                {activeScene.invitation}
                            </p>

                            <div className="mt-6 grid gap-3 md:grid-cols-2">
                                <div className="rounded-[26px] border border-white/8 bg-white/[0.045] p-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--vh-text-muted)]">
                                        Mengapa VerseHub
                                    </p>
                                    <p className="mt-2 text-sm leading-relaxed text-[var(--vh-text-secondary)]">
                                        {activeScene.reflection}
                                    </p>
                                </div>
                                <div className="rounded-[26px] border border-white/8 bg-white/[0.045] p-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--vh-text-muted)]">
                                        Cara masuk
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <span className="inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-2 text-[11px] font-semibold text-[var(--vh-text-secondary)]">
                                            <Sparkles className="h-3.5 w-3.5 text-[var(--vh-accent)]" />
                                            Mood harian
                                        </span>
                                        <span className="inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-2 text-[11px] font-semibold text-[var(--vh-text-secondary)]">
                                            <BookOpenText className="h-3.5 w-3.5 text-[var(--vh-accent)]" />
                                            Kitab & pasal
                                        </span>
                                        <span className="inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-2 text-[11px] font-semibold text-[var(--vh-text-secondary)]">
                                            <BookHeart className="h-3.5 w-3.5 text-[var(--vh-accent)]" />
                                            Mentor & refleksi
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        <motion.aside
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.62, ease: "easeOut", delay: 0.12 }}
                            className="grid gap-4"
                        >
                            <div className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_30px_80px_-52px_rgba(0,0,0,0.7)] backdrop-blur-3xl">
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--vh-text-muted)]">
                                    Mulai dengan ritme yang ringan
                                </p>
                                <h2 className="mt-3 text-[26px] font-bold tracking-[-0.03em] text-[var(--vh-text-primary)]">
                                    Buka satu pasal.
                                    <br />
                                    Biarkan firman memimpin.
                                </h2>
                                <p className="mt-3 text-sm leading-relaxed text-[var(--vh-text-secondary)]">
                                    Cocok untuk kembali ke kebiasaan baca yang tenang tanpa harus memilih terlalu banyak dulu.
                                </p>
                                <button
                                    type="button"
                                    onClick={onStartFirstChapter}
                                    className="mt-5 inline-flex min-h-[52px] w-full items-center justify-between rounded-[22px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(234,243,255,0.94))] px-4 py-3 text-left text-slate-900 shadow-[0_20px_50px_-34px_rgba(37,99,235,0.5)] transition hover:translate-y-[-1px] active:scale-[0.99]"
                                >
                                    <span>
                                        <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                                            Mulai sekarang
                                        </span>
                                        <span className="mt-1 block text-[15px] font-black tracking-tight">
                                            {firstBookLabel} pasal 1
                                        </span>
                                    </span>
                                    <ArrowRight className="h-5 w-5 text-sky-600" />
                                </button>
                            </div>

                            <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,14,20,0.7),rgba(10,14,20,0.54))] p-5 shadow-[0_28px_80px_-58px_rgba(0,0,0,0.72)] backdrop-blur-3xl">
                                <div className="flex items-start gap-3">
                                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-white/8 bg-white/5 text-[var(--vh-accent)]">
                                        <Compass className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--vh-text-muted)]">
                                            Eksplorasi terarah
                                        </p>
                                        <p className="mt-2 text-sm leading-relaxed text-[var(--vh-text-secondary)]">
                                            Mulai dari perasaanmu hari ini, lalu biarkan VerseHub membuka jalur baca yang terasa pas.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.aside>
                    </div>

                    <div className="mx-auto mt-8 w-full max-w-3xl">
                        <div className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] px-5 py-5 shadow-[0_30px_90px_-62px_rgba(0,0,0,0.7)] backdrop-blur-3xl">
                            <div className="flex flex-col gap-3 text-center md:flex-row md:items-end md:justify-between md:text-left">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--vh-text-muted)]">
                                        Pilih pintu masuk
                                    </p>
                                    <h3 className="mt-2 text-[24px] font-bold tracking-[-0.03em] text-[var(--vh-text-primary)]">
                                        Masuk dengan mood atau langsung ke kitab.
                                    </h3>
                                </div>
                                <p className="max-w-md text-sm leading-relaxed text-[var(--vh-text-secondary)]">
                                    Kalau kamu belum tahu mau baca apa, gunakan mood harian. Kalau sudah tahu tujuanmu, langsung buka daftar kitab.
                                </p>
                            </div>

                            <MoodQuickStart
                                options={MOOD_QUICK_STARTS}
                                activeMood={activeMood}
                                onSelect={onQuickStartMood}
                            />
                        </div>
                    </div>
                </div>
            </main>

            <div className="absolute inset-x-0 z-40 px-4 md:px-6" style={{ bottom: "calc(96px + env(safe-area-inset-bottom, 24px))" }}>
                <div className="mx-auto flex max-w-[420px] flex-col gap-3">
                    {continueReadingHref && continueReadingLabel ? (
                        <button
                            type="button"
                            onClick={onContinueReading}
                            className="group mx-auto inline-flex min-h-[68px] w-full items-center justify-between rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.06))] px-5 py-4 text-left shadow-[0_22px_56px_-34px_rgba(0,0,0,0.62)] backdrop-blur-3xl transition hover:translate-y-[-1px] active:scale-[0.99]"
                        >
                            <span>
                                <span className="block text-[10px] font-black uppercase tracking-[0.24em] text-[var(--vh-text-muted)]">Lanjutkan Membaca</span>
                                <span className="mt-1 block text-[15px] font-black tracking-tight text-[var(--vh-text-primary)]">{continueReadingLabel}</span>
                            </span>
                            <ArrowRight className="h-5 w-5 text-[var(--vh-accent)] transition group-hover:translate-x-0.5" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onOpenExplore}
                            className="group mx-auto inline-flex min-h-[68px] w-full items-center justify-between rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.06))] px-5 py-4 text-left shadow-[0_22px_56px_-34px_rgba(0,0,0,0.62)] backdrop-blur-3xl transition hover:translate-y-[-1px] active:scale-[0.99]"
                        >
                            <span className="flex items-center gap-3">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[16px] border border-white/10 bg-white/8 text-[var(--vh-accent)]">
                                    <Sparkles className="h-4 w-4" />
                                </span>
                                <span>
                                    <span className="block text-[10px] font-black uppercase tracking-[0.24em] text-[var(--vh-text-muted)]">Mulai dari suasana hati</span>
                                    <span className="mt-1 block text-[15px] font-black tracking-tight text-[var(--vh-text-primary)]">Saran Bacaan Hari Ini</span>
                                </span>
                            </span>
                            <ArrowRight className="h-5 w-5 text-[var(--vh-accent)] transition group-hover:translate-x-0.5" />
                        </button>
                    )}

                    <div className="flex items-center justify-center gap-2 mt-1">
                        <button
                            type="button"
                            onClick={onOpenExplore}
                            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold text-[var(--vh-text-muted)] transition hover:bg-[var(--vh-surface)]/40 hover:text-[var(--vh-text-primary)]"
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            Mood Harian
                        </button>
                        <span className="h-1 w-1 rounded-full bg-white/10" />
                        <button
                            type="button"
                            onClick={onOpenPicker}
                            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold text-[var(--vh-text-muted)] transition hover:bg-[var(--vh-surface)]/40 hover:text-[var(--vh-text-primary)]"
                        >
                            <BookOpenText className="h-3.5 w-3.5" />
                            Daftar Kitab
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
