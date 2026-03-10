"use client";

import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLanding = pathname === "/";

  // State locking for landing page to prevent scroll
  useEffect(() => {
    if (isLanding) {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100dvh";
    } else {
      document.body.style.overflow = "auto";
      document.body.style.height = "auto";
    }
  }, [isLanding]);

  // Hydration guard to prevent SSR mismatch
  if (!mounted) {
    return (
      <div className="bg-[#fafafa] dark:bg-[#050505] min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand/20 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-[#fafafa] dark:bg-[#050505] flex selection:bg-brand/20 transition-colors duration-500 overflow-x-hidden min-h-screen",
    )}>
      {/* Ambient Background Decoration (from Laravel) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
        <div className="absolute -left-[10%] -top-[10%] h-[60%] w-[60%] rounded-full bg-indigo-200/20 blur-[120px] dark:bg-indigo-900/10" />
        <div className="absolute -right-[5%] top-[10%] h-[50%] w-[50%] rounded-full bg-sky-200/20 blur-[100px] dark:bg-sky-900/10" />
        <div className="absolute bottom-[10%] left-[20%] h-[40%] w-[40%] rounded-full bg-rose-200/10 blur-[110px] dark:bg-rose-900/5" />
      </div>

      {!isLanding && <DesktopSidebar />}

      <div className={cn(
        "flex-1 flex flex-col transition-all duration-500 relative z-10",
        "mx-auto w-full max-w-6xl px-4",
        !isLanding ? "md:bg-background/40 min-h-screen" : "min-h-screen bg-transparent"
      )}>
        {!isLanding && (
          <header className="sticky top-0 z-40 bg-surface-muted/80 backdrop-blur-sm md:static md:bg-transparent md:backdrop-blur-none transition-all duration-300">
            <div className="flex items-center justify-between py-4 px-2 md:hidden">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center text-brand-foreground shadow-premium">
                  <span className="text-[10px] font-black uppercase">TC</span>
                </div>
                <h1 className="tct-h2 text-foreground font-extrabold tracking-tight">TheChosen</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center text-foreground font-bold shadow-soft">
                  <span className="text-xs">U</span>
                </div>
              </div>
            </div>
          </header>
        )}

        <main className={cn(
          "flex-1 flex justify-center",
          isLanding ? "w-full" : "pb-32 md:pb-12"
        )}>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "w-full transition-all duration-500",
                "max-w-[420px] md:max-w-none md:flex-1"
              )}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {!isLanding && (
          <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center md:hidden">
            <BottomNav />
          </div>
        )}
      </div>
    </div>
  );
}
