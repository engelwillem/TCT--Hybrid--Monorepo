"use client";

import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type AuthExecutionGateProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
};

export function AuthExecutionGate({
  open,
  onOpenChange,
  title = "Tulisanmu sudah siap.",
  description = "Daftar atau login untuk membagikannya. Kamu bisa lanjut menulis tanpa kehilangan draft.",
}: AuthExecutionGateProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-[420px] rounded-[28px] border border-border/60 bg-background/95 p-0 shadow-premium backdrop-blur-2xl">
        <div className="p-6 sm:p-7">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="tct-serif text-[27px] leading-tight tracking-tight text-foreground/90">
              {title}
            </DialogTitle>
            <DialogDescription className="text-[14px] leading-relaxed text-foreground/60">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 flex flex-col gap-3">
            <Button asChild className="h-11 rounded-full bg-foreground text-background font-semibold">
              <Link href="/login?intent=signup">Daftar</Link>
            </Button>
            <Button asChild variant="secondary" className="h-11 rounded-full font-semibold">
              <Link href="/login">Login</Link>
            </Button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="mt-1 text-center text-[12px] font-medium text-foreground/45 transition-colors hover:text-foreground/70"
            >
              Nanti saja
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
