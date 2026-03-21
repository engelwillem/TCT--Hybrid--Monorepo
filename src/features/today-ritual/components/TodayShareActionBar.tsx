"use client";

import { useMemo, useState } from "react";
import { Copy, MessageCircle } from "lucide-react";
import { PageActionBar } from "@/components/actions/PageActionBar";
import {
  buildTodayShareText,
  buildWhatsAppShareUrl,
  copyToClipboard,
  getCanonicalUrl,
} from "@/lib/share";

export default function TodayShareActionBar() {
  const [copied, setCopied] = useState(false);
  const todayUrl = useMemo(() => getCanonicalUrl("/today"), []);

  const onShareWhatsApp = () => {
    const shareText = buildTodayShareText(todayUrl);
    const waUrl = buildWhatsAppShareUrl(shareText);
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const onCopyLink = async () => {
    const ok = await copyToClipboard(todayUrl);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <PageActionBar
      className="mt-8"
      actions={[
        {
          id: "copy-link",
          label: copied ? "Tersalin" : "Salin Link",
          icon: Copy,
          onClick: onCopyLink,
          variant: "secondary",
        },
        {
          id: "share-wa",
          label: "Share ke WhatsApp",
          icon: MessageCircle,
          onClick: onShareWhatsApp,
          variant: "primary",
        },
      ]}
    />
  );
}

