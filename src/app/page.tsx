"use client";

import React from 'react';
import { motion } from "framer-motion";
import { GreetingHeader } from "@/components/core/GreetingHeader";
import { ActionShortcutBar } from "@/components/core/ActionShortcutBar";
import { DailyVerseHeroCard } from "@/components/core/DailyVerseHeroCard";
import { ThrowingCard } from "@/components/core/ThrowingCard";

export default function TodayPage() {
  return (
    <div className="mx-auto w-full max-w-[720px] space-y-5 pb-28 pt-2">
      {/* 1. Header with dynamic greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GreetingHeader />
      </motion.div>

      <div className="space-y-5">
        {/* 2. Quick action grid */}
        <ThrowingCard index={0}>
          <ActionShortcutBar />
        </ThrowingCard>

        {/* 3. Sacred Anchor (Verse of the day) */}
        <ThrowingCard index={1}>
          <DailyVerseHeroCard />
        </ThrowingCard>

        {/* 4. Mock Feed / Additional Cards */}
        <ThrowingCard index={2}>
          <div className="rounded-3xl border border-dashed border-border/40 p-12 flex flex-col items-center justify-center text-center space-y-3 bg-white/10 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
              ✨
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-700">Konten lainnya sedang disiapkan</h3>
              <p className="text-xs text-muted-foreground max-w-[240px]">
                Feed komunitas dan refleksi harian akan muncul di sini setelah integrasi API Laravel selesai.
              </p>
            </div>
          </div>
        </ThrowingCard>
      </div>

      {/* Decorative Brand Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.5 }}
        className="text-[10px] font-bold uppercase tracking-[0.3em] text-center mt-12 text-slate-400"
      >
        Terpilih • Terhubung • Bertumbuh
      </motion.p>
    </div>
  );
}
