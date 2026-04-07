"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAppAccessToken, getAppAuthUser } from "@/services/app-auth-token";

export function LandingAuthLinks() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(Boolean(getAppAccessToken() || getAppAuthUser()));
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    return () => window.removeEventListener("storage", syncAuthState);
  }, []);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="mt-10 flex items-center gap-6 pb-20 text-[13px] font-medium text-foreground/40">
      <Link href="/login?intent=signup" className="transition-colors hover:text-foreground/70">
        Daftar
      </Link>
      <span aria-hidden="true" className="opacity-30">.</span>
      <Link href="/login" className="transition-colors hover:text-foreground/70">
        Login
      </Link>
    </div>
  );
}
