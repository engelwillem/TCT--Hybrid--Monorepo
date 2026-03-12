'use client';

import { useUser } from '@/firebase/auth/use-user';
import { MessageSquare, Bell, Calendar } from 'lucide-react';
export default function GreetingHeader() {
    const { user } = useUser();
    const userName = user?.displayName ?? 'Friend';

    const now = new Date();
    const h = now.getHours();

    const getDayPart = () => {
        if (h < 11) return 'morning';
        if (h < 15) return 'afternoon';
        if (h < 19) return 'evening';
        return 'night';
    };

    const getGreetingEmoji = () => {
        return <Calendar className="h-3.5 w-3.5 text-slate-400" />;
    };

    const dateLabel = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

    return (
        <div className="-mx-4 px-4 pb-4 pt-2 md:mx-0 md:px-0 md:pb-0">
            <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/[0.02] px-8 py-7 shadow-2xl backdrop-blur-2xl">
                {/* Gradient accent blobs */}
                <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-cyan-400/15 blur-2xl" />
                <div className="pointer-events-none absolute bottom-0 left-10 h-20 w-20 rounded-full bg-blue-400/10 blur-2xl" />

                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-[10px] font-bold text-amber-500 shadow-sm uppercase tracking-[0.15em]">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{dateLabel}</span>
                </div>

                <div className="flex items-end justify-between gap-4">
                    <div className="min-w-0">
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
                            Good {getDayPart()}, {userName}
                        </p>
                        <h1 className="tct-serif bg-gradient-to-r from-sky-400 via-white to-sky-400 bg-clip-text text-transparent truncate text-3xl font-bold leading-tight md:text-5xl">
                            Chosen People
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Mock popovers for now to focus on layout parity */}
                        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/50 backdrop-blur-md ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10">
                            <MessageSquare className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </button>
                        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/50 backdrop-blur-md ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10">
                            <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
