"use client";

import { motion, type Transition } from "framer-motion";
import { BookOpenText, Sparkles } from "lucide-react";
import { SurfaceBridgeAction } from "@/components/core/SurfaceBridgeAction";
import { buildVersehubClarifyUrl } from "@/ai/bridges/build-bridge-context";
import type { EmotionalEntryState, RenunganMode } from "@/features/ux-architecture/types";
import type { RenunganMatch } from "../content/personal-renungan";
import { AmbientBorderCard } from "@/features/sanctuary/components/AmbientBorderCard";

type RitualGlassCardProps = {
  personalRenungan: RenunganMatch;
  renunganFollowUps: string[];
  isGeneratingRenungan: boolean;
  mentorFeedback: "helpful" | "not_helpful" | null;
  isFollowUpOpen: boolean;
  entryState: EmotionalEntryState | null;
  isPrayerCompleted: boolean;
  reduceMotion: boolean;
  transitionCalm: Transition;
  transitionSlow: Transition;
  transitionBase: Transition;
  onRegenerateByMode: (mode: RenunganMode) => void;
  onMentorHelpful: () => void;
  onMentorNotHelpful: () => void;
  onOpenFollowUp: () => void;
  onCompletePrayer: () => void;
};

export function RitualGlassCard({
  personalRenungan,
  renunganFollowUps,
  isGeneratingRenungan,
  mentorFeedback,
  isFollowUpOpen,
  entryState,
  isPrayerCompleted,
  reduceMotion,
  transitionCalm,
  transitionSlow,
  transitionBase,
  onRegenerateByMode,
  onMentorHelpful,
  onMentorNotHelpful,
  onOpenFollowUp,
  onCompletePrayer,
}: RitualGlassCardProps) {
  const hasFollowUpQuestion = Boolean(personalRenungan.followUpQuestion);
  const showFollowUpQuestion = isFollowUpOpen && hasFollowUpQuestion;
  const showMakePrayerAction = renunganFollowUps.includes("make_prayer");
  const showSmallStepAction = renunganFollowUps.includes("small_step");
  const showVersehubAction = renunganFollowUps.includes("open_versehub");

  return (
    <AmbientBorderCard className="rounded-[34px] shadow-premium">
      <div className="glass-card relative h-full w-full overflow-hidden rounded-[34px] px-6 py-7 ring-1 ring-white/60">
        {isGeneratingRenungan ? (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.16, 0.28, 0.16] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/45 to-transparent"
              animate={{ x: ["0%", "340%"] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        ) : null}

        <div className="relative flex items-center gap-3 text-[#0f172a]/55">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e7f4ff] text-[#0ea5e9]">
            <BookOpenText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#0ea5e9]">Renungan Pribadi</p>
            <p className="mt-1 text-[13px] font-medium text-foreground/45">Berangkat dari isi hati yang baru kamu doakan.</p>
          </div>
        </div>

        <motion.div
          layoutId="verse-card"
          className="relative mt-5 inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-indigo-50/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-700"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{personalRenungan.verseReference}</span>
        </motion.div>

        {personalRenungan.mentorOpening ? (
          <p className="relative mt-5 text-[14px] leading-7 text-foreground/60">{personalRenungan.mentorOpening}</p>
        ) : null}

        <motion.p
          className="relative mt-6 tct-serif break-words whitespace-pre-line text-[23px] leading-[1.7] tracking-[-0.01em] text-foreground/88"
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={reduceMotion ? transitionCalm : { ...transitionSlow, delay: 0.08 }}
        >
          {personalRenungan.meditation}
        </motion.p>

        {personalRenungan.prayerPrompt ? (
          <div className="relative mt-6 rounded-2xl border border-sky-100/70 bg-sky-50/65 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700/80">Doa untuk dibawa</p>
            <p className="mt-2 text-[14px] leading-7 text-foreground/72">{personalRenungan.prayerPrompt}</p>
          </div>
        ) : null}

        <div className="relative mt-6 flex flex-wrap gap-2">
          {showMakePrayerAction ? (
            <button
              type="button"
              onClick={() => onRegenerateByMode("short_prayer")}
              disabled={isGeneratingRenungan}
              className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:opacity-60"
            >
              Jadikan doa
            </button>
          ) : null}
          {showSmallStepAction ? (
            <button
              type="button"
              onClick={() => onRegenerateByMode("practical_step")}
              disabled={isGeneratingRenungan}
              className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:opacity-60"
            >
              Beri langkah kecil
            </button>
          ) : null}
          {showVersehubAction ? (
            <SurfaceBridgeAction
              target="versehub"
              label="Lihat makna ayat ini"
              href={buildVersehubClarifyUrl({
                verseRef: personalRenungan.verseReference,
                source: "renungan",
                entryState,
              })}
            />
          ) : null}
        </div>

        <div className="relative mt-8 flex justify-start">
          {!isPrayerCompleted ? (
            <motion.button
              data-testid="today-prayer-submit"
              onClick={onCompletePrayer}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="group inline-flex items-center rounded-full bg-[#0f172a] px-8 py-3.5 text-[15px] font-bold text-white shadow-premium transition-all duration-400 ease-out hover:bg-slate-900 focus-visible:outline-none"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? transitionBase : { ...transitionBase, delay: 0.22 }}
            >
              <span className="transition-transform duration-400 ease-out group-hover:translate-x-[1px]">Amin</span>
            </motion.button>
          ) : null}
        </div>

        <div className="relative mt-6 rounded-2xl border border-slate-100/80 bg-slate-50/60 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onMentorHelpful}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                mentorFeedback === "helpful" ? "bg-emerald-100 text-emerald-700" : "bg-white text-slate-700 hover:bg-emerald-50"
              }`}
            >
              Ini menolong
            </button>
            <button
              type="button"
              onClick={onMentorNotHelpful}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                mentorFeedback === "not_helpful" ? "bg-rose-100 text-rose-700" : "bg-white text-slate-700 hover:bg-rose-50"
              }`}
            >
              Belum terasa pas
            </button>
            {hasFollowUpQuestion ? (
              <button
                type="button"
                onClick={onOpenFollowUp}
                className="rounded-full bg-white px-3.5 py-1.5 text-[12px] font-semibold text-sky-700 transition-colors hover:bg-sky-50"
              >
                Lanjutkan perlahan
              </button>
            ) : null}
          </div>

          {showFollowUpQuestion ? (
            <div className="mt-3 rounded-xl border border-sky-100/90 bg-white px-3.5 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700/80">Pertanyaan lanjutan</p>
              <p className="mt-1.5 text-[14px] leading-7 text-foreground/75">{personalRenungan.followUpQuestion}</p>
            </div>
          ) : null}
        </div>
      </div>
    </AmbientBorderCard>
  );
}
