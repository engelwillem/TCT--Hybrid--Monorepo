"use client";

import { cn } from '@/lib/utils';
import React from 'react';

type TabOption = {
    id: string;
    label: string;
};

type SegmentedTabsProps = {
    options: TabOption[];
    activeId: string;
    onChange?: (id: string) => void;
    className?: string;
};

export default function SegmentedTabs({
    options,
    activeId,
    onChange,
    className,
}: SegmentedTabsProps) {
    return (
        <div
            className={cn(
                'flex items-center rounded-2xl bg-white p-1.5 shadow-soft ring-1 ring-black/[0.03]',
                className,
            )}
        >
            {options.map((option) => {
                const isActive = option.id === activeId;
                return (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => onChange?.(option.id)}
                        className={cn(
                            'flex-1 rounded-xl px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all',
                            isActive
                                ? 'bg-slate-900 text-white shadow-lg'
                                : 'text-slate-400 hover:text-slate-900',
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
