import { IconBell } from '@/Components/icons/AppIcons';
import { Button } from '@/Components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { cn } from '@/lib/utils';
import { router, usePage } from '@inertiajs/react';
import { useMemo } from 'react';

type NotificationItem = {
    id: string;
    type?: string;
    data?: unknown;
    readAt?: string | null;
    createdAt?: string | null;
};

export default function NotificationsPopover({ className }: { className?: string }) {
    const { notifications } = usePage().props;

    const unreadCount = notifications?.unreadCount ?? 0;
    const items = useMemo<NotificationItem[]>(
        () => ((notifications as any)?.items ?? []) as NotificationItem[],
        [notifications],
    );

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        'relative flex h-12 w-12 items-center justify-center rounded-full bg-white/80 dark:bg-slate-900/80 shadow-soft backdrop-blur-md ring-1 ring-black/[0.04] dark:ring-white/[0.08]',
                        className,
                    )}
                    aria-label="Open notifications"
                >
                    <IconBell className="h-5 w-5 text-muted-foreground" />
                    {unreadCount > 0 ? (
                        <span className="absolute right-2 top-2 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-foreground">
                            {unreadCount}
                        </span>
                    ) : null}
                </button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                className="w-[360px] border-white/15 bg-slate-900/80 p-4 shadow-2xl backdrop-blur-xl ring-1 ring-white/10"
            >
                <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-white">
                                Notifications
                            </p>
                            <p className="text-xs text-white/55">
                                {unreadCount > 0
                                    ? `${unreadCount} unread`
                                    : 'You are all caught up'}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-9 rounded-full border-white/15 bg-transparent px-3 text-xs text-white/90 hover:bg-white/5"
                            disabled={unreadCount === 0}
                            onClick={() =>
                                router.post(route('notifications.readAll'), {}, {
                                    preserveScroll: true,
                                    preserveState: true,
                                })
                            }
                        >
                            Mark all read
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {items.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                <p className="text-xs text-white/60">
                                    No notifications yet.
                                </p>
                            </div>
                        ) : (
                            items.map((n: NotificationItem) => {
                                const data = (n.data ?? {}) as any;
                                return (
                                    <button
                                        key={n.id}
                                        type="button"
                                        onClick={() => {
                                            if (typeof data.url === 'string' && data.url.length) {
                                                router.visit(data.url, { preserveScroll: true });
                                            }
                                        }}
                                        className={cn(
                                            'w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-left',
                                            !n.readAt ? 'ring-1 ring-brand/30' : null,
                                        )}
                                    >
                                        <p className="text-sm font-medium text-white">
                                            {data.title ?? 'Notification'}
                                        </p>
                                        {data.body ? (
                                            <p className="mt-1 text-xs leading-5 text-white/65">
                                                {data.body}
                                            </p>
                                        ) : null}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
