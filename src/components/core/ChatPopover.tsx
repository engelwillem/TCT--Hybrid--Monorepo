import SegmentedTabs from '@/components/core/SegmentedTabs';
import { IconMessage } from '@/components/icons/AppIcons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuthSession } from '@/auth/use-auth-session';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { buildAppAuthHeaders, fetchWithAppAuth } from '@/lib/app-auth-fetch';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type InboxTab = 'primary' | 'general' | 'requests';

type InboxItem = {
    message_id: number;
    partner: { id: number; name: string; online?: boolean; last_seen_at?: string | null };
    preview: string;
    is_incoming: boolean;
    is_unread: boolean;
    approved: boolean;
    is_following_partner?: boolean;
    is_followed_by_partner?: boolean;
    can_approve?: boolean;
    created_at: string | null;
};

type SharedInbox = {
    tabs?: Record<InboxTab, InboxItem[]>;
    counts?: Record<InboxTab, number>;
    unreadCount?: number;
} | null;

function emptyInbox(): NonNullable<SharedInbox> {
    return {
        tabs: { primary: [], general: [], requests: [] },
        counts: { primary: 0, general: 0, requests: 0 },
        unreadCount: 0,
    };
}

function formatLastSeen(iso: string | null | undefined): string {
    if (!iso) return 'offline';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'offline';
    return `last seen ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export default function ChatPopover({
    className,
    triggerMode = 'inbox',
    iconClassName,
    iconStrokeWidth,
    badgeMode = 'count',
    badgeClassName,
}: {
    className?: string;
    triggerMode?: 'inbox' | 'notification';
    iconClassName?: string;
    iconStrokeWidth?: number;
    badgeMode?: 'count' | 'dot';
    badgeClassName?: string;
}) {
    const router = useRouter();
    const { isAuthenticated, isRestoring } = useAuthSession();
    // Assuming props are passed through a provider or global state in a real Next app
    // For this bridge, we fetch them dynamically
    const [tab, setTab] = useState<InboxTab>('primary');
    const [open, setOpen] = useState(false);
    const [liveInbox, setLiveInbox] = useState<NonNullable<SharedInbox>>(emptyInbox());
    const [draftByPartner, setDraftByPartner] = useState<Record<number, string>>({});
    const [busyKey, setBusyKey] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const lastUnreadRef = useRef<number>(0);

    const showToast = (message: string) => {
        setToast(message);
        window.setTimeout(() => setToast(null), 1400);
    };

    const refreshInbox = async () => {
        if (!isAuthenticated) return;

        try {
            const res = await fetchWithAppAuth('/api/inbox', {
                headers: buildAppAuthHeaders(),
            });
            const json = await res.json();
            const data = (json?.inbox ?? emptyInbox()) as NonNullable<SharedInbox>;
            setLiveInbox(data);
            
            const nextUnread = Number(data.unreadCount ?? 0);
            if (nextUnread > lastUnreadRef.current) {
                showToast('Pesan baru masuk');
            }
            lastUnreadRef.current = nextUnread;
        } catch {
            // no-op
        }
    };

    useEffect(() => {
        if (!open || isRestoring || !isAuthenticated) return;

        void refreshInbox();
        const id = window.setInterval(() => {
            void refreshInbox();
        }, 7000);

        return () => window.clearInterval(id);
    }, [isAuthenticated, isRestoring, open]);

    const toggleFollow = async (partnerId: number) => {
        if (!isAuthenticated) return;

        const key = `follow:${partnerId}`;
        setBusyKey(key);
        try {
            const res = await fetchWithAppAuth(`/api/users/${partnerId}/follow`, {
                method: 'POST',
                headers: buildAppAuthHeaders({ contentType: 'application/json' }),
                body: JSON.stringify({}),
            });

            const json = await res.json();
            if (!res.ok || json?.ok !== true) {
                showToast('Follow action failed');
                return;
            }

            showToast(json?.following ? 'Followed' : 'Unfollowed');
            void refreshInbox();
        } catch {
            showToast('Follow action failed');
        } finally {
            setBusyKey(null);
        }
    };

    const approveRequest = async (messageId: number) => {
        if (!isAuthenticated) return;

        const key = `approve:${messageId}`;
        setBusyKey(key);
        try {
            const res = await fetchWithAppAuth(`/api/inbox/messages/${messageId}/approve`, {
                method: 'POST',
                headers: buildAppAuthHeaders({ contentType: 'application/json' }),
                body: JSON.stringify({}),
            });

            const json = await res.json();
            if (!res.ok || json?.ok !== true) {
                showToast('Approve failed');
                return;
            }

            showToast('Request approved');
            await refreshInbox();
            setTab('general');
        } catch {
            showToast('Approve failed');
        } finally {
            setBusyKey(null);
        }
    };

    const sendMessage = async (partnerId: number) => {
        const body = String(draftByPartner[partnerId] ?? '').trim();
        if (!isAuthenticated || !body) return;

        const key = `send:${partnerId}`;
        setBusyKey(key);
        try {
            const res = await fetchWithAppAuth('/api/inbox/messages', {
                method: 'POST',
                headers: buildAppAuthHeaders({ contentType: 'application/json' }),
                body: JSON.stringify({
                    recipient_id: partnerId,
                    body,
                }),
            });

            const json = await res.json();
            if (!res.ok || json?.ok !== true) {
                showToast('Send failed');
                return;
            }

            setDraftByPartner((prev) => ({ ...prev, [partnerId]: '' }));
            showToast('Message sent');
            void refreshInbox();
        } catch {
            showToast('Send failed');
        } finally {
            setBusyKey(null);
        }
    };

    const markAllRead = async () => {
        if (!isAuthenticated) return;

        setBusyKey('mark-all');
        try {
            const res = await fetchWithAppAuth('/api/inbox/read-all', {
                method: 'POST',
                headers: buildAppAuthHeaders({ contentType: 'application/json' }),
                body: JSON.stringify({}),
            });
            const json = await res.json();
            if (!res.ok || json?.ok !== true) {
                showToast('Mark all read gagal');
                return;
            }
            showToast('Semua DM ditandai terbaca');
            await refreshInbox();
        } catch {
            showToast('Mark all read gagal');
        } finally {
            setBusyKey(null);
        }
    };

    const isLoggedIn = isAuthenticated;

    const counts = liveInbox.counts ?? { primary: 0, general: 0, requests: 0 };
    const unreadCount = Number(liveInbox.unreadCount ?? 0);
    const tabItems = (liveInbox.tabs?.[tab] ?? []) as InboxItem[];
    const showBadge = isLoggedIn && unreadCount > 0;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        'relative flex h-11 w-11 items-center justify-center rounded-full bg-white/70 backdrop-blur-xl shadow-sm ring-1 ring-black/[0.04] transition-all active:scale-95',
                        className,
                    )}
                    aria-label={triggerMode === 'notification' ? 'Buka notifikasi' : 'Buka inbox'}
                >
                    <Bell className={cn('h-5 w-5 text-slate-600', iconClassName)} />
                    {showBadge ? (
                        <span
                            className={cn(
                                badgeMode === 'dot'
                                    ? 'absolute right-2.5 top-2.5 inline-flex h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white'
                                    : 'absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#0088CC] px-1 text-[10px] font-black text-white shadow-md border-2 border-white',
                                badgeClassName,
                            )}
                        >
                            {badgeMode === 'count' ? unreadCount : null}
                        </span>
                    ) : null}
                </button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                className="w-[340px] max-w-[95vw] mt-3 bg-white/98 backdrop-blur-3xl p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)] rounded-[32px] border-none ring-1 ring-black/[0.04] overflow-hidden"
            >
                {!isLoggedIn ? (
                    /* Guest State: iOS Native Precision Refinement */
                    <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
                        {/* Icon Container: The 24px Rule (mb-6) */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="mb-8 flex h-16 w-16 items-center justify-center rounded-[20px] bg-slate-50 text-[#0088CC]"
                        >
                            <Bell className="h-7 w-7 stroke-[1.5]" />
                        </motion.div>
                        
                        {/* Headline: Precise Typography (text-[20px]) */}
                        <motion.h3
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-[20px] font-bold tracking-[-0.02em] text-slate-900"
                        >
                            Stay in the Loop
                        </motion.h3>

                        {/* Body: High Legibility (8px Gap / mt-2) */}
                        <motion.p
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="mt-2 text-[15px] font-medium leading-[1.5] text-slate-500 max-w-[85%] mx-auto"
                        >
                            Sign in to see your latest messages and stay connected.
                        </motion.p>

                        {/* Actions: The 32px Rule (mt-12) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="mt-12 flex w-full flex-col items-center gap-5"
                        >
                            <button
                                onClick={() => router.push('/login')}
                                className="h-[48px] w-full rounded-full bg-[#0088CC] px-6 text-[15px] font-semibold text-white transition-all hover:bg-[#0077BB] active:scale-[0.97]"
                            >
                                Sign In
                            </button>
                            
                            <button
                                onClick={() => router.push('/register')}
                                className="text-[15px] font-semibold text-[#0088CC] hover:text-[#0077BB] transition-colors"
                            >
                                Create Account
                            </button>
                        </motion.div>
                    </div>
                ) : (
                    /* Authenticated State */
                    <div className="flex flex-col h-full max-h-[580px]">
                        {/* Compact Header */}
                        <div className="flex items-center justify-between px-6 py-5">
                            <p className="text-[17px] font-bold text-slate-900 tracking-tight">Notifikasi</p>
                        </div>

                        <div className="overflow-y-auto scrollbar-hide flex-1">
                            {/* Integrated Announcement */}
                            <div className="px-6 py-4 bg-slate-50/40 border-y border-slate-50">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#0088CC]">
                                        Sistem
                                    </p>
                                </div>
                                <p className="text-[12px] font-semibold text-slate-800 leading-tight">
                                    Selamat datang di The Choose n Talks!
                                </p>
                                <p className="mt-1 text-[11px] leading-relaxed text-slate-500 line-clamp-2">
                                    Jelajahi fiturrenungan dan diskusi iman bersama komunitas.
                                </p>
                            </div>

                            {/* Minimal Navigation */}
                            <div className="px-4 py-3">
                                <SegmentedTabs
                                    options={[
                                        { id: 'primary', label: `Utama` },
                                        { id: 'general', label: `Umum` },
                                        { id: 'requests', label: `Req` },
                                    ]}
                                    activeId={tab}
                                    onChange={(id) => setTab(id as InboxTab)}
                                />
                            </div>

                            {/* Content List: Pure & Clean */}
                            <div className="divide-y divide-slate-50/60">
                                {tabItems.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <p className="text-[12px] font-bold text-slate-300 uppercase tracking-widest">Kosong</p>
                                    </div>
                                ) : (
                                    tabItems.map((item) => {
                                        const partnerId = item.partner?.id;
                                        const followBusy = busyKey === `follow:${partnerId}`;
                                        const approveBusy = busyKey === `approve:${item.message_id}`;
                                        const following = Boolean(item.is_following_partner);

                                        return (
                                            <button
                                                key={item.message_id}
                                                onClick={() => {
                                                    setOpen(false);
                                                    router.push(`/inbox/${partnerId}`);
                                                }}
                                                className="w-full flex items-start gap-3.5 px-6 py-4 text-left transition-all hover:bg-slate-50/50 active:bg-slate-100/50 group"
                                            >
                                                <div className="relative flex-none">
                                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-[14px] font-bold text-slate-500 ring-1 ring-black/[0.02]">
                                                        {(item.partner?.name ?? '?').slice(0, 1).toUpperCase()}
                                                    </div>
                                                    {item.partner?.online && (
                                                        <div className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className={cn(
                                                            "text-[14.5px] truncate tracking-tight",
                                                            item.is_unread ? "font-bold text-slate-900" : "font-medium text-slate-700"
                                                        )}>
                                                            {item.partner?.name ?? 'Unknown'}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            <p className="text-[10px] font-bold text-slate-400">
                                                                {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                            </p>
                                                            {item.is_unread && (
                                                                <div className="h-1.5 w-1.5 rounded-full bg-[#0088CC]" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    <p className={cn(
                                                        "mt-0.5 text-[13px] line-clamp-2 leading-snug",
                                                        item.is_unread ? "font-medium text-slate-600" : "text-slate-400"
                                                    )}>
                                                        {item.preview || 'Sapa mereka sekarang...'}
                                                    </p>

                                                    {/* Hover Actions */}
                                                    <div className="mt-2.5 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <p 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                void toggleFollow(partnerId);
                                                            }}
                                                            className={cn(
                                                                "text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-slate-900",
                                                                following ? "text-slate-400" : "text-[#0088CC]"
                                                            )}
                                                        >
                                                            {followBusy ? '...' : following ? 'Unfollow' : 'Follow'}
                                                        </p>
                                                        {item.can_approve && (
                                                            <p 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    void approveRequest(item.message_id);
                                                                }}
                                                                className="text-[10px] font-black uppercase tracking-widest text-emerald-500 cursor-pointer hover:text-emerald-700"
                                                            >
                                                                {approveBusy ? '...' : 'Approve'}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Clean Footer Actions */}
                        <div className="px-6 py-5 bg-white border-t border-slate-50 flex flex-col items-center gap-3">
                            <button
                                type="button"
                                disabled={busyKey === 'mark-all' || unreadCount <= 0}
                                onClick={() => void markAllRead()}
                                className="text-[12px] font-bold text-[#0088CC] hover:underline disabled:opacity-30"
                            >
                                Tandai Semua Terbaca
                            </button>
                            <button 
                                onClick={() => {
                                    setOpen(false);
                                    router.push('/inbox');
                                }}
                                className="text-[12px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Buka Semua Pesan
                            </button>
                        </div>
                    </div>
                )}
            </PopoverContent>

            {toast ? (
                <div className="fixed left-1/2 top-10 z-[100] -translate-x-1/2 rounded-full bg-slate-900/95 px-5 py-2.5 text-[11px] font-black text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500">
                    {toast}
                </div>
            ) : null}
        </Popover>
    );
}
