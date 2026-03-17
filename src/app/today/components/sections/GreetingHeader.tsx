'use client';

import { useUser } from '@/firebase/auth/use-user';
import { MessageSquare, Bell } from 'lucide-react';
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
        if (h < 5) return '🌙';
        if (h < 11) return '☀️';
        if (h < 15) return '🌤️';
        if (h < 19) return '🌇';
        return '✨';
    };

    const dateLabel = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

    return (
        <div className="-mx-4 px-4 pb-4 pt-2 md:mx-0 md:px-0 md:pb-0">
            <div className="relative overflow-hidden rounded-[32px] md:rounded-[40px] border-0 glass-card tct-card-pad">
                {/* Gradient accent blobs */}
                <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-brand/15 blur-[40px]" />
                <div className="pointer-events-none absolute bottom-0 left-10 h-24 w-24 rounded-full bg-brand/10 blur-[40px]" />

                <div className="mb-4 flex items-center gap-2">
                    <span className="text-xl md:text-2xl">{getGreetingEmoji()}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{dateLabel}</span>
                </div>

                <div className="flex items-end justify-between gap-4">
                    <div className="min-w-0">
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            Good {getDayPart()}, {userName}
                        </p>
                        <h1 className="tct-h1 text-foreground">
                            Chosen People
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface/50 text-muted-foreground shadow-sm ring-1 ring-border/50 transition-colors hover:text-brand hover:bg-surface tct-pressable">
                            <MessageSquare className="h-5 w-5" />
                        </button>
                        <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface/50 text-muted-foreground shadow-sm ring-1 ring-border/50 transition-colors hover:text-brand hover:bg-surface tct-pressable">
                            <Bell className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
