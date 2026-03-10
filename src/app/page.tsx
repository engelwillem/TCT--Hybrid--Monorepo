"use client";

import React from 'react';
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, Users, Sparkles, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      {/* ── Background decoration ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-teal-950" />
        <div className="bg-grain absolute inset-0 opacity-[0.05]" />

        {/* Glow orbs */}
        <div className="absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-100px] right-[-100px] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[100px]" />
      </div>

      {/* ── Hero section ── */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-32">
        <header className="flex items-center justify-between py-6 mb-20">
          <div className="tct-serif text-2xl font-normal">
            TheChosen<span className="text-cyan-400">Talks</span>
          </div>
          <Button asChild variant="ghost" className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10">
            <Link href="/today" className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </Link>
          </Button>
        </header>

        <section className="flex flex-col items-center justify-center text-center space-y-12 py-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-[540px] rounded-[48px] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-10 md:p-16 shadow-2xl relative"
          >
            {/* Logo box */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Users className="w-10 h-10 text-slate-950" />
              </div>
            </div>

            <div className="space-y-4 mb-10">
              <h1 className="tct-serif text-4xl md:text-5xl font-normal leading-tight">
                Bertumbuh <br /> Bersama
              </h1>
              <p className="text-white/60 text-lg leading-relaxed">
                Ruang harian Anda untuk inspirasi, doa, <br className="hidden md:block" /> dan komunitas yang menguatkan.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <Button asChild size="lg" className="h-16 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-lg hover:shadow-cyan-500/20 hover:shadow-2xl transition-all active:scale-95">
                <Link href="/today" className="flex items-center gap-3">
                  <span>Mulai Perjalanan</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <div className="flex justify-center gap-6 pt-4 text-white/30">
                <div className="flex flex-col items-center gap-1">
                  <BookOpen size={20} className="text-cyan-400/50" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Read</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Users size={20} className="text-cyan-400/50" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Connect</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Sparkles size={20} className="text-cyan-400/50" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Grow</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex flex-col items-center gap-4 text-white/20 pt-10"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Scroll to explore features</span>
            <div className="w-px h-12 bg-gradient-to-b from-cyan-400/40 to-transparent" />
          </motion.div>
        </section>

        {/* Feature Preview Mini-section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-32">
          <FeatureCard
            icon={BookOpen}
            title="Buku Pelajaran"
            desc="Akses Sabbath School dan Channels pembinaan iman yang terstruktur."
            href="/channels"
          />
          <FeatureCard
            icon={Sparkles}
            title="VerseHub"
            desc="Alkitab reader modern dengan fitur favorite dan tracking progres harian."
            href="/versehub/id"
          />
        </section>

        <footer className="mt-40 pt-10 border-t border-white/5 text-center space-y-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400/40">
            Terpilih • Terhubung • Bertumbuh
          </div>
          <p className="text-xs text-white/20">© 2026 — TheChosenTalks. Built for the Chosen People.</p>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, href }: { icon: any, title: string, desc: string, href: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl group cursor-pointer transition-all"
    >
      <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-colors">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed mb-6">{desc}</p>
      <Link href={href} className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2 hover:underline">
        Explore <ArrowRight size={14} />
      </Link>
    </motion.div>
  );
}
