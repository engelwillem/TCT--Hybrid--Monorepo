"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Check, Copy, MessageCircle } from "lucide-react";
import { PageActionBar } from "@/components/actions/PageActionBar";
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
    <PageActionBar
      className="mt-8"
      actions={[
        {
          id: "save-bookmark",
          label: bookmarked ? "Bookmarked" : isSaving ? "Menyimpan..." : "Bookmark",
          icon: bookmarked ? Check : Bookmark,
          onClick: () => guardMemberAction(onSaveBookmark),
          disabled: isRestoring || !onBookmark || bookmarked || isSaving,
          variant: bookmarked ? "primary" : "secondary",
        },
        {
          id: "copy-link",
          label: copied ? "Tersalin" : "Salin",
          icon: copied ? Check : Copy,
          onClick: () => guardMemberAction(onCopyLink),
          disabled: isRestoring,
          variant: "ghost",
        },
        {
          id: "share-wa",
          label: "Bagikan",
          icon: MessageCircle,
          onClick: () => guardMemberAction(onShareWhatsApp),
          disabled: isRestoring,
          variant: "primary",
        },
      ]}
    />
  );
}
