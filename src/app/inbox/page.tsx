"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Search, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
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
        <div className="min-h-screen bg-[#FAFAF8] text-slate-900 pb-20">
            <header className="sticky top-0 z-50 bg-[#FAFAF8]/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-4">
                <div className="mx-auto max-w-2xl flex items-center justify-between">
                    <button onClick={() => router.push('/today')} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white active:scale-95 transition-all">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="font-bold text-lg">Inbox</h1>
                    <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white active:scale-95 transition-all text-slate-400">
                        <Search className="h-5 w-5" />
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">
                <div className="p-5 rounded-[28px] bg-white shadow-soft ring-1 ring-black/[0.03]">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-bold text-slate-900 tracking-tight">Pesan Masuk</p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{totalConversations} Percakapan</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-50 p-1.5 ring-1 ring-slate-100">
                        {(['primary', 'general', 'requests'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "rounded-xl py-2 text-[11px] font-bold capitalize transition-all",
                                    activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid gap-2.5">
                    {visibleItems.length === 0 ? (
                        <div className="p-12 text-center rounded-[32px] bg-white/50 border border-dashed border-slate-200">
                            <Mail className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                            <p className="text-sm font-bold text-slate-400">Belum ada percakapan</p>
                        </div>
                    ) : (
                        visibleItems.map(item => (
                            <button
                                key={item.message_id}
                                onClick={() => router.push(`/inbox/${item.partner.id}`)}
                                className="group flex items-center gap-4 p-5 rounded-[32px] bg-white shadow-soft ring-1 ring-black/[0.02] transition-all hover:bg-slate-50 active:scale-[0.98]"
                            >
                                <div className="relative flex-none">
                                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold shadow-sm">
                                        {item.partner.name.slice(0, 1)}
                                    </div>
                                    {item.partner.online && (
                                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-bold text-[15px] text-slate-900 truncate">{item.partner.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{formatTime(item.created_at)}</p>
                                    </div>
                                    <p className={cn(
                                        "text-[13px] line-clamp-1 leading-snug",
                                        item.is_unread ? "text-slate-900 font-bold" : "text-slate-500 font-medium"
                                    )}>
                                        {item.preview}
                                    </p>
                                </div>

                                {item.is_unread && (
                                    <div className="h-2 w-2 rounded-full bg-blue-500 flex-none" />
                                )}
                            </button>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
