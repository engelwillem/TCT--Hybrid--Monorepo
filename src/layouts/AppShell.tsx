"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { Background } from "@/components/core/Background";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLanding = pathname === "/";

  // Lock scroll for landing page
  useEffect(() => {
    if (isLanding) {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100dvh";
    } else {
      document.body.style.overflow = "auto";
      document.body.style.height = "auto";
    }
  }, [isLanding]);

  // Prevent flash during hydration
  if (!mounted) {
    return (
      <div className="bg-[#020617] min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand/20 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#020617] text-white selection:bg-brand/20 overflow-x-hidden">
      <Background />

      <div className="relative z-10 flex min-h-screen">
        {!isLanding && <DesktopSidebar />}

        <div className={cn(
          "flex-1 flex flex-col min-h-screen",
          !isLanding && "pb-24 md:pb-0"
        )}>
          <main className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="h-full w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>

          {!isLanding && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden w-full max-w-md px-6">
              <BottomNav />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}