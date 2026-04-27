"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AmbientBorderCardProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}

export function AmbientBorderCard({ children, className, active = true }: AmbientBorderCardProps) {
  return (
    <div className={cn("relative group overflow-hidden", className)}>
      {/* Animated Light Border Effect */}
      {active && (
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -inset-[2px] z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: "conic-gradient(from 0deg, transparent, #0EA5E9, transparent 40%, #818CF8, transparent)",
            filter: "blur(6px)",
          }}
        />
      )}
      
      {/* Background Mask */}
      <div className="absolute inset-[0px] z-[1] rounded-[inherit] bg-white/92 backdrop-blur-xl" />
      
      {/* Content */}
      <div className="relative z-10 h-full w-full rounded-[inherit]">
        {children}
      </div>
    </div>
  );
}
