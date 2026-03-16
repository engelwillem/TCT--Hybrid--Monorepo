'use client';

import React, { useState, useEffect, use } from 'react';
import MobileAppLayout from '@/layouts/MobileAppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronDown, Lock, Unlock, PlayCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import HookCard from '@/components/cards/HookCard';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function JourneyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();

    // In MVP, progress is stored locally
    const [progress, setProgress] = useState(0);
    const [expandedDay, setExpandedDay] = useState<number | null>(null);

    useEffect(() => {
        const savedProgress = localStorage.getItem(`tct_journey_${slug}`);
        if (savedProgress) setProgress(parseInt(savedProgress, 10));
        else setProgress(0); // Day 0 completed means starting Day 1
    }, [slug]);

    const handleCompleteDay = (dayIndex: number) => {
        const newProgress = dayIndex + 1;
        setProgress(newProgress);
        localStorage.setItem(`tct_journey_${slug}`, newProgress.toString());
        setExpandedDay(null);
        // Wait a bit, then scroll up to celebrate
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 500);
    };

    // Dummy curriculum
    const title = slug === 'mengelola-kecewa' ? '7 Hari Mengelola Kecewa' : 'Spiritual Journey';
    const totalDays = 7;
    const days = Array.from({ length: totalDays }).map((_, i) => ({
        dayNumber: i + 1,
        title: `Hari ${i + 1}: ${['Mengakui Luka', 'Menyerahkan Kendali', 'Mengingat Kasih', 'Memilih Percaya', 'Terus Melangkah', 'Berdamai', 'Harapan Baru'][i % 7]}`,
        verseRef: ['mzm-34-19', 'ams-3-5', 'yer-29-11', 'flp-4-6', 'yes-40-31', 'rom-8-28', 'mzm-23-4'][i % 7],
        content: `Merasakan kecewa adalah hal yang manusiawi. Tetapi membiarkan kekecewaan itu mengambil alih hidup kita adalah sebuah pilihan. Hari ini kita belajar untuk memberikan hak veto atas kebahagiaan kita kembali kepada Tuhan.`
    }));

    return (
        <MobileAppLayout
            title={title}
            activeNavId="paths"
            backHref="/paths"
            className="md:max-w-none bg-slate-950 text-white min-h-screen"
        >
            <div className="mx-auto w-full max-w-[720px] px-4 pb-28 pt-2">
                {/* Hero / Progress Status */}
                <div className="mb-10 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/5 border border-white/10 p-2 shadow-2xl">
                            {/* SVG Circle Progress */}
                            <svg className="absolute inset-0 h-full w-full rotate-[-90deg]">
                                <circle cx="48" cy="48" r="45" className="fill-none stroke-white/10 stroke-[4]" />
                                <motion.circle
                                    cx="48" cy="48" r="45"
                                    className="fill-none stroke-brand stroke-[4] transition-all duration-1000 ease-in-out"
                                    strokeDasharray="283"
                                    strokeDashoffset={283 - (283 * progress) / totalDays}
                                />
                            </svg>
                            <div className="text-center font-serif">
                                <span className="text-2xl font-bold">{progress}</span>
                                <span className="text-xs text-white/50">/{totalDays}</span>
                            </div>
                        </div>
                    </div>
                    <h2 className="font-serif text-2xl font-normal leading-tight text-white/90">
                        {progress === totalDays ? 'Perjalanan Selesai!' : `Lanjut Hari ke-${progress + 1}`}
                    </h2>
                </div>

                {/* Vertical Timeline */}
                <div className="relative space-y-4 before:absolute before:bottom-0 before:left-[27px] before:top-4 before:w-[2px] before:bg-white/5">
                    {days.map((day, idx) => {
                        const isCompleted = idx < progress;
                        const isLocked = idx > progress;
                        const isActive = idx === progress; // The day they should read right now
                        const isExpanded = expandedDay === idx;

                        return (
                            <div key={idx} className="relative z-10 pl-16">
                                {/* Timeline Node */}
                                <div className={cn(
                                    "absolute left-[16px] top-6 flex h-[24px] w-[24px] items-center justify-center rounded-full border-4 border-slate-950 transition-colors",
                                    isCompleted ? "bg-brand text-slate-900" : (isActive ? "bg-amber-500 animate-pulse text-amber-900" : "bg-white/20 text-white/50")
                                )}>
                                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-2 w-2 rounded-full bg-current" />}
                                </div>

                                <Card 
                                    className={cn(
                                        "overflow-hidden transition-all duration-300 rounded-[28px] border-white/5",
                                        isLocked ? "bg-white/[0.01] opacity-50 select-none" : "bg-white/[0.03] hover:bg-white/[0.05]",
                                        isActive && !isExpanded ? "ring-1 ring-amber-500/30" : ""
                                    )}
                                >
                                    {/* Header Banner */}
                                    <div 
                                        className={cn(
                                            "flex items-center justify-between p-5 cursor-pointer",
                                            isLocked && "cursor-not-allowed"
                                        )}
                                        onClick={() => {
                                            if (!isLocked) setExpandedDay(isExpanded ? null : idx);
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-widest",
                                                    isCompleted ? "text-brand" : (isActive ? "text-amber-500" : "text-slate-500")
                                                )}>
                                                    {isCompleted ? 'Selesai' : `Hari ${day.dayNumber}`}
                                                </span>
                                                <h3 className={cn("font-serif text-lg", isLocked ? "text-slate-400" : "text-white")}>
                                                    {day.title}
                                                </h3>
                                            </div>
                                        </div>
                                        <div>
                                            {isLocked ? <Lock className="h-5 w-5 text-slate-600" /> : 
                                            isCompleted ? null : 
                                            <ChevronDown className={cn("h-5 w-5 transition-transform text-white/50", isExpanded && "rotate-180")} />}
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    <AnimatePresence>
                                        {isExpanded && !isLocked && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-white/5"
                                            >
                                                <div className="p-6 md:p-8 space-y-6">
                                                    <p className="text-slate-300 leading-relaxed font-medium">
                                                        {day.content}
                                                    </p>
                                                    
                                                    <HookCard
                                                        variant="highlight"
                                                        hookText="Bagaimana perasaanmu tentang hal ini hari ini?"
                                                        verseReference={day.verseRef}
                                                        relevanceText="Renungkan sabda ini sebelum mengakhiri harimu."
                                                        primaryAction={{
                                                            type: 'reflect',
                                                            href: `/reflections/${slug}-day-${day.dayNumber}`,
                                                            label: 'Baca Renungan & Selesaikan'
                                                        }}
                                                    />

                                                    {/* Fake Action for MVP to just jump progress locally */}
                                                    <div className="pt-4 flex justify-end gap-3">
                                                        <button 
                                                            onClick={() => setExpandedDay(null)}
                                                            className="px-4 py-2 rounded-full text-sm font-medium text-slate-400 hover:text-white"
                                                        >
                                                            Tutup
                                                        </button>
                                                        <button 
                                                            onClick={() => handleCompleteDay(idx)}
                                                            className="flex items-center gap-2 px-6 py-2 rounded-full bg-brand text-slate-900 text-sm font-bold shadow-lg shadow-brand/20 active:scale-95 transition-all"
                                                        >
                                                            Selesai Hari Ini
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Card>
                            </div>
                        );
                    })}
                </div>
                
                {progress === totalDays && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="mt-12 text-center"
                    >
                        <button 
                            onClick={() => router.push('/paths')}
                            className="bg-white/10 hover:bg-white/20 transition-all text-white font-medium px-6 py-3 rounded-full text-sm"
                        >
                            Jelajahi Perjalanan Lainnya
                        </button>
                    </motion.div>
                )}
            </div>
        </MobileAppLayout>
    );
}
