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
    <div className={cn("flex flex-col gap-2.5", className)}>
      <p className="text-[13px] font-medium text-slate-500">Hari ini kamu merasa...</p>
      <div className={cn("flex flex-nowrap overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1", compact ? "gap-2" : "gap-2.5")}>
        {ORDERED_STATES.map((state) => {
          const active = value === state;
          return (
            <button
              key={state}
              type="button"
              onClick={() => onChange(state)}
              className={cn(
                "flex-shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-left text-[13px] font-medium transition-all",
                active
                  ? "border-sky-200 bg-sky-50 text-sky-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800",
                compact ? "px-3 py-1.5 text-[12px]" : ""
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
