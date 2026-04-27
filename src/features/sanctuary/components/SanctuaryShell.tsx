"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { usePathname } from "next/navigation";
import AmbienceController from "@/components/versehub/AmbienceController";
import { useSanctuary } from "@/features/sanctuary/components/SanctuaryContext";
import { cn } from "@/lib/utils";

interface SanctuaryShellProps {
  children: React.ReactNode;
}

export function SanctuaryShell({ children }: SanctuaryShellProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isVersehubRoute = pathname.startsWith("/versehub/");
  const {
    ambientMoodKey,
    ambientMenuOpen,
    ambientIsDucking,
    ambientShouldShowChrome,
    ambientPlaybackStateHandler,
    setAmbientMenuOpen,
  } = useSanctuary();

  useEffect(() => {
    // Smooth transition trigger
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 400);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (isVersehubRoute) return;
    setAmbientMenuOpen(false);
  }, [isVersehubRoute, setAmbientMenuOpen]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#FAFCFF]">
      {/* Premium Animated Mesh Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div 
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1/4 -left-1/4 h-[150%] w-[150%] opacity-40 blur-[120px]"
          style={{
            background: "radial-gradient(circle at 30% 30%, #E0F2FE 0%, transparent 50%), radial-gradient(circle at 70% 60%, #F5F3FF 0%, transparent 50%)"
          }}
        />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay" />
        
        {/* Particle Overlay */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -20, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              className="absolute h-1 w-1 rounded-full bg-sky-400/30"
              style={{
                left: `${15 + i * 14}%`,
                top: `${20 + i * 12}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Unified Content Frame */}
      <main className="relative z-10 mx-auto w-full">
        <LayoutGroup id="sanctuary-routes">
          <AnimatePresence mode="sync">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, scale: 0.99, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.01, y: -10 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 28,
                mass: 1
              }}
              className="w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </LayoutGroup>
      </main>

      {/* Loading Shield (iOS Feel) */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none fixed inset-0 z-[200] bg-white/10 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      <AmbienceController
        className={cn(
          "z-[70] transition-opacity duration-500",
          isVersehubRoute && ambientShouldShowChrome ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        isDucking={ambientIsDucking}
        activeMoodKey={ambientMoodKey}
        dayIndex={new Date().getDay()}
        menuOpen={ambientMenuOpen}
        hideTrigger={!isVersehubRoute}
        onMenuOpen={setAmbientMenuOpen}
        onPlaybackStateChange={ambientPlaybackStateHandler ?? undefined}
      />
    </div>
  );
}
