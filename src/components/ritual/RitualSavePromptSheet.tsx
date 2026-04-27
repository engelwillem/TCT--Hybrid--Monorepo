"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type RitualSavePromptSheetProps = {
  open: boolean;
  nextPath?: string;
  onOpenChange: (open: boolean) => void;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onDismissClick?: () => void;
};

export default function RitualSavePromptSheet({
  open,
  nextPath = "/renungan",
  onOpenChange,
  onLoginClick,
  onSignupClick,
  onDismissClick,
}: RitualSavePromptSheetProps) {
  const encodedNext = encodeURIComponent(nextPath);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="save-prompt-sheet"
        className="w-[92vw] max-w-[430px] overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(245,249,255,0.95))] p-0 shadow-[0_32px_100px_-48px_rgba(15,23,42,0.45)] backdrop-blur-2xl"
      >
        <div className="relative p-7 sm:p-8">
          <div className="pointer-events-none absolute -right-10 top-0 h-28 w-28 rounded-full bg-sky-100/85 blur-2xl" />

          <div className="relative">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-sky-100/90 bg-white/85 text-sky-600 shadow-[0_18px_38px_-24px_rgba(14,165,233,0.55)]">
              <Bookmark className="h-5 w-5" />
            </div>

            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="tct-serif text-[25px] leading-tight tracking-tight text-slate-900">
                Renungan ini bisa kamu simpan
              </DialogTitle>
              <DialogDescription className="max-w-sm text-[14px] leading-relaxed text-slate-600">
                Supaya kamu bisa melanjutkannya besok dan kembali membacanya kapan pun kamu membutuhkannya.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 flex flex-col gap-3">
              <Button asChild className="h-12 rounded-full bg-slate-950 text-white font-semibold shadow-[0_16px_36px_-20px_rgba(15,23,42,0.55)]">
                <Link
                  data-testid="save-prompt-primary"
                  href={`/login?intent=signup&next=${encodedNext}`}
                  onClick={onSignupClick}
                >
                  Simpan renungan ini
                </Link>
              </Button>

              <Button
                asChild
                variant="secondary"
                className="h-12 rounded-full border border-slate-200 bg-white/88 font-semibold text-slate-800 shadow-none"
              >
                <Link data-testid="save-prompt-login" href={`/login?next=${encodedNext}`} onClick={onLoginClick}>
                  Saya sudah punya akun
                </Link>
              </Button>

              <button
                data-testid="save-prompt-dismiss"
                type="button"
                onClick={() => {
                  onDismissClick?.();
                  onOpenChange(false);
                }}
                className="mt-1 text-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
              >
                Nanti saja
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
