'use client';

import Link from 'next/link';
import { PenSquare, BookOpen, LayoutGrid, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
    {
        icon: PenSquare,
        label: 'Berbagi',
        href: '/community',
        gradient: 'from-rose-400 to-pink-500',
    },
    {
        icon: BookOpen,
        label: 'Baca',
        href: '/versehub/id',
        gradient: 'from-blue-400 to-indigo-500',
    },
    {
        icon: LayoutGrid,
        label: 'Ikut',
        href: '/channels',
        gradient: 'from-emerald-400 to-teal-500',
    },
    {
        icon: Inbox,
        label: 'Pesan',
        href: '/inbox',
        gradient: 'from-violet-400 to-purple-500',
    },
];

export default function ActionShortcutBar() {
    return (
        <div className="grid grid-cols-4 gap-3 py-2">
            {actions.map((action, i) => (
                <Link
                    key={i}
                    href={action.href}
                    className="group flex flex-col items-center gap-2"
                >
                    <div
                        className={cn(
                            'relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-[22px]',
                            'bg-white/40 dark:bg-white/5 backdrop-blur-md transition-all duration-300',
                            'ring-1 ring-black/[0.04] dark:ring-white/[0.08]',
                            'shadow-[0_4px_12px_rgba(0,0,0,0.03)] group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]',
                            'group-hover:-translate-y-1 group-active:scale-90',
                        )}
                    >
                        {/* Subtle inner glow */}
                        <div
                            className={cn(
                                'absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-20 bg-gradient-to-br',
                                action.gradient,
                            )}
                        />

                        <div
                            className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md',
                                action.gradient,
                            )}
                        >
                            <action.icon className="h-5 w-5 text-white drop-shadow-sm" />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 transition-colors group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300">
                        {action.label}
                    </span>
                </Link>
            ))}
        </div>
    );
}
