import { Button } from "@/components/ui/button";

type ComposerActionBarProps = {
  canSubmit: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

export function ComposerActionBar({ canSubmit, isSubmitting, onCancel, onSubmit }: ComposerActionBarProps) {
  return (
    <div className="sticky bottom-0 z-10 -mx-6 border-t border-border/50 bg-[linear-gradient(180deg,rgba(248,251,255,0.88),rgba(255,255,255,0.98))] px-6 pt-3 pb-[max(env(safe-area-inset-bottom),0.9rem)] backdrop-blur-xl">
      <div className="flex items-center gap-2 rounded-[18px] border border-border/60 bg-white/85 p-2 shadow-soft">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="h-11 rounded-full px-5 text-[13px] font-bold text-foreground/60 hover:bg-surface-muted"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
          className="ml-auto h-11 rounded-full px-6 text-[13px] font-black uppercase tracking-[0.15em]"
        >
          {isSubmitting ? "Posting..." : "Posting"}
        </Button>
      </div>
    </div>
  );
}
