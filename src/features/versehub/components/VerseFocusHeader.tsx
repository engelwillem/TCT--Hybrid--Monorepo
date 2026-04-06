"use client";

import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerseFocusHeaderProps {
  chapterRouteFromVerse: string;
  liveDateLabel: string;
  memberName: string | null;
  onBack: () => void;
  sanctuaryTitle: string;
  shouldShowChrome: boolean;
}

export function VerseFocusHeader({
  chapterRouteFromVerse,
  liveDateLabel,
  memberName,
  onBack,
  sanctuaryTitle,
  shouldShowChrome,
}: VerseFocusHeaderProps) {
  return (
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
          aria-label={`Kembali ke ${chapterRouteFromVerse}`}
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
  );
}
