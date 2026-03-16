"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring, useMotionTemplate } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  LogIn,
  Plus,
  Sparkles,
  Users,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * DATA & CONFIGURATION
 * ──────────────────────────────────────────────────────────────────────────────
 */

const featureItems = [
    {
        id: 'channels',
        icon: BookOpen,
        title: 'Channels',
        description: 'Pelajaran terstruktur termasuk Sabbath School untuk pendalaman iman yang sistematis dan relevan.',
        href: '/channels',
        ctaLabel: 'Buka Channels',
        accent: 'violet' as const,
    },
    {
        id: 'bible',
        icon: BookMarked,
        title: 'Bible',
        description: 'Alkitab reader modern dengan pelacakan perjalanan rohani, bookmark, dan refleksi pribadi.',
        href: '/versehub/id',
        ctaLabel: 'Buka Bible',
        accent: 'blue' as const,
    },
    {
        id: 'community',
        icon: Users,
        title: 'Community',
        description: 'Bagikan berkat, kesaksian, dan permohonan doa dalam lingkungan komunitas yang aman.',
        href: '/community',
        ctaLabel: 'Buka Community',
        accent: 'emerald' as const,
    },
    {
        id: 'mentor',
        icon: Sparkles,
        title: 'Mentor',
        description: 'Panduan belajar Alkitab berbasis teks dengan Scripture Guide yang transparan dan mendalam.',
        href: '/versehub/id',
        ctaLabel: 'Buka Mentor',
        accent: 'cyan' as const,
    },
];

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * ATOMIC UI COMPONENTS
 * ──────────────────────────────────────────────────────────────────────────────
 */

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 backdrop-blur-sm', className)}>
            {children}
        </span>
    );
}

function FeatureCard({ icon: Icon, title, description, href, ctaLabel = 'Buka', accent = 'cyan' }: {
    icon: React.ElementType;
    title: string;
    description: string;
    href: string;
    ctaLabel?: string;
    accent?: 'cyan' | 'violet' | 'emerald' | 'blue';
}) {
    const accentMap = {
        cyan:    { icon: 'bg-cyan-400/10 text-cyan-400',     glow: 'rgba(34,211,238,0.15)' },
        violet:  { icon: 'bg-violet-400/10 text-violet-400', glow: 'rgba(167,139,250,0.15)' },
        emerald: { icon: 'bg-emerald-400/10 text-emerald-400',glow: 'rgba(52,211,153,0.15)' },
        blue:    { icon: 'bg-blue-400/10 text-blue-400',     glow: 'rgba(96,165,250,0.15)' },
    }[accent];

    return (
        <article 
            className="group relative flex flex-1 flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.06] p-8 md:p-12 backdrop-blur-3xl transition-all duration-500 shadow-premium ring-1 ring-white/5 min-h-[480px] md:min-h-[540px] justify-between" 
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(600px circle at 0% 0%, ${accentMap.glow}, transparent 70%)` }}
            />
            
            <div className="relative z-10 flex flex-col space-y-6 md:space-y-8">
                {/* Icon Block */}
                <div className={cn('flex h-14 w-14 items-center justify-center rounded-[1.25rem] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-xl ring-1 ring-white/10', accentMap.icon)}>
                    <Icon className="h-7 w-7" />
                </div>

                <div className="space-y-4">
                    <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">{title}</h3>
                    <p className="text-base md:text-lg leading-relaxed text-white/50 font-medium">{description}</p>
                </div>
            </div>

            <div className="relative z-10 pt-8">
                <Button asChild variant="outline" className="h-14 w-full rounded-2xl border-white/10 bg-white/[0.02] px-6 text-sm font-bold uppercase tracking-widest text-white/80 backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white active:scale-[0.97] relative overflow-hidden group/btn shadow-lg">
                    <Link href={href} className="group/cta inline-flex items-center justify-center gap-3">
                        <span className="relative z-10">{ctaLabel}</span>
                        <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover/cta:translate-x-2 relative z-10" />
                        <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:animate-[shine_1.5s_infinite]" />
                    </Link>
                </Button>
            </div>
        </article>
    );
}

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * STICKY STACKING ENGINE (iOS Native Refactor)
 * ──────────────────────────────────────────────────────────────────────────────
 */

function StickyStackScene({ 
    item, 
    index, 
    scrollYProgress,
    totalCards = 4
}: { 
    item: any; 
    index: number; 
    scrollYProgress: any;
    totalCards?: number;
}) {
    // 1. Fluid Scroll Interaction: Apply Spring for that smooth iOS bounce/intertia
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 400,
        damping: 40,
        mass: 1
    });

    const cardProgress = useTransform(smoothProgress, [0, 1], [0, totalCards - 1]);

    // 2. Define 5 Milestones: Entrance, Active, and 3 layers of stacking depth
    const inputRanges = [
        index - 1,   // Entering from below
        index,       // Active at top
        index + 1,   // Pushed back 1 layer
        index + 2,   // Pushed back 2 layers
        index + 3    // Pushed back 3 layers
    ];

    // Y Axis: Clean vertical stacks
    const y = useTransform(cardProgress, inputRanges, [
        120,    // Hidden below
        0,      // Active center
        -20,    // Recede 1
        -40,    // Recede 2
        -60     // Recede 3
    ]);

    // Scale: Soft shrinkage into the background
    const scale = useTransform(cardProgress, inputRanges, [
        1,      // Entrance size
        1,      // Active size
        0.95,   // Layer 1
        0.90,   // Layer 2
        0.85    // Layer 3
    ]);

    // Opacity: Dim as it gets buried
    const opacity = useTransform(cardProgress, inputRanges, [
        0,      // Invisible
        1,      // Full focus
        0.8,    // Layer 1
        0.6,    // Layer 2
        0.4     // Layer 3
    ]);

    // Blur: Dynamic Depth of Field (Native Feel)
    const blurValue = useTransform(cardProgress, inputRanges, [
        0,      // Sharp
        0,      // Sharp
        4,      // Layer 1 Blur
        8,      // Layer 2 Blur
        12      // Layer 3 Blur
    ]);

    // Brightness: Simulating shadow depth
    const brightnessValue = useTransform(cardProgress, inputRanges, [
        1,      // Normal
        1,      // Normal
        0.8,    // Layer 1
        0.6,    
        0.4     
    ]);

    const filter = useMotionTemplate`blur(${blurValue}px) brightness(${brightnessValue})`;

    return (
        <motion.div
            style={{
                position: 'absolute',
                inset: 0,
                opacity,
                scale,
                y,
                filter,
                zIndex: 10 + index,
                willChange: 'transform, opacity, filter',
                transformOrigin: 'top center'
            }}
        >
            <FeatureCard {...item} />
        </motion.div>
    );
}

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * LAYOUT DECORATIONS
 * ──────────────────────────────────────────────────────────────────────────────
 */

function Background() {
    return (
        <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-teal-950" />
            <div className={cn(
                'absolute inset-0',
                'bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)]',
                'bg-[length:24px_24px]',
                'animate-[twinkle_10s_ease-in-out_infinite]',
            )} />
            <div className="bg-grain absolute inset-0 mix-blend-overlay opacity-20" />
            
            {/* Ambient Diffused Orbs */}
            <div className="absolute -top-32 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[120px]" />
            <div className="absolute bottom-[-200px] right-[-200px] h-[760px] w-[760px] rounded-full bg-blue-600/5 blur-[140px]" />
            
            <style>{`
                @keyframes twinkle { 0%,100%{opacity:.18} 50%{opacity:.32} }
                @keyframes shine { from{transform:translateX(-100%) skewX(-15deg)} to{transform:translateX(250%)  skewX(-15deg)} }
            `}</style>
        </div>
    );
}

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * MAIN PAGE COMPONENT
 * ──────────────────────────────────────────────────────────────────────────────
 */

export default function LandingPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        const totalCards = featureItems.length;
        const idx = Math.min(totalCards - 1, Math.max(0, Math.round(latest * (totalCards - 1))));
        if (idx !== activeIndex) setActiveIndex(idx);
    });

    return (
        <div className="relative min-h-screen text-white selection:bg-cyan-400/30 overflow-x-hidden bg-slate-950">
            <Background />

            {/* Navbar */}
            <header className="relative z-30 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8 sm:px-8">
                <span className="tct-serif text-2xl font-bold tracking-tight text-white">
                    TheChosen<span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Talks</span>
                </span>
                <Button asChild variant="ghost" className="h-11 rounded-full bg-white/5 px-6 text-xs font-bold uppercase tracking-widest text-white/70 ring-1 ring-white/10 hover:bg-white/10 hover:text-white transition-all active:scale-95">
                    <Link href="/today" className="flex items-center gap-2"><LogIn size={14} /> Login</Link>
                </Button>
            </header>

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="flex min-h-[85dvh] flex-col items-center justify-center px-6 py-12">
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="w-full max-w-xl">
                        <div className="w-full rounded-[3.5rem] border border-white/10 bg-white/[0.03] px-8 py-14 text-center backdrop-blur-3xl shadow-[0_32px_100px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/5">
                            <div className="space-y-10">
                                <div className="flex justify-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_15px_40px_rgba(34,211,238,0.25)] ring-4 ring-white/5">
                                        <Users className="h-10 w-10 text-slate-950" strokeWidth={2.5} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h1 className="tct-serif text-5xl font-bold tracking-tight text-white leading-[1.1]">Bertumbuh<br />Bersama</h1>
                                    <p className="text-lg text-white/50 max-w-xs mx-auto leading-relaxed font-medium">Platform digital harian untuk inspirasi, doa, dan komunitas yang menguatkan.</p>
                                </div>
                                <Button asChild className="h-16 w-full rounded-[2rem] bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-sm uppercase tracking-widest shadow-2xl shadow-cyan-500/20 active:scale-[0.97] transition-all hover:brightness-110">
                                    <Link href="/today" className="flex items-center justify-center gap-3">Mulai Journey <ArrowRight size={20} strokeWidth={3} /></Link>
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Sticky Experience Stage */}
                <section ref={containerRef} className="relative h-[280vh] mb-24">
                    <div className="sticky top-0 h-[100dvh] flex items-center justify-center overflow-hidden">
                        <div className="mx-auto w-full max-w-6xl px-6 grid lg:grid-cols-2 gap-12 items-center">
                            
                            <div className="space-y-6 md:space-y-10">
                                <Badge><Sparkles size={12} className="text-brand" /> Ecosystem Modules</Badge>
                                <h2 className="tct-serif text-5xl sm:text-7xl leading-[1.05] tracking-tight text-white font-bold">
                                    Satu Platform,<br />
                                    <span className="text-white/20">Banyak Cara</span><br />
                                    <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Bertumbuh.</span>
                                </h2>
                                <p className="text-lg md:text-xl text-white/40 max-w-md leading-relaxed font-medium">
                                    Modul terintegrasi yang didesain untuk membantu setiap Chosen People menemukan ritme spiritualnya.
                                </p>
                                
                                <div className="flex items-center gap-3 pt-4">
                                    {featureItems.map((_, i) => (
                                         <div 
                                            key={i} 
                                            className={cn(
                                                "rounded-full transition-all duration-500", 
                                                i === activeIndex 
                                                    ? "w-10 h-1.5 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]" 
                                                    : "w-1.5 h-1.5 bg-white/10"
                                            )} 
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="relative h-[480px] md:h-[540px] w-full max-w-xl mx-auto lg:mx-0">
                                {featureItems.map((item, i) => (
                                    <StickyStackScene 
                                        key={item.id} 
                                        item={item} 
                                        index={i} 
                                        scrollYProgress={scrollYProgress}
                                        totalCards={featureItems.length}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA & Trust Layer */}
                <section className="px-6 py-24 bg-white/[0.02] border-y border-white/5 backdrop-blur-3xl">
                    <div className="mx-auto max-w-4xl text-center space-y-10">
                        <div className="flex justify-center">
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                <ShieldCheck size={12} className="mr-1.5" /> Trusted Ecosystem
                            </Badge>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">Membangun Fondasi Rohani Yang Sehat & Aman.</h2>
                        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto font-medium">
                            Bukan sekadar website, melainkan ekosistem digital yang dirancang untuk menjaga privasi, kejujuran refleksi, dan kedalaman iman Anda.
                        </p>
                        <div className="pt-4">
                            <Button asChild className="h-16 px-12 rounded-[2rem] bg-white text-slate-950 font-black text-sm uppercase tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95">
                                <Link href="/register"> Buat Akun Gratis</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                <footer className="pb-32 pt-20 text-center space-y-8 px-6">
                    <div className="inline-flex items-center gap-3 opacity-30">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">The Chosen Talks</h2>
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    </div>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">© 2026 — Built for the Chosen People by WillBerth.</p>
                    <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-white/30">
                        <Link href="/privacy" className="hover:text-cyan-400 transition-colors ">Privacy</Link>
                        <Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms</Link>
                        <a href="https://instagram.com/willberth.channel/" target="_blank" className="hover:text-cyan-400 transition-colors">Instagram</a>
                    </div>
                </footer>
            </main>
        </div>
    );
}
