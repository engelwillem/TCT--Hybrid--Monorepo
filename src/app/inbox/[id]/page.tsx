
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
            {/* Thread Header Parity */}
            <header className="flex-none bg-surface/80 backdrop-blur-md border-b border-border/50 px-4 py-3 z-10 shadow-sm">
                <div className="mx-auto max-w-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push('/inbox')} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-surface-elevated transition-all active:scale-90">
                            <ArrowLeft className="h-5 w-5 text-foreground" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="h-10 w-10 rounded-2xl bg-surface-muted border border-border/50 flex items-center justify-center text-brand font-black">
                                    {partner.name.slice(0, 1).toUpperCase()}
                                </div>
                                {partner.online && (
                                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background ring-1 ring-emerald-500/20" />
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-[15px] text-foreground leading-tight">{partner?.name}</p>
                                <p className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest",
                                    partner?.online ? "text-emerald-500" : "text-muted-foreground"
                                )}>
                                    {partner?.online ? 'Online' : 'Offline'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-surface-elevated text-muted-foreground">
                        <MoreVertical className="h-5 w-5" />
                    </button>
                </div>
            </header>

            <main 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth scrollbar-hide bg-background"
            >
                <div className="mx-auto max-w-2xl space-y-4 pt-4 pb-10">
                    <AnimatePresence initial={false}>
                        {messages.map((m) => (
                            <motion.div 
                                key={m.id}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className={cn("flex w-full", m.is_mine ? "justify-end" : "justify-start")}
                            >
                                <div className={cn(
                                    "max-w-[85%] px-5 py-3.5 rounded-[28px] shadow-sm text-[15px] leading-relaxed relative",
                                    m.is_mine
                                        ? "bg-foreground text-background rounded-br-none"
                                        : "bg-surface text-foreground ring-1 ring-border/50 rounded-bl-none"
                                )}>
                                    <p className="font-medium whitespace-pre-wrap">{m.body}</p>
                                    <div className={cn(
                                        "flex items-center justify-end gap-1.5 mt-1.5 opacity-50",
                                        m.is_mine ? "text-background" : "text-muted-foreground"
                                    )}>
                                        <p className="text-[9px] font-bold uppercase tracking-widest">
                                            {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </p>
                                        {m.is_mine && (
                                            <CheckCheck className={cn("h-3 w-3", m.read_at ? "text-brand" : "text-background")} />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </main>

            {/* Composer Parity */}
            <footer className="flex-none bg-surface/80 backdrop-blur-md p-4 pb-[calc(16px+env(safe-area-inset-bottom))] border-t border-border/50">
                <div className="mx-auto max-w-2xl flex items-end gap-3">
                    <div className="flex-1 bg-surface-muted rounded-[28px] border border-border/50 px-4 py-2 flex items-end gap-2">
                        <button className="h-10 w-10 flex-none flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
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
                            className="w-full bg-transparent border-none focus:ring-0 text-[15px] py-2.5 resize-none max-h-32 min-h-[44px] font-medium placeholder:text-muted-foreground/50 text-foreground"
                            rows={1}
                        />
                        <button className="h-10 w-10 flex-none flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                            <ImageIcon className="h-5.5 w-5.5" />
                        </button>
                    </div>
                    <button
                        onClick={() => void handleSend()}
                        disabled={!text.trim() || sending}
                        className={cn(
                            "h-13 w-13 flex items-center justify-center rounded-full transition-all active:scale-90 shadow-soft",
                            text.trim() ? "bg-foreground text-background" : "bg-surface-muted text-muted-foreground/30 shadow-none border border-border/50"
                        )}
                    >
                        {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5.5 w-5.5 fill-current" />}
                    </button>
                </div>
            </footer>

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
