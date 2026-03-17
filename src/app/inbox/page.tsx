
"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Search, ChevronRight, Loader2, PlusCircle, UserCircle2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getAppAccessToken, clearAppAccessToken } from '@/services/app-auth-token';
import MobileAppLayout from '@/layouts/MobileAppLayout';
import SegmentedTabs from '@/components/core/SegmentedTabs';

type InboxItem = {
    message_id: number;
    preview: string;
    is_unread: boolean;
    created_at: string | null;
    partner: {
        id: number;
        name: string;
        online: boolean;
        avatar?: string;
    };
    can_approve?: boolean;
};

type InboxPayload = {
    tabs?: {
        primary?: InboxItem[];
        general?: InboxItem[];
        requests?: InboxItem[];
    };
    counts?: {
        primary?: number;
        general?: number;
        requests?: number;
    };
};

export default function InboxPage() {
    const router = useRouter();
    const [inbox, setInbox] = useState<InboxPayload>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'primary' | 'general' | 'requests'>('primary');
    const [busyKey, setBusyKey] = useState<string | null>(null);
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchInbox = async (showLoader = false) => {
        const token = getAppAccessToken();
        if (!token) {
            setLoading(false);
            return;
        }

        if (showLoader) setLoading(true);
        try {
            const response = await fetch('/api/inbox', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                cache: 'no-store',
            });

            if (response.ok) {
                const payload = await response.json();
                setInbox(payload.inbox ?? {});
            } else if (response.status === 401 || response.status === 403) {
                clearAppAccessToken();
                setInbox({});
            }
        } catch (e) {
            // Keep current state on error
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    useEffect(() => {
        void fetchInbox(true);
        // Legacy Parity: 7s Polling
        const interval = setInterval(() => void fetchInbox(), 7000);
        return () => clearInterval(interval);
    }, []);

    const visibleItems = useMemo(() => {
        const tabs = inbox.tabs ?? {};
        return tabs[activeTab] ?? [];
    }, [activeTab, inbox.tabs]);

    const formatTime = (iso: string | null) => {
        if (!iso) return '';
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '';
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const approveRequest = async (e: React.MouseEvent, messageId: number) => {
        e.preventDefault();
        e.stopPropagation();
        
        const token = getAppAccessToken();
        if (!token || busyKey) return;

        setBusyKey(`approve:${messageId}`);
        try {
            const res = await fetch(`/api/inbox/messages/${messageId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({}),
            });

            const json = await res.json().catch(() => ({}));
            if (!res.ok || json?.ok !== true) {
                showToast('Gagal menyetujui pesan', 'error');
                return;
            }

            showToast('Peringatan telah disetujui');
            setActiveTab('general');
            void fetchInbox();
        } catch {
            showToast('Gagal menyetujui pesan', 'error');
        } finally {
            setBusyKey(null);
        }
    };

    if (loading && !inbox.tabs) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 text-brand animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Syncing Conversations...</p>
            </div>
        );
    }

    if (!loading && !getAppAccessToken()) {
        return (
            <MobileAppLayout title="Inbox" activeNavId="home" backHref="/today">
                <div className="flex flex-col items-center justify-center p-12 text-center mt-20 space-y-6">
                    <div className="h-24 w-24 bg-brand/10 rounded-[40px] flex items-center justify-center text-brand shadow-inner">
                        <UserCircle2 size={48} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black tct-brand-gradient">Belum Teridentifikasi</h2>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] leading-relaxed max-w-[240px] mx-auto">
                            Silakan masuk untuk melihat pesan dan memulai percakapan baru.
                        </p>
                    </div>
                    <button 
                        onClick={() => router.push('/profile')}
                        className="px-8 py-3 bg-brand text-background rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-brand/20 active:scale-95 transition-all"
                    >
                        Masuk Sekarang
                    </button>
                </div>
            </MobileAppLayout>
        );
    }

    return (
        <MobileAppLayout 
            title="Inbox" 
            activeNavId="home" 
            backHref="/today"
            rightAction={
                <button 
                    onClick={() => {}} // Placeholder for now
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-soft hover:bg-foreground/90 active:scale-90 transition-all border border-border/50"
                >
                    <PlusCircle size={24} />
                </button>
            }
        >
            <div className="mx-auto w-full max-w-[640px] space-y-6 px-2">
                {/* Header Stats Parity */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-[32px] md:rounded-[40px] border-0 glass-card tct-card-pad shadow-soft mb-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand/80">Messaging Hub</span>
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                {Object.values(inbox.counts ?? {}).reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0)} Active Threads
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand border border-brand/20 shadow-inner">
                            <Mail className="h-6 w-6" />
                        </div>
                    </div>

                    <SegmentedTabs
                        options={[
                            { id: 'primary', label: `Primary (${inbox.counts?.primary ?? 0})` },
                            { id: 'general', label: `General (${inbox.counts?.general ?? 0})` },
                            { id: 'requests', label: `Requests (${inbox.counts?.requests ?? 0})` },
                        ]}
                        activeId={activeTab}
                        onChange={(id) => setActiveTab(id as any)}
                    />
                </motion.div>

                {/* Conversation List */}
                <div className="grid gap-3">
                    <AnimatePresence mode="wait">
                        {visibleItems.length === 0 ? (
                            <motion.div 
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-16 text-center rounded-[40px] glass-card border-0 border-dashed shadow-none bg-transparent"
                            >
                                <div className="h-16 w-16 bg-surface-muted rounded-3xl flex items-center justify-center mx-auto mb-4 border border-border/50">
                                    <Search className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.3em]">No {activeTab} threads</p>
                            </motion.div>
                        ) : (
                            visibleItems.map((item, idx) => (
                                <motion.button
                                    key={item.message_id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    onClick={() => router.push(`/inbox/${item.partner.id}`)}
                                    className={cn(
                                        "group flex items-center gap-5 p-5 rounded-[28px] md:rounded-[32px] bg-surface/80 border border-border/60 transition-all active:scale-[0.98] text-left relative overflow-hidden",
                                        item.is_unread ? "ring-2 ring-brand/20 bg-surface-elevated shadow-card" : "hover:bg-surface-elevated"
                                    )}
                                >
                                    {item.is_unread && (
                                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-brand" />
                                    )}
                                    
                                    <div className="relative flex-none">
                                        <div className="h-14 w-14 rounded-[20px] bg-surface-muted border border-border/50 flex items-center justify-center text-lg font-black text-brand shadow-sm group-hover:scale-105 transition-transform">
                                            {(item.partner?.name || '?').slice(0, 1).toUpperCase()}
                                        </div>
                                        {item.partner?.online && (
                                            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 border-4 border-background shadow-sm" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-bold text-sm text-foreground truncate pr-2">{item.partner?.name || 'Unknown'}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                                                {formatTime(item.created_at)}
                                            </p>
                                        </div>
                                        <p className={cn(
                                            "text-[13px] line-clamp-1 leading-snug tracking-tight",
                                            item.is_unread ? "text-foreground font-bold" : "text-muted-foreground font-medium"
                                        )}>
                                            {item.preview || 'No content'}
                                        </p>
                                        
                                        {item.can_approve && (
                                            <div className="mt-3">
                                                <button
                                                    disabled={busyKey === `approve:${item.message_id}`}
                                                    onClick={(e) => void approveRequest(e, item.message_id)}
                                                    className="px-4 py-2 bg-foreground text-background rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-sm flex justify-center items-center w-max hover:bg-foreground/90"
                                                >
                                                    {busyKey === `approve:${item.message_id}` ? (
                                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                                    ) : null}
                                                    {busyKey === `approve:${item.message_id}` ? 'Menyetujui...' : 'Setujui Pesan'}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-none opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                                        {item.is_unread ? (
                                            <div className="h-2 w-2 rounded-full bg-brand shadow-[0_0_10px_rgba(0,166,255,0.5)]" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </div>
                                </motion.button>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Global Toast Parity */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                    >
                        <div className={cn(
                            "px-5 py-3.5 rounded-2xl flex items-center gap-3 shadow-2xl ring-1",
                            toast.type === 'error' 
                                ? "bg-rose-500 border border-rose-500/20 text-white shadow-rose-500/30"
                                : "bg-emerald-500 border border-emerald-500/20 text-white shadow-emerald-500/30"
                        )}>
                            {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                            <p className="text-[12px] font-black tracking-wide break-words">{toast.message}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </MobileAppLayout>
    );
}
