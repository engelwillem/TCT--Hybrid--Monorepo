import { cn, triggerHaptic } from '@/lib/utils';
import { Bookmark, Hand, MessageCircle, Share2 } from 'lucide-react';
import AppIcon from '@/Components/system/AppIcon';
import { usePage } from '@inertiajs/react';
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

export default function ActionBar({
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
    const page = usePage();
    const isAuthenticated = Boolean((page.props as any)?.auth?.user);

    const runMemberAction = (action: () => void | Promise<void>, haptic: 'light' | 'medium' = 'light') => {
        if (!isAuthenticated) {
            window.location.assign('/');
            return;
        }

        triggerHaptic(haptic);
        void action();
    };

    // Conditional visibility logic based on postType (Audit: Naturalness & Non-redundancy)
    const isMemberReflection = postType === 'reflection';
    const isMemberRotation = isMemberReflection || postType === 'member_post';
    const isPrayerRequest = postType === 'prayer_request';
    const isImagePost = postType === 'image_post';
    const isOfficial = postType === 'editorial' || postType === 'community_highlight';
    const isPrompt = postType === 'discussion_prompt' || postType === 'reflection_prompt';

    const showPray = true;
    const showComments = true;
    const showShare = true;
    const showSave = true;

    return (
        <div className={cn('flex items-center gap-2 text-sm', splitSave ? 'w-full' : '', className)}>
            {showPray && onPray && (
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className={cn(
                        'tct-pressable inline-flex h-9 items-center gap-2 rounded-full px-3 text-muted-foreground transition-all duration-200 hover:bg-surface-muted hover:text-foreground',
                        prayed ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 'bg-surface-muted/30',
                    )}
                    aria-label="Pray"
                    aria-pressed={prayed}
                    onClick={() => onPray && runMemberAction(onPray, 'medium')}
                >
                    <AppIcon icon={Hand} variant="action" active={prayed} className={prayed ? 'text-emerald-600' : 'opacity-70'} />
                    <span className="text-[12px] font-medium tabular-nums">{prayLabel}</span>
                </motion.button>
            )}

            {showComments && (
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="tct-pressable inline-flex h-9 items-center gap-2 rounded-full bg-surface-muted/30 px-3 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                    aria-label={`Comment${commentsCount ? ` (${commentsCount})` : ''}`}
                    onClick={() => runMemberAction(onOpenComments, 'light')}
                >
                    <AppIcon icon={MessageCircle} variant="action" className="opacity-70" />
                    {commentsCount > 0 ? (
                        <span className="text-[12px] font-medium tabular-nums">
                            {commentsCount}
                        </span>
                    ) : null}
                </motion.button>
            )}

            {showShare && (
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="tct-pressable flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted/30 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                    aria-label="Share"
                    onClick={() => runMemberAction(onShare, 'light')}
                >
                    <AppIcon icon={Share2} variant="action" className="opacity-70" />
                </motion.button>
            )}

            {showSave && (
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className={cn(
                        'tct-pressable inline-flex h-9 items-center gap-2 rounded-full px-3 text-muted-foreground transition-all hover:bg-surface-muted hover:text-foreground',
                        splitSave ? 'ml-auto' : '',
                        bookmarked ? 'bg-brand/5 text-brand ring-1 ring-inset ring-brand/20' : 'bg-surface-muted/30',
                    )}
                    aria-label="Bookmark"
                    aria-pressed={bookmarked}
                    onClick={() => runMemberAction(onBookmark, 'medium')}
                >
                    <AppIcon icon={Bookmark} variant="action" active={bookmarked} className={bookmarked ? 'text-brand' : 'opacity-70'} />
                    <span className="text-[12px] font-medium tabular-nums">
                        {bookmarkLabel}
                    </span>
                </motion.button>
            )}
        </div>
    );
}

export type { ActionBarProps };
