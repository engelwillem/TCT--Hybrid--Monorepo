"use client";

import Link from "next/link";
import { motion, type Transition } from "framer-motion";
import { Bookmark } from "lucide-react";
import type { RefObject } from "react";
import { SurfaceBridgeAction } from "@/components/core/SurfaceBridgeAction";
import TodayShareActionBar from "./TodayShareActionBar";
import type { EmotionalEntryState } from "@/features/ux-architecture/types";
import type { RenunganMatch } from "../content/personal-renungan";
import { RenunganVerseContinuation } from "./RenunganVerseContinuation";

type RitualCompletionSectionProps = {
  isVisible: boolean;
  sectionRef: RefObject<HTMLDivElement | null>;
  reduceMotion: boolean;
  transitionCalm: Transition;
  transitionSlow: Transition;
  personalRenungan: RenunganMatch;
  personalShareText: string;
  personalSharePath: string;
  isAuthenticated: boolean;
  isAuthRestoring: boolean;
  bookmarkError: string | null;
  bookmarkSuccessNote: string | null;
  entryState: EmotionalEntryState | null;
  isDeepeningOpen: boolean;
  deepeningRef: RefObject<HTMLDivElement | null>;
  onOpenDeepening: () => void;
  onDismissDeepening: () => void;
  onReadFullChapter: () => void;
  onOpenRelatedVerse: (verseReference: string) => void;
  onResolveSharePath: () => Promise<string | null>;
  onBookmark: () => Promise<boolean>;
  onRequireBookmarkAuth: () => void;
};

export function RitualCompletionSection({
  isVisible,
  sectionRef,
  reduceMotion,
  transitionCalm,
  transitionSlow,
  personalRenungan,
  personalShareText,
  personalSharePath,
  isAuthenticated,
  isAuthRestoring,
  bookmarkError,
  bookmarkSuccessNote,
  entryState,
  isDeepeningOpen,
  deepeningRef,
  onOpenDeepening,
  onDismissDeepening,
  onReadFullChapter,
  onOpenRelatedVerse,
  onResolveSharePath,
  onBookmark,
  onRequireBookmarkAuth,
}: RitualCompletionSectionProps) {
  if (!isVisible) return null;

  return (
    <motion.section
      data-testid="completion-section"
      ref={sectionRef}
      tabIndex={-1}
      initial={{ opacity: 0, y: 22, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={reduceMotion ? transitionCalm : { ...transitionSlow, delay: 0.08 }}
      className="mt-14 sm:mt-20 px-4 sm:px-6 pb-6 sm:pb-8 focus:outline-none"
    >
      <div className="rounded-[28px] sm:rounded-[36px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,250,255,0.94))] px-4 sm:px-6 py-6 sm:py-8 shadow-[0_32px_110px_-60px_rgba(14,116,144,0.35)] backdrop-blur-xl">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#0284c7]">Ayat untukmu hari ini</p>
        <blockquote className="mt-4 sm:mt-5 tct-serif text-[22px] sm:text-[25px] leading-[1.58] sm:leading-[1.65] tracking-[-0.015em] text-foreground/92">
          “{personalRenungan.verseText}”
        </blockquote>
        <div className="mt-6 h-px w-10 bg-foreground/15" aria-hidden="true" />
        <motion.div
          layoutId="verse-card"
          className="mt-4 inline-flex rounded-full border border-indigo-200/70 bg-indigo-50/60 px-3 py-1"
        >
          <p className="text-[12px] font-semibold tracking-[0.18em] text-indigo-700">{personalRenungan.verseReference}</p>
        </motion.div>

        <TodayShareActionBar
          shareText={personalShareText}
          sharePath={personalSharePath}
          isAuthenticated={isAuthenticated}
          isRestoring={isAuthRestoring}
          resolveSharePath={onResolveSharePath}
          onBookmark={onBookmark}
          onRequireAuthForBookmark={onRequireBookmarkAuth}
        />

        <div className="mt-4 flex items-start gap-2 text-[13px] leading-6 text-foreground/45">
          <Bookmark className="mt-0.5 h-4 w-4 shrink-0 text-foreground/35" />
          <p>
            Simpan renungan ini agar bisa kamu temui lagi di tab <span className="font-semibold text-foreground/68">Bookmarks</span> di{" "}
            <Link
              href="/community"
              className="font-semibold text-[#0284c7] underline-offset-2 transition-colors hover:text-[#0ea5e9] hover:underline"
            >
              Community
            </Link>
            .
          </p>
        </div>

        {bookmarkError ? <p className="mt-3 text-[13px] font-medium text-rose-500">{bookmarkError}</p> : null}
        {bookmarkSuccessNote ? (
          <p className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-[13px] font-medium text-emerald-700">
            {bookmarkSuccessNote}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            data-testid="cta-deepen"
            type="button"
            onClick={isDeepeningOpen ? onDismissDeepening : onOpenDeepening}
            className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[12px] font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
          >
            {isDeepeningOpen ? "Tutup untuk sekarang" : "Lanjutkan pendalaman"}
          </button>
          <SurfaceBridgeAction
            target="community"
            label="Bagikan nanti"
            href={`/community?intent=reflection&source=renungan&verseRef=${encodeURIComponent(personalRenungan.verseReference)}&text=${encodeURIComponent(personalRenungan.meditation)}`}
          />
          <SurfaceBridgeAction
            target="renungan"
            label="Selesai untuk hari ini"
            href="/renungan"
            dataTestId="cta-finish"
          />
        </div>

        {isDeepeningOpen ? (
          <RenunganVerseContinuation
            containerRef={deepeningRef}
            personalRenungan={personalRenungan}
            entryState={entryState}
            onReadFullChapter={onReadFullChapter}
            onOpenRelatedVerse={onOpenRelatedVerse}
          />
        ) : null}
      </div>
    </motion.section>
  );
}
