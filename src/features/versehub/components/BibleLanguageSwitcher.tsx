"use client";

import { cn } from "@/lib/utils";

type BibleLanguage = "id" | "en";

interface BibleLanguageSwitcherProps {
  current: BibleLanguage;
  onChange: (next: BibleLanguage) => void;
  className?: string;
}

export function BibleLanguageSwitcher({
  current,
  onChange,
  className,
}: BibleLanguageSwitcherProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/88 p-1 shadow-[0_8px_22px_-16px_rgba(15,23,42,0.35)] backdrop-blur-sm",
        className
      )}
      role="group"
      aria-label="Bible language"
    >
      {(["id", "en"] as const).map((item) => {
        const active = current === item;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={cn(
              "min-w-[38px] rounded-full px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] transition-colors",
              active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            )}
            aria-pressed={active}
            aria-label={item === "id" ? "Switch to Indonesian Bible" : "Switch to English Bible"}
          >
            {item.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

