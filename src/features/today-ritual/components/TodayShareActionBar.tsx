"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Check, Copy, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/auth/use-auth-session";
import { AppIcon } from "@/features/community/components/AppIcon";
import {
  buildWhatsAppShareUrl,
  copyToClipboard,
  getCanonicalUrl,
} from "@/lib/share";

type TodayShareActionBarProps = {
  sharePath?: string;
  shareText: string;
  onBookmark?: () => Promise<boolean> | boolean;
};

export default function TodayShareActionBar({
  sharePath = "/renungan",
  shareText,
  onBookmark,
}: TodayShareActionBarProps) {
  const router = useRouter();
  const { isAuthenticated, isRestoring } = useAuthSession();
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const shareUrl = useMemo(() => getCanonicalUrl(sharePath), [sharePath]);

  const guardMemberAction = (action: () => void | Promise<void>) => {
    if (isRestoring) return;
    if (!isAuthenticated) {
      router.push('/login?next=/renungan');
      return;
    }

    void action();
  };

  const onShareWhatsApp = () => {
    const waUrl = buildWhatsAppShareUrl(`${shareText} ${shareUrl}`);
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const onCopyLink = async () => {
    const ok = await copyToClipboard(`${shareText} ${shareUrl}`);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const onSaveBookmark = async () => {
    if (!onBookmark || isSaving || bookmarked) return;
    setIsSaving(true);
    try {
      const result = await onBookmark();
      if (result) {
        setBookmarked(true);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-8 rounded-full border border-slate-200/80 bg-white/88 p-2 shadow-[0_14px_30px_-22px_rgba(15,23,42,0.35)]">
      <div className="flex items-center justify-start gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => guardMemberAction(onSaveBookmark)}
          disabled={isRestoring || !onBookmark || bookmarked || isSaving}
          aria-label={bookmarked ? "Bookmarked" : isSaving ? "Menyimpan bookmark" : "Bookmark"}
          aria-pressed={bookmarked}
          className={cn(
            "tct-pressable inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200",
            bookmarked
              ? "bg-brand/10 text-brand ring-1 ring-inset ring-brand/20"
              : "bg-surface-muted/70 text-muted-foreground hover:bg-surface-muted hover:text-foreground",
            (isRestoring || !onBookmark || bookmarked || isSaving) ? "opacity-60" : ""
          )}
        >
          {bookmarked ? (
            <AppIcon icon={Check} variant="action" className="text-brand" />
          ) : (
            <AppIcon icon={Bookmark} variant="action" active={bookmarked} className={bookmarked ? "text-brand" : "opacity-70"} />
          )}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => guardMemberAction(onCopyLink)}
          disabled={isRestoring}
          aria-label={copied ? "Teks renungan tersalin" : "Salin renungan"}
          className={cn(
            "tct-pressable inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted/70 text-muted-foreground transition-colors duration-200 hover:bg-surface-muted hover:text-foreground",
            isRestoring ? "opacity-60" : ""
          )}
        >
          {copied ? (
            <AppIcon icon={Check} variant="action" className="text-brand" />
          ) : (
            <AppIcon icon={Copy} variant="action" className="opacity-70" />
          )}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => guardMemberAction(onShareWhatsApp)}
          disabled={isRestoring}
          aria-label="Bagikan renungan"
          className={cn(
            "tct-pressable inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted/70 text-muted-foreground transition-colors duration-200 hover:bg-surface-muted hover:text-foreground",
            isRestoring ? "opacity-60" : ""
          )}
        >
          <AppIcon icon={MessageCircle} variant="action" className="opacity-70" />
        </motion.button>
      </div>
    </div>
  );
}
