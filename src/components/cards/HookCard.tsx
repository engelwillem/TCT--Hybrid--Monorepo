'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { MessageSquare, BookOpenText, Bookmark, Share2, Sparkles, Flame, MoveRight } from 'lucide-react';

export type HookActionType = 'pray' | 'reflect' | 'discuss' | 'save' | 'share';

export interface HookCardProps {
    hookText: string;
    verseReference: string;
    relevanceText: string;
    primaryAction: {
        type: HookActionType;
        href: string;
        label?: string;
    };
    secondaryActions?: HookActionType[];
    variant?: 'subtle' | 'highlight' | 'urgent';
    className?: string;
}

const ACTION_MAP: Record<HookActionType, { icon: any; defaultLabel: string; color: string }> = {
    pray: { icon: Flame, defaultLabel: 'Pokok Doa', color: 'text-rose-500' },
    reflect: { icon: BookOpenText, defaultLabel: 'Renungkan', color: 'text-brand' },
    discuss: { icon: MessageSquare, defaultLabel: 'Bahas di Komunitas', color: 'text-amber-500' },
    save: { icon: Bookmark, defaultLabel: 'Simpan', color: 'text-slate-400' },
    share: { icon: Share2, defaultLabel: 'Bagikan', color: 'text-indigo-400' },
};

const VARIANT_STYLES = {
    subtle: 'bg-surface border-border/40 hover:bg-surface-muted/30 transition-colors',
    highlight: 'bg-gradient-to-br from-brand/10 to-transparent border-brand/20 ring-1 ring-brand/10 shadow-[0_4px_20px_-10px_rgba(var(--brand),0.3)]',
    urgent: 'bg-gradient-to-br from-rose-500/10 to-transparent border-rose-500/20 ring-1 ring-rose-500/10',
};

export default function HookCard({
    hookText,
    verseReference,
    relevanceText,
    primaryAction,
    secondaryActions = ['save', 'share'],
    variant = 'subtle',
    className,
}: HookCardProps) {
    const PrimaryIcon = ACTION_MAP[primaryAction.type].icon;
    const primaryColor = ACTION_MAP[primaryAction.type].color;

    return (
        <Card className={cn('overflow-hidden rounded-[32px] md:rounded-[40px] backdrop-blur-2xl shadow-soft', VARIANT_STYLES[variant], className)}>
            <CardContent className="tct-card-pad">
                <div className="flex items-start justify-between gap-4">
                    {/* Verse Badge */}
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 px-2.5 py-1 ring-1 ring-border/50">
                        <Sparkles className="h-3 w-3 text-brand" />
                        <span className="font-serif text-[11px] font-bold tracking-widest uppercase text-muted-foreground">
                            {verseReference}
                        </span>
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex items-center gap-1">
                        {secondaryActions.map((action) => {
                            const ActionIcon = ACTION_MAP[action].icon;
                            return (
                                <button
                                    key={action}
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground/70 hover:bg-surface-muted hover:text-foreground transition-all"
                                    aria-label={ACTION_MAP[action].defaultLabel}
                                >
                                    <ActionIcon className="h-4 w-4" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content */}
                <div className="mt-4 space-y-2">
                    <h3 className="font-serif text-[20px] font-medium leading-[1.3] text-foreground md:text-[22px]">
                        "{hookText}"
                    </h3>
                    <p className="text-[13px] font-medium leading-relaxed text-muted-foreground/90">
                        {relevanceText}
                    </p>
                </div>

                {/* Primary Action */}
                <div className="mt-6 flex items-center">
                    <Link
                        href={primaryAction.href}
                        className={cn(
                            'group flex w-full items-center justify-between rounded-2xl bg-surface px-4 py-3 ring-1 transition-all hover:bg-surface-muted hover:shadow-sm',
                            variant === 'urgent' ? 'ring-rose-500/40 text-rose-600' : 'ring-border/60 text-foreground'
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn('flex h-8 w-8 items-center justify-center rounded-full bg-slate-500/10', primaryColor)}>
                                <PrimaryIcon className="h-4 w-4" />
                            </div>
                            <span className="text-[13px] font-bold tracking-wide">
                                {primaryAction.label || ACTION_MAP[primaryAction.type].defaultLabel}
                            </span>
                        </div>
                        <MoveRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
