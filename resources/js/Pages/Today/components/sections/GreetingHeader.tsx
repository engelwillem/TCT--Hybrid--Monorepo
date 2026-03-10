import { usePage } from '@inertiajs/react';
import ChatPopover from '@/Components/core/ChatPopover';
import NotificationsPopover from '@/Components/core/NotificationsPopover';

export default function GreetingHeader() {
    const { auth } = usePage().props as any;
    const userName = auth?.user?.name ?? 'Friend';

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
            <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 px-6 py-5 shadow-sm backdrop-blur-xl dark:border-white/8 dark:bg-slate-900/60">
                {/* Gradient accent blobs */}
                <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-cyan-400/15 blur-2xl" />
                <div className="pointer-events-none absolute bottom-0 left-10 h-20 w-20 rounded-full bg-blue-400/10 blur-2xl" />

                {/* Date pill */}
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100/80 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:bg-white/8 dark:text-slate-400">
                    <span>{getGreetingEmoji()}</span>
                    <span>{dateLabel}</span>
                </div>

                <div className="flex items-end justify-between gap-4">
                    <div className="min-w-0">
                        <p className="mb-0.5 text-[12px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                            Good {getDayPart()}, {userName}
                        </p>
                        <h1 className="tct-serif tct-brand-gradient truncate text-[26px] font-normal leading-tight md:text-4xl">
                            Chosen People
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <ChatPopover />
                        <NotificationsPopover />
                    </div>
                </div>
            </div>
        </div>
    );
}
