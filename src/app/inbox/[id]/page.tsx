
"use client";

import React, { useEffect, useRef, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Send, MoreVertical, Smile, Image as ImageIcon, ArrowLeft, Loader2, CheckCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAppAccessToken } from '@/services/app-auth-token';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
    id: number;
    body: string;
    is_mine: boolean;
    approved: boolean;
    read_at: string | null;
    created_at: string | null;
};

type Partner = {
    id: number;
    name: string;
    online: boolean;
    last_seen_at?: string | null;
    relationship?: {
        is_following_partner?: boolean;
        is_followed_by_partner?: boolean;
        is_mutual_follow?: boolean;
    };
};

type Paging = {
    has_more: boolean;
    next_before_id: number | null;
};

export default function InboxThreadPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id: partnerIdStr } = use(params);
    const partnerId = Number(partnerIdStr);

    const [partner, setPartner] = useState<Partner | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [paging, setPaging] = useState<Paging>({ has_more: false, next_before_id: null });
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [followBusy, setFollowBusy] = useState(false);
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const lastMessageIdRef = useRef<number | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchThread = async (showLoader = false) => {
        const token = getAppAccessToken();
        if (!token || !Number.isFinite(partnerId)) {
            if (showLoader) setLoading(false);
            return;
        }

        if (showLoader) setLoading(true);
        try {
            const response = await fetch(`/api/inbox/${partnerId}`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                cache: 'no-store',
            });

            if (response.ok) {
                const payload = await response.json();
                setPartner(payload.partner ?? null);
                
                const newMessages = Array.isArray(payload.messages) ? payload.messages : [];
                setMessages(newMessages);
                setPaging(payload.paging ?? { has_more: false, next_before_id: null });

                // If new messages arrived, scroll to bottom
                const lastId = newMessages[newMessages.length - 1]?.id;
                if (lastId && lastId !== lastMessageIdRef.current) {
                    lastMessageIdRef.current = lastId;
                    setTimeout(() => {
                        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                    }, 50);
                }
            } else {
                setPartner(null);
            }
        } catch {
            setPartner(null);
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    useEffect(() => {
        void fetchThread(true);
        // Polling parity: 7s
        const interval = setInterval(() => void fetchThread(), 7000);
        return () => clearInterval(interval);
    }, [partnerId]);

    const handleSend = async () => {
        const token = getAppAccessToken();
        const body = text.trim();
        if (!token || !body || !partner || sending) return;
        if (!partner.relationship?.is_mutual_follow) {
            showToast('Kalian harus saling follow sebelum bisa mengirim pesan.', 'error');
            return;
        }

        setSending(true);
        const optimisticId = Date.now();
        const optimistic: Message = {
            id: optimisticId,
            body,
            is_mine: true,
            approved: true,
            read_at: null,
            created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimistic]);
        setText('');
        
        // Instant scroll for UX
        setTimeout(() => {
            if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }, 10);

        try {
            const response = await fetch('/api/inbox/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    recipient_id: partner.id,
                    body,
                }),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                const errorMsg = payload?.errors?.body?.[0] || payload?.message || 'Gagal mengirim pesan.';
                throw new Error(errorMsg);
            }
            
            const payload = await response.json();
            const serverMsg = payload?.message;
            
            if (serverMsg) {
                setMessages((prev) => prev.map((m) => (
                    m.id === optimisticId 
                        ? { ...m, id: serverMsg.id, created_at: serverMsg.created_at } 
                        : m
                )));
            }
        } catch (err: any) {
            setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
            showToast(err.message || 'Gagal mengirim pesan.', 'error');
        } finally {
            setSending(false);
        }
    };

    const handleToggleFollow = async () => {
        const token = getAppAccessToken();
        if (!token || !partner || followBusy) return;

        setFollowBusy(true);
        try {
            const response = await fetch(`/api/users/${partner.id}/follow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({}),
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok || payload?.ok !== true) {
                throw new Error(payload?.message || 'Gagal memperbarui follow.');
            }

            setPartner((prev) => prev ? {
                ...prev,
                relationship: {
                    ...prev.relationship,
                    is_following_partner: Boolean(payload?.following),
                    is_mutual_follow: Boolean(payload?.following) && Boolean(prev.relationship?.is_followed_by_partner),
                },
            } : prev);

            showToast(payload?.following ? 'Berhasil follow member.' : 'Follow dilepas.');
        } catch (err: any) {
            showToast(err?.message || 'Gagal memperbarui follow.', 'error');
        } finally {
            setFollowBusy(false);
        }
    };

    if (!partner) {
        if (loading) {
            return (
                <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 text-brand animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Secure Connection...</p>
                </div>
            );
        }

        return (
            <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-6 text-center px-4">
                <AlertTriangle className="h-12 w-12 text-muted-foreground/30" />
                <div className="space-y-2">
                    <h2 className="text-xl font-black text-foreground">Percakapan Tidak Tersedia</h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
                        Koneksi ke mitra percakapan ini ditutup atau tidak ditemukan.
                    </p>
                </div>
                <button 
                    onClick={() => router.push('/inbox')}
                    className="px-6 py-3 mt-4 bg-foreground text-background rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                >
                    Kembali ke Kotak Masuk
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
            {/* Thread Header: Minimal & Glassy */}
            <header className="flex-none sticky top-0 z-30 bg-white/70 backdrop-blur-2xl border-b border-black/[0.03] px-4 py-2">
                <div className="mx-auto max-w-2xl flex items-center justify-between h-12">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push('/inbox')} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-all active:scale-90">
                            <ArrowLeft className="h-5.5 w-5.5 text-slate-800" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-[14px] text-slate-500 font-bold ring-1 ring-black/[0.03]">
                                    {partner.name.slice(0, 1).toUpperCase()}
                                </div>
                                {partner.online && (
                                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-[15px] text-slate-900 leading-tight truncate">{partner?.name}</p>
                                <p className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider",
                                    partner?.online ? "text-emerald-500" : "text-slate-400"
                                )}>
                                    {partner?.online ? 'Online' : 'Offline'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        disabled={followBusy}
                        onClick={() => void handleToggleFollow()}
                        className={cn(
                            "inline-flex min-h-9 items-center justify-center rounded-full px-3.5 text-[10px] font-black uppercase tracking-[0.18em] transition-all",
                            partner?.relationship?.is_following_partner
                                ? "border border-sky-200 bg-sky-50 text-sky-700"
                                : "border border-slate-200 bg-white text-slate-700",
                            followBusy ? "opacity-60" : ""
                        )}
                    >
                        {followBusy ? '...' : partner?.relationship?.is_following_partner ? 'Following' : 'Follow'}
                    </button>
                </div>
            </header>

            <main 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide bg-[#F8F9FA]"
            >
                <div className="mx-auto max-w-2xl pt-2 pb-24">
                    {!partner.relationship?.is_mutual_follow ? (
                        <div className="mb-4 rounded-[22px] border border-sky-200/80 bg-sky-50/80 px-4 py-3 text-[12px] font-medium leading-5 text-sky-800">
                            Kalian harus saling follow terlebih dahulu sebelum bisa saling mengirim pesan.
                        </div>
                    ) : null}
                    <AnimatePresence initial={false}>
                        {messages.map((m, idx) => {
                            const showDate = idx === 0 || (m.created_at && messages[idx-1].created_at && 
                                new Date(m.created_at!).toDateString() !== new Date(messages[idx-1].created_at!).toDateString());

                            return (
                                <React.Fragment key={m.id}>
                                    {showDate && (
                                        <div className="sticky top-0 z-20 flex justify-center py-4 pointer-events-none">
                                            <span className="bg-white/60 backdrop-blur-lg px-4 py-1.5 rounded-full text-[12px] font-bold text-slate-500 shadow-sm ring-1 ring-black/[0.04]">
                                                {new Date(m.created_at!).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </span>
                                        </div>
                                    )}
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                                        className={cn("flex w-full mb-2", m.is_mine ? "justify-end" : "justify-start")}
                                    >
                                        <div className={cn(
                                            "max-w-[80%] px-4 py-2.5 shadow-sm text-[15.5px] leading-relaxed relative flex flex-col transition-all active:scale-[0.995]",
                                            m.is_mine
                                                ? "bg-[#0088CC] text-white rounded-[20px] rounded-br-[4px]"
                                                : "bg-white text-[#1C1C1C] ring-1 ring-black/[0.03] rounded-[20px] rounded-bl-[4px]"
                                        )}>
                                            <p className="whitespace-pre-wrap font-regular">
                                                {m.body}
                                            </p>
                                            <div className={cn(
                                                "flex items-center justify-end gap-1 mt-1 self-end",
                                                m.is_mine ? "text-white/60" : "text-slate-400/80"
                                            )}>
                                                <p className="text-[10px] font-medium tracking-tight">
                                                    {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </p>
                                                {m.is_mine && (
                                                    <CheckCheck className={cn("h-3 w-3", m.read_at ? "text-emerald-300" : "text-white/30")} />
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                </React.Fragment>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </main>

            {/* Composer: Clean, Capsule & Floating with smooth focus */}
            <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-[calc(18px+env(safe-area-inset-bottom))] pointer-events-none">
                <div className="mx-auto max-w-2xl w-full flex items-end gap-3 pointer-events-auto">
                    <div className="flex-1 bg-white/95 backdrop-blur-xl rounded-[28px] border border-black/[0.03] px-3.5 py-1.5 flex items-end gap-1 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] ring-[#0088CC]/0 focus-within:ring-2 focus-within:ring-[#0088CC]/60 transition-all duration-300">
                        <button className="h-10 w-10 flex-none flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                            <Smile className="h-5.5 w-5.5" />
                        </button>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    void handleSend();
                                }
                            }}
                            placeholder="Tulis pesan..."
                            className="w-full bg-transparent border-none focus:ring-0 text-[15.5px] py-2.5 resize-none max-h-36 min-h-[46px] font-medium placeholder:text-slate-300 text-slate-900"
                            rows={1}
                        />
                         <button className="h-10 w-10 flex-none flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                            <ImageIcon className="h-5.5 w-5.5" />
                        </button>
                    </div>
                    <button
                        onClick={() => void handleSend()}
                        disabled={!text.trim() || sending || !partner.relationship?.is_mutual_follow}
                        className={cn(
                            "h-12 w-12 flex items-center justify-center rounded-full transition-all active:scale-95 shadow-lg",
                            text.trim() && partner.relationship?.is_mutual_follow
                                ? "bg-[#0088CC] text-white shadow-[#0088CC]/30"
                                : "bg-white text-slate-200 shadow-none border border-black/[0.02]"
                        )}
                    >
                        {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5.5 w-5.5 fill-current" />}
                    </button>
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
                            <p className="text-[12px] font-black tracking-wide">{toast.message}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
