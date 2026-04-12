import { Button } from "@/components/ui/button";

type ComposerActionBarProps = {
  canSubmit: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  statusSlot?: React.ReactNode;
};

export function ComposerActionBar({ canSubmit, isSubmitting, onCancel, onSubmit, statusSlot }: ComposerActionBarProps) {
  return (
    <div className="sticky bottom-0 z-30 mt-auto border-t border-border/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),#ffffff)] px-6 py-4 pb-[max(env(safe-area-inset-bottom),1rem)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="h-10 min-w-10 rounded-full px-4 text-[12px] font-bold text-foreground/50 hover:bg-surface-muted hover:text-foreground/80 md:px-5"
        >
          Batal
        </Button>
        <div className="flex-1 overflow-hidden" />
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
          className="h-10 shrink-0 rounded-full bg-brand px-6 text-[12px] font-black uppercase tracking-[0.16em] text-white shadow-[0_12px_24px_-10px_var(--color-brand)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_30px_-10px_var(--color-brand)] hover:brightness-110 disabled:pointer-events-none disabled:bg-surface-muted disabled:text-foreground/30 disabled:shadow-none"
        >
          {isSubmitting ? "Posting..." : "Bagikan"}
        </Button>
      </div>
      {statusSlot ? <div className="mt-2 px-1">{statusSlot}</div> : null}
    </div>
  );
}
