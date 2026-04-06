"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpenText, ChevronLeft } from "lucide-react";
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
    firstBookLabel,
    continueReadingHref,
    continueReadingLabel,
    onContinueReading,
    onBackToday,
    onOpenPicker,
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
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top,0px)]"
            >
                <div className="mx-auto flex w-full max-w-[620px] items-start justify-between gap-4 px-6 pt-5 pb-4">
                    <button
                        type="button"
                        onClick={onBackToday}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-transparent text-sky-600 ring-1 ring-sky-200/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.42)] backdrop-blur-[10px] transition-all duration-300 hover:bg-slate-900/12 hover:ring-slate-900/8 hover:shadow-[0_14px_34px_-24px_rgba(15,23,42,0.28)] active:scale-95"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="ml-auto flex max-w-[24rem] flex-col text-right">
                        <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40">
                            {liveDateLabel}
                        </span>
                        <h1 className="text-[22px] font-semibold leading-[1.22] tracking-[-0.01em] text-foreground/95 md:text-[25px]">
                            {memberName ? `${memberName}, selamat datang kembali` : "Selamat datang kembali"}
                        </h1>
                        <p className="mt-1 text-[13px] font-medium leading-[1.45] tracking-[0.01em] text-foreground/60 md:text-[14px]">
                            Chosen People
                        </p>
                    </div>
                </div>
            </motion.header>

            <main
                className="relative z-10 flex flex-1 flex-col overflow-y-auto"
                style={{ paddingBottom: landingContentPadding }}
            >
                <div className="relative z-10 mx-auto min-h-screen w-full max-w-[620px] pt-24">
                    <motion.section
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="px-6"
                    >
                        <div className="rounded-[34px] border border-white/70 bg-white/92 px-6 py-7 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.26)] backdrop-blur-xl">
                            <div className="flex items-center gap-3 text-[#0f172a]/55">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e7f4ff] text-[#0ea5e9]">
                                    <BookOpenText className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#0ea5e9]">
                                        VerseHub
                                    </p>
                                    <p className="mt-1 text-[13px] font-medium text-foreground/45">
                                        Baca firman dengan ritme yang tenang dan sederhana.
                                    </p>
                                </div>
                            </div>

                            <h2 className="mt-6 text-[34px] font-semibold leading-[1.14] tracking-[-0.03em] text-foreground/95 md:text-[40px]">
                                Buka satu pasal. Tinggal lebih lama di firman.
                            </h2>

                            <blockquote className="mt-5 tct-serif text-[25px] leading-[1.65] tracking-[-0.015em] text-foreground/92">
                                {activeScene.quote}
                            </blockquote>

                            <p className="mt-5 text-[15px] leading-7 text-foreground/70">
                                {activeScene.invitation}
                            </p>

                            <MoodQuickStart
                                options={MOOD_QUICK_STARTS}
                                activeMood={activeMood}
                                onSelect={onQuickStartMood}
                            />

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={onStartFirstChapter}
                                    className="group inline-flex items-center justify-between rounded-full bg-[#0f172a] px-6 py-4 text-[15px] font-semibold text-white shadow-[0_18px_36px_-18px_rgba(15,23,42,0.55)] transition-all duration-300 hover:-translate-y-[1px] hover:bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(14,165,233,0.78))] active:scale-[0.98]"
                                >
                                    <span>Mulai dari {firstBookLabel} pasal 1</span>
                                    <ArrowRight className="ml-3 h-4 w-4" />
                                </button>

                                <button
                                    type="button"
                                    onClick={onOpenPicker}
                                    className="inline-flex items-center justify-center rounded-full border border-white/80 bg-white/92 px-6 py-4 text-[15px] font-semibold text-[#0f172a] shadow-[0_22px_60px_-34px_rgba(15,23,42,0.32)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-[1px] hover:border-sky-300/45 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(239,246,255,0.84))] active:scale-[0.985]"
                                >
                                    Lihat daftar kitab
                                </button>
                            </div>

                            {continueReadingHref && continueReadingLabel ? (
                                <button
                                    type="button"
                                    onClick={onContinueReading}
                                    className="mt-4 inline-flex items-center gap-3 rounded-full bg-black/[0.04] px-5 py-3 text-[14px] font-medium text-foreground/75 transition-colors hover:bg-black/[0.06]"
                                >
                                    <span className="text-foreground/45">Lanjutkan:</span>
                                    <span className="font-semibold text-foreground/80">{continueReadingLabel}</span>
                                </button>
                            ) : null}

                            <p className="mt-6 text-[14px] leading-6 text-foreground/50">
                                {activeScene.reflection}
                            </p>
                        </div>
                    </motion.section>
                </div>
            </main>
        </>
    );
}
