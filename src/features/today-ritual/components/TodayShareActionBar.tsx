"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Check, Copy, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/auth/use-auth-session";
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
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => guardMemberAction(onSaveBookmark)}
          disabled={isRestoring || !onBookmark || bookmarked || isSaving}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-full px-4 text-[14px] font-semibold transition-all",
            bookmarked
              ? "bg-sky-100 text-sky-700 ring-1 ring-inset ring-sky-200"
              : "bg-slate-100/70 text-slate-700 hover:bg-slate-200/75",
            (isRestoring || !onBookmark || bookmarked || isSaving) ? "opacity-60" : ""
          )}
        >
          {bookmarked ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          <span>{bookmarked ? "Bookmarked" : isSaving ? "Menyimpan..." : "Bookmark"}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => guardMemberAction(onCopyLink)}
          disabled={isRestoring}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-full px-4 text-[14px] font-semibold transition-all",
            "bg-slate-100/70 text-slate-700 hover:bg-slate-200/75",
            isRestoring ? "opacity-60" : ""
          )}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span>{copied ? "Tersalin" : "Salin"}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => guardMemberAction(onShareWhatsApp)}
          disabled={isRestoring}
          className={cn(
            "ml-auto inline-flex h-11 items-center gap-2 rounded-full px-5 text-[14px] font-semibold transition-all",
            "bg-[#0f172a] text-white hover:bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(14,165,233,0.78))]",
            isRestoring ? "opacity-60" : ""
          )}
        >
          <MessageCircle className="h-4 w-4" />
          <span>Bagikan</span>
        </motion.button>
      </div>
    </div>
  );
}
