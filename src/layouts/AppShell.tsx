"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/firebase/auth/use-user";
import { getUiNavItems } from "@/lib/navigation";
import FloatingBottomNav from "@/components/core/FloatingBottomNav";
import DesktopSidebarNav from "@/components/core/DesktopSidebarNav";
import { IconChevronRight } from "@/components/icons/AppIcons";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const isAuthenticated = !!user;
  const navItems = getUiNavItems(isAuthenticated);

  // Identify active nav item based on pathname
  const activeNavId = navItems.find(item => pathname.startsWith(item.href))?.id || 'home';

  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > 100 && currentScrollY > lastScrollY.current) {
        setIsVisible(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/today');
    }
  };

  if (!mounted) return <div className="min-h-screen bg-background" />;

  const isLanding = pathname === "/";
  const title = pathname.split('/').filter(Boolean).pop() || 'Today';
  const formattedTitle = title.charAt(0).toUpperCase() + title.slice(1);

  return (
    <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#050505] overflow-x-hidden">
      {/* Ambient Background Layers (Parity with Laravel) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[60%] w-[60%] rounded-full bg-indigo-200/20 blur-[120px] dark:bg-indigo-900/10" />
        <div className="absolute -right-[5%] top-[10%] h-[50%] w-[50%] rounded-full bg-sky-200/20 blur-[100px] dark:bg-sky-900/10" />
        <div className="absolute bottom-[10%] left-[20%] h-[40%] w-[40%] rounded-full bg-rose-200/10 blur-[110px] dark:bg-rose-900/5" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-8 pb-32">
        <div className="flex items-start gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden md:flex md:w-72 md:flex-col md:gap-4 sticky top-8 h-fit align-start">
            <DesktopSidebarNav
              activeId={activeNavId}
              navItems={navItems}
              isAuthenticated={isAuthenticated}
            />
          </div>

          {/* Main Content Column */}
          <div className="w-full md:flex-1 mx-auto max-w-[420px] md:mx-0 md:max-w-none">
            {/* Sticky Header (Mobile Only / Responsive Logic) */}
            {!isLanding && (
              <motion.header
                initial={false}
                animate={{
                  y: isVisible ? 0 : -80,
                  opacity: isVisible ? 1 : 0
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="sticky top-0 z-40 flex items-center justify-between bg-white/80 dark:bg-black/80 py-2 backdrop-blur-sm md:static md:bg-transparent md:backdrop-blur-none -mx-4 px-4"
              >
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-soft ring-1 ring-black/5"
                  aria-label="Back"
                >
                  <IconChevronRight className="h-5 w-5 rotate-180" />
                </button>

                <h1 className="tct-brand-gradient text-lg font-bold">
                  {formattedTitle}
                </h1>

                <div className="w-12" /> {/* Right Action Spacer */}
              </motion.header>
            )}

            <main className={cn(isLanding ? "" : "mt-6")}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative z-20"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>

      {/* Floating Mobile Nav */}
      {!isLanding && (
        <div className="fixed inset-x-0 z-50 flex justify-center md:hidden bottom-[calc(24px+env(safe-area-inset-bottom))]">
          <FloatingBottomNav
            items={navItems}
            activeId={activeNavId}
            onChange={(id) => {
              const href = navItems.find(n => n.id === id)?.href || '/today';
              router.push(href);
            }}
          />
        </div>
      )}
    </div>
  );
}
