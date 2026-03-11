"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bookmark, 
    ChevronLeft, 
    ChevronRight, 
    Heart, 
    MessageCircle, 
    Send, 
    X,
    Share2,
    BookOpen,
    ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Day = {
    day_key: string;
    date: string;
    title: string;
    content: string;
    cover_image_url: string;
    media_links?: any[];
};

export default function SabbathSchoolDayPage() {
    const params = useParams();
    const router = useRouter();
    const { year, quarter, lessonNumber, dayKey } = params;

    const [day, setDay] = useState<Day | null>(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [commentOpen, setCommentOpen] = useState(false);

    useEffect(() => {
        // Mocking parity data for DayShow
        setTimeout(() => {
            setDay({
                day_key: dayKey as string,
                date: '2024-03-11',
                title: 'Kedaulatan Allah dalam Mazmur',
                content: `
                    <p>Mazmur adalah kumpulan doa dan puji-pujian yang mengungkapkan seluruh spektrum emosi manusia di hadapan Allah. Dalam pelajaran hari ini, kita akan melihat bagaimana kedaulatan Allah dinyatakan...</p>
                    <p>Bacalah Mazmur 23:1-6. Bagaimana gambaran Tuhan sebagai Gembala mengubah perspektif kita tentang tantangan hidup?</p>
                `,
                cover_image_url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1200'
            });
            setLoading(false);
        }, 800);
    }, [dayKey]);

    if (loading || !day) {
        return (
            <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
                <div className="h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 pb-24">
            {/* Header Parity */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3">
                <div className="mx-auto max-w-3xl flex items-center justify-between">
                    <button 
                        onClick={() => router.back()}
                        className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lesson {lessonNumber}</p>
                        <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{day.title}</p>
                    </div>
                    <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-50 transition-all active:scale-95">
                        <Share2 className="h-5 w-5 text-slate-500" />
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-3xl">
                {/* Hero Parity */}
                <div className="relative aspect-video w-full overflow-hidden md:rounded-b-[40px]">
                    <img 
                        src={day.cover_image_url} 
                        className="h-full w-full object-cover" 
                        alt={day.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-8">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white ring-1 ring-white/20 backdrop-blur-sm">
                            Senin, 11 Maret
                        </div>
                        <h1 className="mt-4 text-3xl font-bold text-white tracking-tight leading-realsed">
                            {day.title}
                        </h1>
                    </div>
                </div>

                {/* Reader Content Parity */}
                <article className="px-6 py-10 md:px-12 prose prose-slate max-w-none">
                    <div 
                        dangerouslySetInnerHTML={{ __html: day.content }} 
                        className="text-[17px] leading-relaxed text-slate-800 space-y-6 selection:bg-cyan-100"
                    />
                </article>

                {/* Action Bar Parity */}
                <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-slate-100 p-4 pb-8 z-40">
                    <div className="mx-auto max-w-3xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={() => setLiked(!liked)}
                                className={cn(
                                    "flex h-12 px-5 items-center gap-2.5 rounded-full transition-all active:scale-90",
                                    liked ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-500"
                                )}
                             >
                                <Heart className={cn("h-5 w-5", liked ? "fill-rose-500" : "")} />
                                <span className="text-sm font-bold">124</span>
                             </button>
                             <button className="h-12 w-12 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 active:scale-90">
                                <MessageCircle className="h-5 w-5" />
                             </button>
                        </div>

                        <div className="flex items-center gap-2">
                             <button className="h-12 w-12 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 active:scale-90">
                                <BookOpen className="h-5 w-5" />
                             </button>
                             <button 
                                onClick={() => setBookmarked(!bookmarked)}
                                className={cn(
                                    "h-12 w-12 flex items-center justify-center rounded-full transition-all active:scale-90",
                                    bookmarked ? "bg-cyan-50 text-cyan-600" : "bg-slate-50 text-slate-500"
                                )}
                             >
                                <Bookmark className={cn("h-5 w-5", bookmarked ? "fill-cyan-500" : "")} />
                             </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
