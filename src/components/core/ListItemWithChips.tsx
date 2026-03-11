"use client";

import { cn } from '@/lib/utils';
import React from 'react';

type ListItemWithChipsProps = {
    avatarUrl?: string;
    title: string;
    subtitle?: string;
    chip?: string;
    status?: string;
    meta?: string;
    trailing?: React.ReactNode;
    className?: string;
    onClick?: () => void;
};

export default function ListItemWithChips({
    avatarUrl,
    title,
    subtitle,
    chip,
    status,
    meta,
    trailing,
    className,
    onClick
}: ListItemWithChipsProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 shadow-soft ring-1 ring-black/[0.03] transition-all hover:ring-slate-900/10 active:scale-[0.99] cursor-pointer',
                className,
            )}
        >
            <div className="flex items-center gap-4">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={title}
                        className="h-12 w-12 rounded-2xl object-cover shadow-sm"
                    />
                ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-[13px] font-bold text-slate-400">
                        {title
                            .split(' ')
                            .map((word) => word[0])
                            .join('')}
                    </div>
                )}
                <div className="min-w-0">
                    <p className="font-bold text-[15px] text-slate-900 leading-tight truncate">{title}</p>
                    {subtitle ? (
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">
                            {subtitle}
                        </p>
                    ) : null}
                    {chip ? (
                        <span className="mt-2 inline-flex rounded-full bg-slate-900 text-white px-3 py-1 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">
                            {chip}
                        </span>
                    ) : null}
                </div>
            </div>
            <div className="text-right shrink-0">
                {status ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-600 px-2.5 py-1 text-[10px] font-bold border border-emerald-100 uppercase tracking-widest">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {status}
                    </span>
                ) : null}
                {meta ? <div className="mt-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">{meta}</div> : null}
                {trailing ? <div className="mt-2">{trailing}</div> : null}
            </div>
        </div>
    );
}
