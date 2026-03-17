'use client';

import React, { useState, useEffect, use } from 'react';
import MobileAppLayout from '@/layouts/MobileAppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronDown, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import HookCard from '@/components/cards/HookCard';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { getStudyPathDetail, completeStudyPathStep } from '@/services/journeys.service';

export default function JourneyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();

    const [pathData, setPathData] = useState<any>(null);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [expandedDay, setExpandedDay] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        getStudyPathDetail(slug)
            .then((data) => {
                if (data.path) setPathData(data.path);
                else setError(true);
                if (data.userProgress) setCompletedSteps(data.userProgress);
            })
            .catch((e) => {
                console.error(e);
                setError(true);
            })
            .finally(() => setLoading(false));
    }, [slug]);

    const handleCompleteDay = async (stepId: number) => {
        try {
            const data = await completeStudyPathStep(slug, stepId);
            if (data?.progress?.completed_step_ids) {
                setCompletedSteps(data.progress.completed_step_ids);
            } else {
                setCompletedSteps((prev) => [...prev, stepId]);
            }
            setExpandedDay(null);
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 500);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <MobileAppLayout
                title="Memuat..."
                activeNavId="paths"
                backHref="/paths"
                className="md:max-w-none bg-background text-foreground min-h-screen"
            >
                <div className="flex h-screen items-center justify-center text-muted-foreground">Memuat perjalanan...</div>
            </MobileAppLayout>
        );
    }

    if (error || !pathData) {
        return (
            <MobileAppLayout
                title="Perjalanan Tidak Ditemukan"
                activeNavId="paths"
                backHref="/paths"
                className="md:max-w-none bg-background text-foreground min-h-screen"
            >
                <div className="flex h-screen flex-col items-center pt-32 text-center px-4">
                    <p className="text-muted-foreground mb-4">Perjalanan ini tidak dapat ditemukan atau gagal dimuat dari server.</p>
                    <button 
                        onClick={() => router.push('/paths')}
                        className="bg-surface hover:bg-surface-elevated transition-all text-foreground font-medium px-6 py-3 rounded-full text-sm shadow-sm ring-1 ring-border/50"
                    >
                        Kembali ke Perpustakaan
                    </button>
                </div>
            </MobileAppLayout>
        );
    }

    const title = pathData.title_id || pathData.title_en || 'Spiritual Journey';
    const days = pathData.steps || [];
    const totalDays = days.length;
    
    // Determine progress based on completed steps.
    let currentProgressIndex = 0;
    days.forEach((day: any, idx: number) => {
        if (completedSteps.includes(day.id)) {
            currentProgressIndex = Math.max(currentProgressIndex, idx + 1);
        }
    });

    return (
        <MobileAppLayout
            title={title}
            activeNavId="paths"
            backHref="/paths"
            className="md:max-w-none bg-background text-foreground min-h-screen"
        >
            <div className="mx-auto w-full max-w-[720px] px-4 pb-28 pt-2">
                {/* Hero / Progress Status */}
                <div className="mb-10 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-surface-muted border border-border/50 p-2 shadow-card">
                            {/* SVG Circle Progress */}
                            <svg className="absolute inset-0 h-full w-full rotate-[-90deg]">
                                <circle cx="48" cy="48" r="45" className="fill-none stroke-border/50 stroke-[4]" />
                                <motion.circle
                                    cx="48" cy="48" r="45"
                                    className="fill-none stroke-brand stroke-[4] transition-all duration-1000 ease-in-out"
                                    strokeDasharray="283"
                                    strokeDashoffset={283 - (283 * currentProgressIndex) / (totalDays || 1)}
                                />
                            </svg>
                            <div className="text-center font-serif">
                                <span className="text-2xl font-bold text-foreground">{currentProgressIndex}</span>
                                <span className="text-xs text-muted-foreground">/{totalDays}</span>
                            </div>
                        </div>
                    </div>
                    <h2 className="font-serif text-2xl font-normal leading-tight text-foreground">
                        {currentProgressIndex >= totalDays && totalDays > 0 ? 'Perjalanan Selesai!' : `Lanjut Hari ke-${currentProgressIndex + 1}`}
                    </h2>
                </div>

                {/* Vertical Timeline */}
                <div className="relative space-y-4 before:absolute before:bottom-0 before:left-[27px] before:top-4 before:w-[2px] before:bg-border/50">
                    {days.map((day: any, idx: number) => {
                        const isCompleted = completedSteps.includes(day.id);
                        const isLocked = !isCompleted && idx > currentProgressIndex;
                        const isActive = idx === currentProgressIndex; // The day they should read right now
                        const isExpanded = expandedDay === idx;
                        const dayTitle = day.title_id || day.title_en || `Hari ${day.step_order}`;
                        const dayContent = day.content_id || day.content_en || '';
                        const verseRef = day.verse_reference || 'mzm-23-4';

                        return (
                            <div key={day.id} className="relative z-10 pl-16">
                                {/* Timeline Node */}
                                <div className={cn(
                                    "absolute left-[16px] top-6 flex h-[24px] w-[24px] items-center justify-center rounded-full border-4 border-background transition-colors",
                                    isCompleted ? "bg-brand text-background" : (isActive ? "bg-amber-500 animate-pulse text-amber-900" : "bg-surface-muted text-muted-foreground")
                                )}>
                                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-2 w-2 rounded-full bg-current" />}
                                </div>

                                <Card 
                                    className={cn(
                                        "overflow-hidden transition-all duration-300 rounded-[28px] border-border/50",
                                        isLocked ? "bg-surface/50 opacity-50 select-none" : "bg-surface hover:bg-surface-elevated shadow-soft",
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
                                                    isCompleted ? "text-brand" : (isActive ? "text-amber-500" : "text-muted-foreground")
                                                )}>
                                                    {isCompleted ? 'Selesai' : `Hari ${day.step_order}`}
                                                </span>
                                                <h3 className={cn("font-serif text-lg", isLocked ? "text-muted-foreground" : "text-foreground")}>
                                                    {dayTitle}
                                                </h3>
                                            </div>
                                        </div>
                                        <div>
                                            {isLocked ? <Lock className="h-5 w-5 text-muted-foreground" /> : 
                                            isCompleted ? null : 
                                            <ChevronDown className={cn("h-5 w-5 transition-transform text-muted-foreground", isExpanded && "rotate-180")} />}
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    <AnimatePresence>
                                        {isExpanded && !isLocked && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-border/50"
                                            >
                                                <div className="p-6 md:p-8 space-y-6">
                                                    <p className="text-foreground/80 leading-relaxed font-medium">
                                                        {dayContent}
                                                    </p>
                                                    
                                                    <HookCard
                                                        variant="highlight"
                                                        hookText="Bagaimana perasaanmu tentang hal ini hari ini?"
                                                        verseReference={verseRef}
                                                        relevanceText="Renungkan sabda ini sebelum mengakhiri harimu."
                                                        primaryAction={{
                                                            type: 'reflect',
                                                            href: `/reflections/${slug}-day-${day.step_order}`,
                                                            label: 'Baca Renungan & Selesaikan'
                                                        }}
                                                    />

                                                    <div className="pt-4 flex justify-end gap-3">
                                                        <button 
                                                            onClick={() => setExpandedDay(null)}
                                                            className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                                        >
                                                            Tutup
                                                        </button>
                                                        <button 
                                                            onClick={() => handleCompleteDay(day.id)}
                                                            className="flex items-center gap-2 px-6 py-2 rounded-full bg-brand text-background text-sm font-bold shadow-soft hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all ring-1 ring-background/10"
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
                
                {currentProgressIndex >= totalDays && totalDays > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="mt-12 text-center"
                    >
                        <button 
                            onClick={() => router.push('/paths')}
                            className="bg-surface hover:bg-surface-elevated transition-all text-foreground font-medium px-6 py-3 rounded-full text-sm shadow-sm ring-1 ring-border/50"
                        >
                            Jelajahi Perjalanan Lainnya
                        </button>
                    </motion.div>
                )}
            </div>
        </MobileAppLayout>
    );
}
