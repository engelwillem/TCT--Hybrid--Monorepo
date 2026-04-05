"use client";

import { motion } from "framer-motion";
import type { MoodQuickStartOption } from "@/features/versehub/types";

interface MoodQuickStartProps {
    options: MoodQuickStartOption[];
    activeMood: string;
    onSelect: (moodKey: string) => void;
}

export function MoodQuickStart({
    options,
    activeMood,
    onSelect,
}: MoodQuickStartProps) {
    return (
        <div className="mt-8">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Saya merasa...
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {options.map((option) => {
                    const isActive = option.key === activeMood;
                    return (
                        <motion.button
                            key={option.key}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelect(option.key)}
                            className={[
                                "group relative overflow-hidden rounded-full px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] backdrop-blur-2xl ring-1 transition",
                                isActive
                                    ? "bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(232,244,255,0.94))] text-slate-900 ring-[#bfdbfe]/70 shadow-[0_22px_50px_-34px_rgba(37,99,235,0.45)]"
                                    : "bg-white/76 text-slate-700 ring-black/5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.22)] hover:bg-white",
                            ].join(" ")}
                            title={option.description}
                        >
                            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_70%)] opacity-80" />
                            <span className="relative z-10">{option.label}</span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
