"use client";

import { cn } from '@/lib/utils';
import { Bookmark, Hand, MessageCircle, Share2 } from 'lucide-react';
import { AppIcon } from './AppIcon';
import { motion } from 'framer-motion';

type ActionBarProps = {
    postType?: string;
    prayLabel?: string;
    prayed?: boolean;
    commentsCount: number;
    bookmarked: boolean;
    bookmarkLabel: string;
    onPray?: () => void;
    onOpenComments: () => void;
    onShare: () => void | Promise<void>;
    onBookmark: () => void;
    className?: string;
    splitSave?: boolean;
};

export function ActionBar({
    postType,
    prayLabel = 'Amin',
    prayed,
    commentsCount,
    bookmarked,
    bookmarkLabel,
    onPray,
    onOpenComments,
    onShare,
    onBookmark,
    className,
    splitSave = false,
}: ActionBarProps) {
    // In Next.js decoupled hybrid, we handle auth check at the page level or within the action handler
    const runMemberAction = (action: () => void | Promise<void>) => {
        void action();
    };

    return (
        <div className={cn('flex items-center gap-2 text-sm', splitSave ? 'w-full' : '', className)}>
            {onPray && (
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className={cn(
                        'tct-pressable inline-flex h-9 items-center gap-2 rounded-full px-3 text-muted-foreground transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground',
                        prayed ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 'bg-slate-100/30 dark:bg-slate-800/30',
                    )}
                    aria-label="Pray"
                    aria-pressed={prayed}
                    onClick={() => runMemberAction(onPray)}
                >
                    <AppIcon icon={Hand} variant="action" active={prayed} className={prayed ? 'text-emerald-600' : 'opacity-70'} />
                    <span className="text-[12px] font-medium tabular-nums">{prayLabel}</span>
                </motion.button>
            )}

            <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                className="tct-pressable inline-flex h-9 items-center gap-2 rounded-full bg-slate-100/30 dark:bg-slate-800/30 px-3 text-muted-foreground transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground"
                aria-label={`Comment${commentsCount ? ` (${commentsCount})` : ''}`}
                onClick={() => runMemberAction(onOpenComments)}
            >
                <AppIcon icon={MessageCircle} variant="action" className="opacity-70" />
                {commentsCount > 0 ? (
                    <span className="text-[12px] font-medium tabular-nums">
                        {commentsCount}
                    </span>
                ) : null}
            </motion.button>

            <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                className="tct-pressable flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/30 dark:bg-slate-800/30 text-muted-foreground transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground"
                aria-label="Share"
                onClick={() => runMemberAction(onShare)}
            >
                <AppIcon icon={Share2} variant="action" className="opacity-70" />
            </motion.button>

            <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                className={cn(
                    'tct-pressable inline-flex h-9 items-center gap-2 rounded-full px-3 text-muted-foreground transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground',
                    splitSave ? 'ml-auto' : '',
                    bookmarked ? 'bg-amber-500/10 text-amber-500 ring-1 ring-inset ring-amber-500/20' : 'bg-slate-100/30 dark:bg-slate-800/30',
                )}
                aria-label="Bookmark"
                aria-pressed={bookmarked}
                onClick={() => runMemberAction(onBookmark)}
            >
                <AppIcon icon={Bookmark} variant="action" active={bookmarked} className={bookmarked ? 'text-amber-500' : 'opacity-70'} />
                <span className="text-[12px] font-medium tabular-nums">
                    {bookmarkLabel}
                </span>
            </motion.button>
        </div>
    );
}
