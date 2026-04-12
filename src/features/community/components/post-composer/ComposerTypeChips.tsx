import { ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComposerMode, ComposerPanel, MediaAspectRatio } from "./types";

type ComposerTypeChipsProps = {
  activePanel: ComposerPanel;
  selectedTypeLabel: string;
  composerMode: ComposerMode;
  hasImages: boolean;
  mediaAspectRatio: MediaAspectRatio;
  onTogglePanel: (panel: ComposerPanel) => void;
};

export function ComposerTypeChips({
  activePanel,
  selectedTypeLabel,
  composerMode,
  hasImages,
  mediaAspectRatio,
  onTogglePanel,
}: ComposerTypeChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onTogglePanel("media")}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] transition-all",
          activePanel === "media"
            ? "border-slate-900 bg-slate-900 text-white shadow-[0_16px_34px_-20px_rgba(15,23,42,0.5)]"
            : "border-border/60 bg-background/85 text-foreground/70 hover:bg-background"
        )}
      >
        <ImagePlus className="h-3.5 w-3.5" />
        Tambahkan
      </button>
      <button
        type="button"
        onClick={() => onTogglePanel("category")}
        className={cn(
          "rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] transition-all",
          activePanel === "category"
            ? "border-slate-900 bg-slate-900 text-white shadow-[0_16px_34px_-20px_rgba(15,23,42,0.5)]"
            : "border-border/60 bg-background/85 text-foreground/70 hover:bg-background"
        )}
      >
        {selectedTypeLabel}
      </button>
      <span className="rounded-full border border-sky-200/70 bg-sky-50/80 px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-sky-700">
        {composerMode === "carousel" ? "Carousel" : "Free Upload"}
      </span>
      {hasImages ? (
        <span className="rounded-full border border-border/60 bg-background/90 px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-foreground/60">
          Rasio {mediaAspectRatio}
        </span>
      ) : null}
    </div>
  );
}
