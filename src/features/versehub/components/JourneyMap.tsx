"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Route, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type JourneyMapDay = {
  key: string;
  shortLabel: string;
  fullLabel: string;
  activityCount: number;
  isToday: boolean;
};

interface JourneyMapProps {
  days: JourneyMapDay[];
  streakCount: number;
  onOpenJourney?: () => void;
}

export function JourneyMap({ days, streakCount, onOpenJourney }: JourneyMapProps) {
  const [activeDayKey, setActiveDayKey] = useState<string | null>(days.find((day) => day.isToday)?.key ?? days[days.length - 1]?.key ?? null);
  const activeDay = useMemo(() => days.find((day) => day.key === activeDayKey) ?? null, [activeDayKey, days]);

  if (days.length === 0) return null;

  return (
    <section className="mt-9 w-full max-w-[420px] rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-[0_18px_44px_-30px_rgba(15,23,42,0.28)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#91A0C7]">Journey Map</p>
          <p className="mt-1 text-[13px] font-medium text-[#4E637D]">
            Streak bacaan: <span className="font-black text-[#2F455F]">{streakCount} hari</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenJourney}
          className="inline-flex items-center gap-2 rounded-full border border-[#D8E5F4] bg-[#F4F8FF] px-3 py-1.5 text-[11px] font-bold text-[#38557A] transition-colors hover:bg-[#EAF2FF]"
        >
          <Route className="h-3.5 w-3.5" />
          Lihat Journey
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const isActive = day.key === activeDayKey;
          const isCompleted = day.activityCount > 0;

          return (
            <button
              key={day.key}
              type="button"
              onClick={() => setActiveDayKey(day.key)}
              className={cn(
                "relative rounded-2xl px-1 py-2 text-center transition-all",
                isCompleted ? "bg-[#F1F8FF] ring-1 ring-[#D7E8FB]" : "bg-[#F8FAFD] ring-1 ring-[#E8EDF5]",
                isActive && "scale-[1.03]"
              )}
              aria-label={`${day.fullLabel} ${day.activityCount} aktivitas`}
            >
              {isActive ? (
                <motion.span
                  layoutId="journey-map-active-pill"
                  className="absolute inset-0 rounded-2xl border border-[#B8D3F2] bg-[#E7F2FF]"
                  transition={{ type: "spring", stiffness: 320, damping: 26 }}
                />
              ) : null}
              <span className="relative block text-[10px] font-bold uppercase tracking-[0.08em] text-[#6884A8]">{day.shortLabel}</span>
              <span className={cn("relative mt-1 block text-[12px] font-black", isCompleted ? "text-[#2D537B]" : "text-[#9AA7BA]")}>
                {isCompleted ? day.activityCount : "-"}
              </span>
            </button>
          );
        })}
      </div>

      {activeDay ? (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-[#F8FBFF] px-3 py-2 text-[12px] text-[#4F6480] ring-1 ring-[#E4EDF8]">
          <Sparkles className="h-3.5 w-3.5 text-[#6F8FB5]" />
          <span>
            {activeDay.fullLabel}:{" "}
            <span className="font-bold">
              {activeDay.activityCount > 0 ? `${activeDay.activityCount} interaksi firman` : "belum ada interaksi"}
            </span>
          </span>
        </div>
      ) : null}
    </section>
  );
}
