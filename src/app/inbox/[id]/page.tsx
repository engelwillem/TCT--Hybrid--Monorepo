"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, 
    ChevronLeft, 
    MoreVertical, 
    Circle, 
    Image as ImageIcon,
    Smile,
    ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = {
    id: number;
    body: string;
    is_mine: boolean;
    created_at: string;
};

type Partner = {
    id: number;
    name: string;
    online: boolean;
    last_seen_at?: string;
};

export default function InboxShowPage() {
    const params = useParams();
    const router = useRouter();
    const partnerId = params?.id;

    const [partner, setPartner] = useState<Partner | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Mocking parity data for Thread
        setTimeout(() => {
            setPartner({
                id: Number(partnerId),
                name: 'Budi Santoso',
                online: true
            });
            setMessages([
                { id: 1, body: 'Halo Budi, bagaimana kabarmu harian ini?', is_mine: true, created_at: '10:00' },
                { id: 2, body: 'Halo! Puji Tuhan baik. Kamu bagaimana?', is_mine: false, created_at: '10:02' },
                { id: 3, body: 'Saya juga baik. Baru saja menyelesaikan renungan di Sabbath School.', is_mine: true, created_at: '10:05' },
                { id: 4, body: 'Wah bagus itu! Pelajaran minggu ini memang sangat memberkati ya.', is_mine: false, created_at: '10:07' },
            ]);
            setLoading(false);
        }, 800);
    }, [partnerId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!text.trim()) return;
        const newMessage = {
            id: Date.now(),
            body: text,
            is_mine: true,
            created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([...messages, newMessage]);
        setText('');
    };

    if (loading || !partner) {
        return (
            <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
                <div className="h-10 w-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[#FAFAF8] flex flex-col">
            {/* Header Parity */}
            <header className="flex-none bg-white border-b border-slate-100 px-4 py-3 z-10 shadow-sm">
                <div className="mx-auto max-w-3xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push('/inbox')} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-50 transition-all active:scale-95">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm">
                                    {partner.name.slice(0, 1)}
                                </div>
                                {partner.online && (
                                    <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-sm text-slate-900 leading-tight">{partner.name}</p>
                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{partner.online ? 'Online' : 'Offline'}</p>
                            </div>
                        </div>
                    </div>
                    <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-50 transition-all text-slate-400">
                        <MoreVertical className="h-5 w-5" />
                    </button>
                </div>
            </header>

            {/* Message Area Parity */}
            <main 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
                <div className="mx-auto max-w-3xl space-y-4 pt-4">
                    <div className="text-center py-6">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">TODAY</span>
                    </div>

                    {messages.map((m) => (
                        <div key={m.id} className={cn("flex w-full", m.is_mine ? "justify-end" : "justify-start")}>
                            <div className={cn(
                                "max-w-[80%] px-5 py-3.5 rounded-[28px] shadow-sm text-[15px] leading-relaxed",
                                m.is_mine 
                                    ? "bg-slate-900 text-white rounded-br-none" 
                                    : "bg-white text-slate-800 ring-1 ring-black/[0.02] rounded-bl-none"
                            )}>
                                <p className="font-medium">{m.body}</p>
                                <p className={cn(
                                    "text-[9px] font-bold uppercase tracking-widest mt-1.5 opacity-60 text-right",
                                    m.is_mine ? "text-white" : "text-slate-400"
                                )}>
                                    {m.created_at}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Input Area Parity */}
            <footer className="flex-none bg-white p-4 pb-8 border-t border-slate-100">
                <div className="mx-auto max-w-3xl flex items-end gap-3">
                    <div className="flex-1 bg-slate-50 rounded-[28px] ring-1 ring-black/[0.03] px-4 py-2 flex items-end gap-2">
                        <button className="h-9 w-9 flex-none flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                            <Smile className="h-5 w-5" />
                        </button>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Tulis pesan..."
                            className="w-full bg-transparent border-none focus:ring-0 text-[15px] py-2 resize-none max-h-32 min-h-[40px] font-medium placeholder:text-slate-400"
                            rows={1}
                        />
                        <button className="h-9 w-9 flex-none flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                            <ImageIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <button 
                        onClick={handleSend}
                        disabled={!text.trim()}
                        className={cn(
                            "h-12 w-12 flex items-center justify-center rounded-full transition-all active:scale-90",
                            text.trim() ? "bg-slate-900 text-white shadow-lg" : "bg-slate-100 text-slate-300"
                        )}
                    >
                        <Send className="h-5 w-5 fill-current" />
                    </button>
                </div>
            </footer>
        </div>
    );
}
