"use client";

import Link from "next/link";
import { useAuthSession } from "@/auth/use-auth-session";

export function LandingAuthLinks() {
  const { isAuthenticated } = useAuthSession();

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="mt-10 flex items-center gap-6 text-[13px] font-medium text-foreground/40 pb-20">
      <Link href="/login?intent=signup" className="hover:text-foreground/70 transition-colors">
        Daftar
      </Link>
      <span aria-hidden="true" className="opacity-30">·</span>
      <Link href="/login" className="hover:text-foreground/70 transition-colors">
        Login
      </Link>
    </div>
  );
}
