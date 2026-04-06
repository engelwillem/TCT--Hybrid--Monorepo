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
        <div className="mt-6">
            <p className="text-[12px] font-medium tracking-wide text-foreground/40">
                Mulai dari yang kamu rasakan hari ini
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
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
                                "rounded-full px-5 py-[12px] text-[15px] font-medium transition-colors",
                                isActive
                                    ? "bg-[#0f172a] text-white"
                                    : "bg-black/[0.05] text-foreground/70 hover:bg-black/[0.08]",
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
