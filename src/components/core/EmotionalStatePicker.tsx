"use client";

import { cn } from "@/lib/utils";
import { EMOTIONAL_STATE_LABELS, type EmotionalEntryState } from "@/features/ux-architecture/types";

type EmotionalStatePickerProps = {
  value: EmotionalEntryState | null;
  onChange: (value: EmotionalEntryState) => void;
  compact?: boolean;
  className?: string;
};

const ORDERED_STATES: EmotionalEntryState[] = [
  "overwhelmed",
  "disconnected",
  "clarity",
  "connect",
  "neutral",
];

export function EmotionalStatePicker({ value, onChange, compact = false, className }: EmotionalStatePickerProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Hari ini kamu merasa...</p>
      <div className={cn("flex flex-wrap gap-2", compact ? "gap-1.5" : "gap-2")}>
        {ORDERED_STATES.map((state) => {
          const active = value === state;
          return (
            <button
              key={state}
              type="button"
              onClick={() => onChange(state)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-left text-[12px] font-semibold transition-all",
                active
                  ? "border-sky-200 bg-sky-50 text-sky-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800",
                compact ? "px-2.5 py-1 text-[11px]" : ""
              )}
            >
              {EMOTIONAL_STATE_LABELS[state]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
