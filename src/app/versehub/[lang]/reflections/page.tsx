"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareQuote, Lock, Globe, ChevronRight, Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Reflection = {
    id: number;
    verse_ref: string;
    question_text: string;
    answer_text: string;
    is_private: boolean;
    created_at: string;
};

export default function ReflectionsJournalPage() {
    const params = useParams();
    const router = useRouter();
    const lang = params?.lang as string || 'id';
    const isId = lang === 'id';

    const [reflections, setReflections] = useState<Reflection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mocking reflection data for parity
        setTimeout(() => {
            setReflections([
                { id: 201, verse_ref: 'yoh-3-16', question_text: 'Apa yang Firman katakan pada hatimu hari ini?', answer_text: 'Tuhan begitu mencintai saya, apa pun keadaan saya saat ini. Ini memberi saya kekuatan untuk menghadapi hari baru.', is_private: true, created_at: new Date().toISOString() },
                { id: 202, verse_ref: 'mat-5-1', question_text: 'Bagaimana perasaanmu setelah membaca bagian ini?', answer_text: 'Ajarannya begitu dalam, menantang saya untuk hidup lebih berdampak.', is_private: false, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
            ]);
            setLoading(false);
        }, 600);
    }, []);

    return (
        <div className="min-h-screen bg-[#FAFAF8] text-slate-900 pb-20">
            {/* Header Parity with MobileAppLayout style */}
            <div className="sticky top-0 z-40 bg-[#FAFAF8]/80 backdrop-blur-md border-b border-slate-200/60">
                <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
                    <button onClick={() => router.back()} className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 active:scale-95">
                        <X className="h-4 w-4" />
                    </button>
                    <h1 className="font-bold text-lg">{isId ? 'Jurnal Refleksi' : 'Reflection Journal'}</h1>
                    <div className="w-10" />
                </div>
            </div>

            <div className="mx-auto max-w-2xl px-4 py-8">
                <header className="mb-10 text-center">
                    <h2 className="mb-2 text-3xl font-bold text-slate-900">
                        {isId ? 'Percakapan Hati' : 'Heart Conversations'}
                    </h2>
                    <p className="text-sm text-slate-500">
                        {isId
                            ? 'Kumpulan percakapanmu dengan Firman Tuhan.'
                            : 'A collection of your conversations with God’s Word.'}
                    </p>
                </header>

                {loading ? (
                    <div className="space-y-6">
                        {[1, 2].map(i => (
                            <div key={i} className="h-48 bg-slate-200/50 rounded-[32px] animate-pulse" />
                        ))}
                    </div>
                ) : reflections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-[32px] bg-slate-50 py-16 text-center border border-dashed border-slate-200">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
                            <MessageSquareQuote className="h-8 w-8" />
                        </div>
                        <p className="max-w-[200px] text-sm font-medium text-slate-400">
                            {isId
                                ? 'Refleksimu belum ada. Mari mulai membaca Alkitab.'
                                : 'No reflections yet. Let’s start reading the Bible.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {reflections.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative overflow-hidden rounded-[32px] border border-slate-100 bg-white p-6 shadow-soft transition-all hover:shadow-md ring-1 ring-black/[0.02]"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                            <MessageSquareQuote className="h-4 w-4" />
                                        </span>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                            {item.verse_ref.toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-400">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(item.created_at).toLocaleDateString(isId ? 'id-ID' : 'en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>

                                <div className="mb-4 space-y-3">
                                    <p className="font-serif text-lg italic leading-relaxed text-slate-700">
                                        "{item.question_text}"
                                    </p>
                                    <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600 border border-slate-100">
                                        {item.answer_text}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-6">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                                        {item.is_private ? (
                                            <>
                                                <Lock className="h-3 w-3" />
                                                {isId ? 'Privat' : 'Private'}
                                            </>
                                        ) : (
                                            <>
                                                <Globe className="h-3 w-3" />
                                                {isId ? 'Publik' : 'Public'}
                                            </>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => router.push(`/versehub/${lang}/${item.verse_ref.split('-').slice(0, 2).join('-')}`)}
                                        className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:underline active:scale-95 transition-all"
                                    >
                                        {isId ? 'Baca Pasal' : 'Read Chapter'}
                                        <ChevronRight className="h-3 w-3" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
