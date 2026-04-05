"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChapterReflectionBreakProps {
    verseNumber: number;
    promptText: string;
    value: string;
    isDone: boolean;
    onChange: (value: string) => void;
    onComplete: () => void;
}

export function ChapterReflectionBreak({
    verseNumber,
    promptText,
    value,
    isDone,
    onChange,
    onComplete,
}: ChapterReflectionBreakProps) {
    const isFilled = value.trim().length >= 3;

    return (
        <div className="relative overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(242,247,255,0.86))] p-5 shadow-[0_24px_60px_-42px_rgba(37,99,235,0.35)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(191,219,254,0.45),transparent_55%)]" />
            <div className="relative z-10">
                <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-sky-600 ring-1 ring-sky-100/80">
                        <Sparkles className="h-4 w-4" />
                    </span>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                            Reflect Break
                        </p>
                        <p className="mt-1 text-[13px] leading-6 text-slate-600">
                            Setelah ayat {verseNumber}, berhenti sebentar dan dengarkan apa yang sedang Tuhan tekankan.
                        </p>
                    </div>
                </div>

                <p className="mt-4 text-[16px] leading-[1.72] text-slate-800/90">
                    {promptText}
                </p>

                <AnimatePresence mode="wait" initial={false}>
                    {!isDone ? (
                        <motion.div
                            key="draft"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
                            className="mt-4"
                        >
                            <textarea
                                value={value}
                                onChange={(event) => onChange(event.target.value)}
                                placeholder="Tulis refleksi singkatmu..."
                                className="min-h-[110px] w-full resize-none rounded-2xl bg-white/72 px-5 py-4 text-[15px] leading-[1.6] text-slate-800/85 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-100"
                            />
                            <div className="mt-4 flex justify-start">
                                <button
                                    type="button"
                                    disabled={!isFilled}
                                    onClick={onComplete}
                                    className={cn(
                                        "rounded-full px-6 py-[10px] text-[14px] font-medium transition-all duration-300",
                                        isFilled
                                            ? "bg-slate-900 text-white hover:-translate-y-[1px] hover:bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(14,165,233,0.78))]"
                                            : "bg-transparent text-foreground/20"
                                    )}
                                >
                                    Simpan Refleksi
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 rounded-2xl bg-white/70 px-5 py-4 ring-1 ring-black/[0.03]"
                        >
                            <p className="text-[15px] leading-[1.65] text-slate-700">
                                {value}
                            </p>
                            <p className="mt-3 text-[12px] font-medium tracking-wide text-slate-400">
                                Refleksi pasal ini tersimpan di sesi bacamu.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
