"use client";

import React from 'react';
import { motion } from "framer-motion";

export default function CommunityPage() {
  return (
    <div className="mx-auto w-full max-w-[720px] space-y-5 pb-28 pt-10 px-4">
      <div className="text-center space-y-2">
        <h1 className="tct-serif tct-brand-gradient text-3xl font-normal">Community</h1>
        <p className="text-sm text-muted-foreground">Tempat bercerita dan berbagi iman bersama Chosen People.</p>
      </div>

      <div className="mt-12 rounded-3xl border border-dashed border-border/40 p-20 flex flex-col items-center justify-center text-center space-y-4 bg-white/5 backdrop-blur-sm">
        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 shadow-soft">
          <span>🫂</span>
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-slate-700">Fitur Komunitas Segera Datang</h3>
          <p className="text-xs text-muted-foreground max-w-[280px]">
            Kami sedang menyiapkan integrasi Firebase dan Laravel untuk menghadirkan percakapan real-time di sini.
          </p>
        </div>
      </div>
    </div>
  );
}
