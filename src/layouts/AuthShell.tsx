'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

// Mock icons for placeholder (until AppIcons are ported)
const IconChevronLeft = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

type AuthShellProps = {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    topHref?: string;
    className?: string;
};

function Background() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Base gradient - 100% Parity */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-teal-950" />

            {/* Cosmic particle texture (radial dots) */}
            <div
                className={cn(
                    'absolute inset-0 opacity-25',
                    "bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.10)_1px,transparent_0)]",
                    'bg-[length:22px_22px]',
                    'animate-[twinkle_8s_ease-in-out_infinite]',
                )}
            />

            {/* Soft glowing orbs */}
            <div className="absolute -top-28 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl animate-[float_14s_ease-in-out_infinite]" />
            <div className="absolute -bottom-44 right-[-180px] h-[560px] w-[560px] rounded-full bg-blue-500/10 blur-3xl animate-[float2_18s_ease-in-out_infinite]" />
            <div className="absolute -bottom-40 left-[-180px] h-[520px] w-[520px] rounded-full bg-teal-400/10 blur-3xl animate-[float3_20s_ease-in-out_infinite]" />

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translate(-50%, 0px) scale(1); opacity: 0.9; }
                    50% { transform: translate(-50%, 18px) scale(1.03); opacity: 1; }
                }
                @keyframes float2 {
                    0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.7; }
                    50% { transform: translate(-18px, -14px) scale(1.05); opacity: 0.95; }
                }
                @keyframes float3 {
                    0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.6; }
                    50% { transform: translate(18px, -10px) scale(1.04); opacity: 0.9; }
                }
                @keyframes twinkle {
                    0%, 100% { opacity: 0.16; filter: blur(0px); }
                    50% { opacity: 0.30; filter: blur(0.2px); }
                }
            `}</style>
        </div>
    );
}

export default function AuthShell({
    title,
    subtitle,
    children,
    topHref = '/',
    className,
}: AuthShellProps) {
    return (
        <div className="relative min-h-screen text-white">
            <Background />

            <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-10">
                {/* Back button (mobile): app-like, safe-area aware */}
                <div className="absolute left-4 top-[calc(env(safe-area-inset-top)+16px)] z-10 sm:hidden">
                    <Link
                        href={topHref}
                        className={cn(
                            'flex h-11 w-11 items-center justify-center rounded-full',
                            'border border-white/10 bg-white/5 backdrop-blur-xl',
                            'text-white/80 shadow-soft ring-1 ring-white/10',
                            'transition hover:text-white active:scale-[0.98]',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40 focus-visible:ring-offset-0',
                        )}
                    >
                        <IconChevronLeft className="h-5 w-5" />
                    </Link>
                </div>
                
                <header className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                        TheChosen
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            Talks
                        </span>
                    </h1>
                    {subtitle ? (
                        <p className="text-sm text-white/55">{subtitle}</p>
                    ) : (
                        <p className="text-sm text-white/55">Choose n Talks</p>
                    )}
                </header>

                <main className="flex flex-1 items-center justify-center py-10">
                    {/* Back button (desktop) */}
                    <div className="hidden sm:flex">
                        <Link
                            href={topHref}
                            className={cn(
                                'absolute left-6 top-10',
                                'flex h-10 w-10 items-center justify-center rounded-full',
                                'border border-white/10 bg-white/5 backdrop-blur-xl',
                                'text-white/70 shadow-soft ring-1 ring-white/10',
                                'transition hover:text-white active:scale-[0.98]',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40 focus-visible:ring-offset-0',
                            )}
                        >
                            <IconChevronLeft className="h-5 w-5" />
                        </Link>
                    </div>

                    <Card
                        className={cn(
                            'w-full max-w-[440px]',
                            'rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl',
                            'shadow-[0_0_0_1px_rgba(34,211,238,0.15),0_10px_40px_rgba(34,211,238,0.15)]',
                            className,
                        )}
                    >
                        <CardContent className="p-6 sm:p-8">
                            {children}
                        </CardContent>
                    </Card>
                </main>

                <footer className="pb-2 text-center text-xs text-white/35">
                    <a
                        href="https://www.instagram.com/willberth.channel/"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-white/70 transition-colors"
                    >
                        © Copyright 2026 — WillBerth Channel
                    </a>
                </footer>
            </div>
        </div>
    );
}
