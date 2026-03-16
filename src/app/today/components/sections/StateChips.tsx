'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Heart, Cloudy, Sun, Wind, Flame } from 'lucide-react';

export type SpiritualState = 'fresh' | 'anxious' | 'grateful' | 'weary' | 'on-fire';

interface StateChipsProps {
    activeState: SpiritualState;
    onChange: (state: SpiritualState) => void;
}

const STATES: { id: SpiritualState; label: string; icon: any; color: string }[] = [
    { id: 'fresh', label: 'Mulai Hari', icon: Sun, color: 'text-amber-500 bg-amber-500/10 ring-amber-500/20' },
    { id: 'anxious', label: 'Lagi Cemas?', icon: Cloudy, color: 'text-sky-500 bg-sky-500/10 ring-sky-500/20' },
    { id: 'grateful', label: 'Bersyukur', icon: Heart, color: 'text-rose-500 bg-rose-500/10 ring-rose-500/20' },
    { id: 'weary', label: 'Lelah', icon: Wind, color: 'text-slate-400 bg-slate-500/10 ring-slate-500/20' },
    { id: 'on-fire', label: 'Semangat', icon: Flame, color: 'text-orange-500 bg-orange-500/10 ring-orange-500/20' },
];

export default function StateChips({ activeState, onChange }: StateChipsProps) {
    return (
        <div className="-mx-4 flex overflow-x-auto px-4 pb-4 pt-2 md:mx-0 md:px-0 md:pb-2 no-scrollbar">
            <div className="flex gap-2">
                {STATES.map((state) => {
                    const isActive = activeState === state.id;
                    const Icon = state.icon;
                    return (
                        <button
                            key={state.id}
                            onClick={() => onChange(state.id)}
                            className={cn(
                                'relative flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-[13px] font-medium transition-all duration-300',
                                isActive
                                    ? state.color + ' ring-1'
                                    : 'bg-surface hover:bg-surface-muted text-muted-foreground ring-1 ring-border/50'
                            )}
                        >
                            <Icon className={cn('h-4 w-4', isActive ? '' : 'text-muted-foreground/70')} />
                            {state.label}
                            {isActive && (
                                <motion.div
                                    layoutId="active-state-indicator"
                                    className="absolute inset-0 rounded-full border-2 border-current opacity-10"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
