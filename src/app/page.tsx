"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  LogIn,
  Plus,
  Sparkles,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ─────────────────────────── Background ────────────────────────── */
function Background() {
    return (
        <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-teal-950" />
            <div className={cn(
                'absolute inset-0',
                'bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)]',
                'bg-[length:24px_24px]',
                'animate-[twinkle_10s_ease-in-out_infinite]',
            )} />
            <div className="bg-grain absolute inset-0 mix-blend-overlay" />
            <div className="absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/8 blur-3xl animate-[floatA_16s_ease-in-out_infinite]" />
            <div className="absolute bottom-[-200px] right-[-200px] h-[560px] w-[560px] rounded-full bg-blue-600/8 blur-3xl animate-[floatB_20s_ease-in-out_infinite]" />
            <div className="absolute bottom-[-160px] left-[-200px] h-[520px] w-[520px] rounded-full bg-teal-500/8 blur-3xl animate-[floatC_22s_ease-in-out_infinite]" />
            <style>{`
                @keyframes floatA { 0%,100%{transform:translate(-50%,0) scale(1)} 50%{transform:translate(-50%,22px) scale(1.04)} }
                @keyframes floatB { 0%,100%{transform:translate(0,0) scale(1);opacity:.7} 50%{transform:translate(-20px,-16px) scale(1.06);opacity:1} }
                @keyframes floatC { 0%,100%{transform:translate(0,0) scale(1);opacity:.6} 50%{transform:translate(20px,-12px) scale(1.04);opacity:.9} }
                @keyframes twinkle { 0%,100%{opacity:.18} 50%{opacity:.32} }
                @keyframes shine { from{transform:translateX(-100%) skewX(-15deg)} to{transform:translateX(250%) skewX(-15deg)} }
            `}</style>
        </div>
    );
}

/* ─────────────────────────── Badge ─────────────────────────── */
function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50 backdrop-blur-sm', className)}>
            {children}
        </span>
    );
}

/* ─────────────────────────── Feature Card ─────────────────────────── */
type Accent = 'cyan' | 'violet' | 'emerald' | 'blue';

function FeatureCard({ icon: Icon, title, description, href, ctaLabel = 'Buka', accent = 'cyan' }: {
    icon: React.ElementType;
    title: string;
    description: string;
    href: string;
    ctaLabel?: string;
    accent?: Accent;
}) {
    const accentMap: Record<Accent, { icon: string; glow: string }> = {
        cyan:    { icon: 'bg-cyan-400/10 text-cyan-400',     glow: 'rgba(34,211,238,0.22)' },
        violet:  { icon: 'bg-violet-400/10 text-violet-400', glow: 'rgba(167,139,250,0.22)' },
        emerald: { icon: 'bg-emerald-400/10 text-emerald-400',glow: 'rgba(52,211,153,0.22)' },
        blue:    { icon: 'bg-blue-400/10 text-blue-400',     glow: 'rgba(96,165,250,0.22)' },
    };
    const { icon: iconCls, glow } = accentMap[accent];

    return (
        <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/20">
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: `radial-gradient(400px circle at 0% 0%, ${glow}, transparent 60%)` }}
            />
            <div className="relative z-10 flex flex-1 flex-col">
                <div className={cn('mb-5 flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3', iconCls)}>
                    <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
                <p className="flex-1 text-sm leading-relaxed text-white/50">{description}</p>
                <div className="mt-5">
                    <Button asChild variant="outline" className="h-9 w-full rounded-full border-white/12 bg-white/[0.03] px-4 text-xs font-semibold tracking-wide text-white/60 backdrop-blur-sm transition-all duration-300 hover:border-white/25 hover:bg-white/8 hover:text-white active:scale-[0.98] relative overflow-hidden group/btn">
                        <Link href={href} className="group/cta inline-flex items-center justify-center gap-1.5">
                            <span className="relative z-10">{ctaLabel}</span>
                            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/cta:translate-x-1 relative z-10" />
                            <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:animate-[shine_1.5s_infinite]" />
                        </Link>
                    </Button>
                </div>
            </div>
        </article>
    );
}

/* ─────────────────── Quick Access Launcher ─────────────────── */
function QuickAccessLauncher() {
    const [open, setOpen] = useState(false);
    const items = [
        { href: '/channels',    label: 'Channels',  icon: BookOpen,   tone: 'from-violet-400 to-fuchsia-500' },
        { href: '/versehub/id', label: 'Bible',      icon: BookMarked, tone: 'from-blue-400 to-indigo-500' },
        { href: '/today',       label: 'Today',      icon: Sparkles,   tone: 'from-cyan-400 to-teal-500' },
        { href: '/community',   label: 'Community',  icon: Users,      tone: 'from-emerald-400 to-green-500' },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex flex-col items-center gap-2">
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.92 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="mb-2 grid grid-cols-2 gap-2"
                    >
                        {items.map((item, i) => (
                            <motion.div key={item.href} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.045 }}>
                                <Link href={item.href} className="group flex w-[88px] flex-col items-center gap-2 rounded-2xl bg-slate-900/90 px-2 py-3 ring-1 ring-white/12 shadow-[0_8px_28px_rgba(0,0,0,0.50)] backdrop-blur-md transition-all hover:bg-slate-800/90 hover:ring-white/22 active:scale-[0.96]">
                                    <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm flex-shrink-0', item.tone)}>
                                        <item.icon className="h-4 w-4 text-slate-950" />
                                    </span>
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50 group-hover:text-white/75 transition-colors">{item.label}</span>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className={cn(
                    'relative inline-flex h-12 w-12 items-center justify-center rounded-full ring-1 ring-white/20 transition-all duration-200',
                    open ? 'bg-slate-800 text-white shadow-[0_8px_24px_rgba(15,23,42,0.6)]' : 'bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950 shadow-[0_12px_32px_rgba(34,211,238,0.38)]',
                )}
            >
                <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="flex items-center justify-center">
                    <Plus className="h-5 w-5" />
                </motion.span>
            </button>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">Quick Launcher</p>
        </div>
    );
}

/* ─────────────────────────── Hero Icon Row ─────────────────────────── */
function HeroIconRow() {
    const items = [
        { icon: BookOpen, label: 'Read' },
        { icon: Users,    label: 'Share' },
        { icon: Sparkles, label: 'Inspiring' },
    ];
    return (
        <div className="flex justify-center gap-7">
            {items.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/8 shadow-[0_0_14px_rgba(34,211,238,0.15)]">
                        <Icon className="h-5 w-5 text-cyan-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-400/60">{label}</span>
                </div>
            ))}
        </div>
    );
}

/* ─────────────────────────── Dot Indicator ─────────────────────────── */
function DotIndicator({ count, active }: { count: number; active: number }) {
    return (
        <div className="flex items-center gap-2 mt-8">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "rounded-full transition-all duration-500",
                        i === active ? "w-6 h-2 bg-cyan-400" : "w-2 h-2 bg-white/20"
                    )}
                />
            ))}
        </div>
    );
}

/* ─────────────────────────── Feature Items ─────────────────────────── */
const featureItems = [
    { icon: BookOpen,   title: 'Channels',   description: 'Pelajaran terstruktur termasuk Sabbath School untuk pendalaman iman yang sistematis.', href: '/channels',    accent: 'violet'  as Accent },
    { icon: BookMarked, title: 'Bible',       description: 'Alkitab reader modern dengan pelacakan perjalanan rohani dan refleksi pribadi.',        href: '/versehub/id', accent: 'blue'    as Accent },
    { icon: Sparkles,   title: 'Today',       description: 'Inspirasi harian, ayat hari ini, dan ringkasan aktivitas rohani Anda.',                 href: '/today',       accent: 'cyan'    as Accent },
    { icon: Users,      title: 'Community',   description: 'Berbagi berkat, berdiskusi, dan bertumbuh bersama saudara seiman.',                      href: '/community',   accent: 'emerald' as Accent },
];

/* ─────────────────────────── Landing Page ─────────────────────────── */
export default function LandingPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Map scroll 0→1 into 4 equal segments — one card per segment
    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        const idx = Math.min(Math.floor(latest * featureItems.length), featureItems.length - 1);
        setActiveIndex(idx);
    });

    return (
        <div className="relative min-h-screen scroll-smooth text-white selection:bg-cyan-400/30 overflow-x-hidden">
            <Background />

            {/* Navbar */}
            <header className="relative z-30 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
                <span className="tct-serif text-xl font-normal tracking-tight sm:text-2xl">
                    TheChoosen<span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Talks</span>
                </span>
                <Button asChild variant="ghost" className="h-10 rounded-full bg-white/5 px-4 text-xs font-semibold text-white/70 ring-1 ring-white/10 hover:bg-white/10">
                    <Link href="/today" className="inline-flex items-center gap-1.5"><LogIn size={14} /> Login</Link>
                </Button>
            </header>

            <main className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 pt-4 sm:px-8">

                {/* ── Hero Section ── */}
                <section className="flex min-h-[85dvh] flex-col items-center justify-center pb-10 pt-6">
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="w-full max-w-[500px]">
                        <div className="w-full rounded-[44px] border border-white/10 bg-white/[0.04] px-8 py-12 text-center backdrop-blur-2xl sm:px-12 sm:py-14 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                            <div className="space-y-8">
                                <div className="flex justify-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_8px_32px_rgba(34,211,238,0.3)]">
                                        <Users className="h-8 w-8 text-slate-950" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h1 className="tct-serif text-4xl font-normal tracking-tight sm:text-5xl">Bertumbuh Bersama</h1>
                                    <p className="text-base text-white/65">Ruang harian Anda untuk inspirasi, doa, dan komunitas yang menguatkan.</p>
                                </div>
                                <HeroIconRow />
                                <Button asChild className="h-14 w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 active:scale-[0.98]">
                                    <Link href="/today" className="flex items-center justify-center gap-2">Buka Sekarang <ArrowRight size={18} /></Link>
                                </Button>
                            </div>
                        </div>
                        <div className="mt-10 flex flex-col items-center gap-2 text-white/25">
                            <span className="text-[10px] uppercase tracking-[0.22em]">Scroll to explore</span>
                            <div className="h-10 w-px bg-gradient-to-b from-cyan-400/40 to-transparent" />
                        </div>
                    </motion.div>
                </section>

                {/* ── Features Sticky Section ──
                    Strategy: tall scroll container (400vh) + sticky inner panel.
                    scrollYProgress 0→1 maps to card index 0→3.
                    AnimatePresence mode="wait" ensures only ONE card renders at a time.
                    This eliminates all overlapping/stacking visual bugs.
                */}
                <section ref={containerRef} className="relative h-[400vh]">
                    <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
                        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                            {/* Left column: fixed heading + dots */}
                            <div className="space-y-6">
                                <Badge><Sparkles size={12} /> Platform Fitur</Badge>
                                <h2 className="tct-serif text-4xl sm:text-6xl leading-[1.1] tracking-tight">
                                    Satu Platform,<br />
                                    <span className="text-white/40">Banyak Cara</span><br />
                                    <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Bertumbuh.</span>
                                </h2>
                                <p className="text-lg text-white/45 max-w-md leading-relaxed">
                                    Didesain untuk membantu setiap Chosen People menemukan ritme spiritualnya melalui ekosistem yang terintegrasi.
                                </p>
                                <DotIndicator count={featureItems.length} active={activeIndex} />
                            </div>

                            {/* Right column: ONE card at a time via AnimatePresence */}
                            <div className="w-full max-w-xl mx-auto">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeIndex}
                                        initial={{ opacity: 0, y: 48, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0,  scale: 1    }}
                                        exit={{    opacity: 0, y: -48, scale: 0.96 }}
                                        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        <FeatureCard {...featureItems[activeIndex]} />
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                        </div>
                    </div>
                </section>

                {/* ── Footer ── */}
                <footer className="border-t border-white/5 pb-32 pt-16 text-center">
                    <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-400/40 mb-3">Terpilih • Terhubung • Bertumbuh</h2>
                    <p className="text-xs text-white/25">© 2026 — TheChoosenTalks. Built for the Chosen People.</p>
                    <div className="mt-5 flex justify-center gap-6 text-xs text-white/20">
                        <Link href="/privacy" className="hover:text-white/60">Privacy</Link>
                        <Link href="/terms" className="hover:text-white/60">Terms</Link>
                        <a href="https://instagram.com/willberth.channel/" target="_blank" className="hover:text-white/60">Instagram</a>
                    </div>
                </footer>

            </main>

            <QuickAccessLauncher />
        </div>
    );
}