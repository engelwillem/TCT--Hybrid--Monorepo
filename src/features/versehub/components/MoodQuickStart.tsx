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
            <p className="text-[12px] font-medium tracking-wide text-slate-400">
                apa kabarnya hari ini?
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
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
                                "rounded-full px-5 py-[12px] text-[15px] font-medium transition-all shadow-sm ring-1",
                                isActive
                                    ? "bg-slate-900 text-white ring-slate-900"
                                    : "bg-white text-slate-600 ring-slate-200/60 hover:bg-slate-50 hover:text-slate-900 hover:ring-slate-300",
                            ].join(" ")}
                            title={option.description}
                        >
                            <span>{option.label}</span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
