"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAppAccessToken, getAppAuthUser } from "@/services/app-auth-token";

export function LandingAuthLinks() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let isActive = true;

    const syncAuthState = async () => {
      const hasLocalSession = Boolean(getAppAccessToken() || getAppAuthUser());
      if (hasLocalSession) {
        if (isActive) setIsAuthenticated(true);
        return;
      }

      try {
        const persistence =
          window.localStorage.getItem("tct_app_auth_persistence") ||
          window.sessionStorage.getItem("tct_app_auth_persistence") ||
          "session";

        const response = await fetch(`/api/auth/session?persistence=${encodeURIComponent(persistence)}`, {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });

        const payload = await response.json().catch(() => null) as {
          authenticated?: boolean;
        } | null;

        if (isActive) {
          setIsAuthenticated(Boolean(response.ok && payload?.authenticated));
        }
      } catch {
        if (isActive) {
          setIsAuthenticated(false);
        }
      }
    };

    void syncAuthState();
    window.addEventListener("storage", syncAuthState);
    return () => {
      isActive = false;
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  if (isAuthenticated === null || isAuthenticated) {
    return null;
  }

  return (
    <div className="mt-10 flex items-center gap-6 pb-20 text-[13px] font-medium text-foreground/40">
      <Link href="/login?intent=signup" className="transition-colors hover:text-foreground/70">
        Sign Up
      </Link>
      <span aria-hidden="true" className="opacity-30">.</span>
      <Link href="/login" className="transition-colors hover:text-foreground/70">
        Login
      </Link>
    </div>
  );
}
