"use client";

import React from 'react';
import { motion } from "framer-motion";

export default function ChannelsPage() {
  return (
    <div className="mx-auto w-full max-w-[720px] space-y-5 pb-28 pt-10 px-4">
      <div className="text-center space-y-2">
        <h1 className="tct-serif tct-brand-gradient text-3xl font-normal">Channels</h1>
        <p className="text-sm text-muted-foreground">Eksplorasi pembinaan iman yang terstruktur.</p>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Sabbath School', icon: '📖', color: 'bg-emerald-50 text-emerald-600' },
          { title: 'Family Life', icon: '🏠', color: 'bg-blue-50 text-blue-600' },
          { title: 'Faith Journey', icon: '🗺️', color: 'bg-amber-50 text-amber-600' },
          { title: 'God First', icon: '✨', color: 'bg-purple-50 text-purple-600' }
        ].map((channel, i) => (
          <div key={i} className="rounded-3xl p-6 bg-white/60 border border-white/40 shadow-sm backdrop-blur-xl flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-soft", channel.color)}>
              {channel.icon}
            </div>
            <div>
              <h3 className="font-bold text-slate-700">{channel.title}</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Coming Soon</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}