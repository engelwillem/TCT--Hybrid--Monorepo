"use client";

import { useCallback, useState } from "react";

type AuthGateMode = "share" | "interact";

type AuthGateContent = {
  title: string;
  description: string;
};

const SHARE_GATE_CONTENT: AuthGateContent = {
  title: "Tulisanmu sudah siap.",
  description: "Daftar atau masuk untuk membagikannya. Kamu bisa lanjut menulis tanpa kehilangan draft.",
};

const INTERACT_GATE_CONTENT: AuthGateContent = {
  title: "Lanjutkan langkahmu.",
  description: "Masuk atau daftar untuk ikut berinteraksi dengan komunitas.",
};

export function useCommunityAuthGate() {
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateContent, setAuthGateContent] = useState<AuthGateContent>(SHARE_GATE_CONTENT);

  const openAuthGate = useCallback((mode: AuthGateMode) => {
    setAuthGateContent(mode === "share" ? SHARE_GATE_CONTENT : INTERACT_GATE_CONTENT);
    setAuthGateOpen(true);
  }, []);

  return {
    authGateOpen,
    setAuthGateOpen,
    authGateContent,
    openAuthGate,
  } as const;
}
