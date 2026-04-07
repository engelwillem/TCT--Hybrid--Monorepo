"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { TCTLogo } from "@/components/brand/TCTLogo";
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
        <div className="relative flex flex-1 flex-col bg-transparent">
            <header className="sticky top-0 z-50 w-full border-b border-[#EEE4D5] bg-transparent pt-[env(safe-area-inset-top,16px)]">
                <div className="mx-auto flex w-full max-w-[620px] items-start gap-4 px-6 py-4 md:items-center">
                    <button
                        type="button"
                        onClick={onBackToday}
                        className="flex h-10 w-10 min-w-10 items-center justify-center rounded-full bg-white/78 text-[#5F5446] ring-1 ring-[#E8DDCC] transition-all hover:bg-white active:scale-95"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex flex-1 flex-col items-center pr-10 text-center md:pr-0">
                        <div className="flex items-center gap-2 opacity-[0.65] md:hidden">
                            <TCTLogo className="h-4 w-4 drop-shadow-sm" />
                            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#3A3227]">
                                The Chosen Talks
                            </p>
                        </div>
                        <p className="mt-8 text-[11px] font-bold uppercase leading-none tracking-[0.2em] text-[#8F836F] md:mt-0">
                            VerseHub
                        </p>
                    </div>
                </div>
            </header>

            <main
                className="relative z-10 flex flex-1 flex-col overflow-y-auto px-6"
                style={{ paddingBottom: landingContentPadding }}
            >
                <div className="mx-auto w-full max-w-[620px] pt-12">
                    <motion.section
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="pb-16 flex flex-col items-center text-center">
                            <blockquote className="font-serif text-[32px] font-medium leading-[1.2] tracking-tight text-[#3F4A6A] italic border-l-2 border-[#E7DDCC] pl-4 py-1 my-8 max-w-md md:text-[40px]">
                                {activeScene.quote}
                            </blockquote>

                            <MoodQuickStart
                                options={MOOD_QUICK_STARTS}
                                activeMood={activeMood}
                                onSelect={onQuickStartMood}
                            />

                            <div className="mt-10 flex w-full max-w-[340px] flex-col items-center gap-5">
                                <button
                                    type="button"
                                    onClick={onStartFirstChapter}
                                    className="group flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-[16px] text-[15px] font-bold text-[#2F261A] shadow-[0_18px_42px_-24px_rgba(47,38,26,0.35)] ring-1 ring-[#E9DFD0] transition-all hover:bg-[#FFFDFA] active:scale-95"
                                >
                                    <span>Mulai dari {firstBookLabel} 1</span>
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </button>

                                <button
                                    type="button"
                                    onClick={onOpenPicker}
                                    className="flex w-full items-center justify-center px-6 py-[2px] text-[14px] font-medium text-[#817462] transition-all hover:text-[#2F261A] active:scale-95"
                                >
                                    Eksplor Kitab Lain
                                </button>
                            </div>

                            {continueReadingHref && continueReadingLabel ? (
                                <div className="mt-7 w-full max-w-[340px]">
                                    <button
                                        type="button"
                                        onClick={onContinueReading}
                                        className="inline-flex w-full items-center justify-between rounded-full bg-[#F7F1E5] px-6 py-[16px] transition-all hover:bg-[#FBF6ED] ring-1 ring-[#E5D9C8] shadow-[0_14px_34px_-26px_rgba(47,38,26,0.24)]"
                                    >
                                        <div className="flex flex-col text-left">
                                            <span className="text-[10px] font-medium uppercase tracking-widest text-[#8A7B68]">Lanjutkan Terakhir</span>
                                            <span className="text-[14px] font-medium text-[#2F261A]">{continueReadingLabel}</span>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-[#8A7B68]" />
                                    </button>
                                </div>
                            ) : null}

                        </div>
                    </motion.section>
                </div>
            </main>
        </div>
    );
}
