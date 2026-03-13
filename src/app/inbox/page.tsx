"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Search, ArrowLeft, MoreHorizontal, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getAppAccessToken } from '@/services/app-auth-token';

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
};

type InboxPayload = {
    tabs?: {
        primary?: InboxItem[];
        general?: InboxItem[];
        requests?: InboxItem[];
    };
};

export default function InboxPage() {
    const router = useRouter();
    const [inbox, setInbox] = useState<InboxPayload>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'primary' | 'general' | 'requests'>('primary');

    useEffect(() => {
        const token = getAppAccessToken();
        if (!token) {
            setLoading(false);
            return;
        }

        let isActive = true;
        const loadInbox = async () => {
            try {
                const response = await fetch('/api/inbox', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    cache: 'no-store',
                });

                if (!response.ok) return;
                const payload = await response.json();
                if (!isActive) return;
                setInbox(payload.inbox ?? {});
            } catch {
                // Keep UI stable when API is unreachable.
            } finally {
                if (isActive) setLoading(false);
            }
        };

        loadInbox();

        return () => {
            isActive = false;
        };
    }, []);

    const visibleItems = useMemo(() => {
        const tabs = inbox.tabs ?? {};
        return tabs[activeTab] ?? [];
    }, [activeTab, inbox.tabs]);

    const totalConversations = useMemo(() => {
        const tabs = inbox.tabs ?? {};
        return (tabs.primary?.length ?? 0) + (tabs.general?.length ?? 0) + (tabs.requests?.length ?? 0);
    }, [inbox.tabs]);

    const formatTime = (iso: string | null) => {
        if (!iso) return '';
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '';
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="h-10 w-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-32 selection:bg-sky-500/30">
            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sky-500/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[120px]" />
            </div>

            <header className="sticky top-0 z-50 bg-slate-950/40 backdrop-blur-2xl border-b border-white/5 px-6 py-6">
                <div className="mx-auto max-w-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => router.push('/today')} 
                            className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-90 transition-all shadow-xl"
                        >
                            <ArrowLeft className="h-5 w-5 text-white/50" />
                        </button>
                        <div>
                            <h1 className="font-black text-2xl tracking-tighter text-sky-400">Inbox</h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Messages & Notifications</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all text-white/50">
                            <Search className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-6 py-10 space-y-10 relative">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-[40px] border border-white/10 bg-white/[0.01] shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-2xl ring-1 ring-white/5 group"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-500/80 drop-shadow-sm">Conversation Hub</span>
                            <p className="text-sm font-black text-white/20 uppercase tracking-[0.2em]">{totalConversations} Threads Active</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/10 border border-sky-400/20 text-sky-400">
                            <Mail className="h-6 w-6" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 rounded-[24px] bg-slate-900/50 p-2 border border-white/5">
                        {(['primary', 'general', 'requests'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "rounded-2xl py-3 text-[11px] font-black uppercase tracking-widest transition-all duration-500",
                                    activeTab === tab 
                                        ? "bg-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                                        : "text-white/20 hover:text-white/40"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </motion.div>

                <div className="grid gap-4">
                    <AnimatePresence mode="wait">
                        {visibleItems.length === 0 ? (
                            <motion.div 
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-16 text-center rounded-[40px] bg-white/[0.01] border border-dashed border-white/10 backdrop-blur-sm"
                            >
                                <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                                    <Mail className="h-10 w-10 text-white/10" />
                                </div>
                                <p className="text-sm font-black text-white/20 uppercase tracking-[0.3em]">No conversations yet</p>
                            </motion.div>
                        ) : (
                            visibleItems.map((item, idx) => (
                                <motion.button
                                    key={item.message_id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => router.push(`/inbox/${item.partner.id}`)}
                                    className="group flex items-center gap-6 p-6 rounded-[32px] bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all hover:bg-white/[0.03] active:scale-[0.98] relative overflow-hidden text-left"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400/0 via-sky-400/0 to-sky-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    
                                    <div className="relative flex-none">
                                        <div className="h-16 w-16 rounded-[24px] bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-xl font-black text-sky-400 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                            {item.partner.name.slice(0, 1)}
                                        </div>
                                        {item.partner.online && (
                                            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-4 border-slate-950 ring-1 ring-emerald-500/50" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 z-10">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-black text-lg text-white group-hover:text-sky-400 transition-colors tracking-tight truncate">{item.partner.name}</p>
                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest whitespace-nowrap">{formatTime(item.created_at)}</p>
                                        </div>
                                        <p className={cn(
                                            "text-sm line-clamp-1 leading-snug tracking-tight",
                                            item.is_unread ? "text-white font-bold" : "text-white/40 font-medium"
                                        )}>
                                            {item.preview}
                                        </p>
                                    </div>

                                    <div className="flex-none transition-transform duration-500 group-hover:translate-x-1 opacity-20 group-hover:opacity-100">
                                        {item.is_unread ? (
                                            <div className="h-3 w-3 rounded-full bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
                                        ) : (
                                            <ChevronRight className="h-5 w-5 text-white/40" />
                                        )}
                                    </div>
                                </motion.button>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
