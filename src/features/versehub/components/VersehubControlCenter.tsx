"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type ControlCenterItem = {
    key: string;
    label: string;
    onClick: () => void;
};

interface VersehubControlCenterProps {
    isVisible: boolean;
    isOpen: boolean;
    items: ControlCenterItem[];
    onToggle: () => void;
}

export function VersehubControlCenter({
    isVisible,
    isOpen,
    items,
    onToggle,
}: VersehubControlCenterProps) {
    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10, transition: { duration: 0.18 } }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed bottom-[calc(92px+env(safe-area-inset-bottom,24px))] right-4 z-[74] flex flex-col items-end gap-2 md:right-8"
                    >
                        {items.map((item, index) => (
                            <motion.button
                                key={item.key}
                                type="button"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                transition={{ duration: 0.26, delay: index * 0.03 }}
                                onClick={item.onClick}
                                className="min-h-[44px] rounded-full bg-[var(--vh-surface)]/80 px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--vh-text-primary)] backdrop-blur-2xl ring-1 ring-[var(--vh-border)] shadow-[0_18px_40px_-30px_rgba(0,0,0,0.5)] transition hover:bg-[var(--vh-surface)]"
                            >
                                {item.label}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                type="button"
                initial={false}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                onClick={onToggle}
                className={cn(
                    "fixed bottom-[calc(20px+env(safe-area-inset-bottom,24px))] right-4 z-[75] flex h-14 w-14 items-center justify-center rounded-full bg-[var(--vh-surface)]/90 text-[var(--vh-text-primary)] backdrop-blur-2xl ring-1 ring-[var(--vh-border)] shadow-[0_18px_40px_-30px_rgba(0,0,0,0.5)] transition hover:bg-[var(--vh-surface)] md:right-8",
                    !isVisible && "pointer-events-none"
                )}
                aria-label={isOpen ? "Close control center" : "Open control center"}
            >
                <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.28 }}>
                    <Plus className="h-5 w-5" />
                </motion.div>
            </motion.button>
        </>
    );
}
