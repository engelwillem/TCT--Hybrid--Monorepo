"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, CircleCheckBig, LayoutGrid, MoveRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Channel = {
    id: number;
    slug: string;
    title: string;
    description?: string | null;
    cover_image_url?: string | null;
    type: string;
    members_count?: number;
    is_joined?: boolean;
};

type Lesson = {
    id: number;
    lesson_number: number;
    title?: string | null;
    start_date: string;
    end_date: string;
};

type QuarterWithLessons = {
    id: number;
    year: number;
    quarter: number;
    title?: string | null;
    start_date: string;
    end_date: string;
    is_active: boolean;
    lessons: Lesson[];
};

type TodayTarget = { 
    year: number; 
    quarter: number; 
    lesson_number: number; 
    day_key: string; 
    date: string 
} | null;

export default function ChannelsPage() {
    const router = useRouter();
    
    // State management for parity
    const [channels, setChannels] = useState<Channel[]>([]);
    const [sabbathSchool, setSabbathSchool] = useState<{
        channel?: Channel | null;
        activeQuarterId?: number | null;
        activeQuarter?: any;
        quartersWithLessons?: QuarterWithLessons[];
        todayTarget?: TodayTarget;
    } | null>(null);
    
    const [seriesTab, setSeriesTab] = useState<'current' | 'past' | 'upcoming'>('current');
    const [lessonView, setLessonView] = useState<'active' | 'archived'>('active');
    const [selectedQuarterId, setSelectedQuarterId] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [heroLoaded, setHeroLoaded] = useState(false);

    useEffect(() => {
        // Mocking parity data
        setTimeout(() => {
            setChannels([
                { id: 1, slug: 'god-first', title: 'God First', description: 'Renungan pagi harian.', type: 'weekly', members_count: 1200, is_joined: true },
                { id: 2, slug: 'faith-journey', title: 'Faith Journey', description: 'Perjalanan iman kita.', type: 'weekly', members_count: 850, is_joined: false },
            ]);
            
            const mockQuarters: QuarterWithLessons[] = [
                {
                    id: 101, year: 2024, quarter: 1, title: 'Mazmur', start_date: '2024-01-01', end_date: '2024-03-31', is_active: true,
                    lessons: [
                        { id: 1, lesson_number: 1, title: 'Cara Membaca Mazmur', start_date: '2024-01-01', end_date: '2024-01-07' },
                        { id: 2, lesson_number: 2, title: 'Mazmur Ratapan', start_date: '2024-01-08', end_date: '2024-01-14' },
                    ]
                }
            ];
            
            setSabbathSchool({
                channel: { id: 0, slug: 'sabbath-school', title: 'Sabbath School', type: 'ss', cover_image_url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=800' },
                activeQuarterId: 101,
                quartersWithLessons: mockQuarters,
                todayTarget: { year: 2024, quarter: 1, lesson_number: 1, day_key: 'day-1', date: '2024-01-01' }
            });
            setSelectedQuarterId(101);
            setLoading(false);
        }, 800);
    }, []);

    const quarters = sabbathSchool?.quartersWithLessons ?? [];
    const selectedQuarter = quarters.find(q => q.id === selectedQuarterId) ?? quarters[0] ?? null;
    const lessonStates = selectedQuarter?.lessons.map(l => ({
        lesson: l,
        locked: false,
        completed: false,
        isCurrent: l.lesson_number === 1
    })) ?? [];

    const progressPct = 0; // Simplified for parity demo
    const filteredLessons = lessonStates;

    return (
        <div className="min-h-screen bg-[#FAFAF8] text-slate-900 pb-20">
            {/* App Head Overlay Parity */}
            <div className="sticky top-0 z-40 bg-[#FAFAF8]/80 backdrop-blur-md border-b border-slate-200/60 transition-all">
                <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
                    <h1 className="font-bold text-lg">Channels</h1>
                    <div className="w-10" />
                </div>
            </div>

            <main className="mx-auto max-w-2xl px-4 py-8 space-y-8">
                {/* Sabbath School Section Parity */}
                <motion.section 
                    initial={{ opacity: 0, y: 16 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="overflow-hidden rounded-[32px] bg-white shadow-soft ring-1 ring-black/[0.04]"
                >
                    <div className="relative h-48 md:h-56">
                        <img
                            src={sabbathSchool?.channel?.cover_image_url ?? "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=800"}
                            alt="Sabbath School"
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-6">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white ring-1 ring-white/20 backdrop-blur-sm">
                                SabbathSchool
                            </div>
                            <h2 className="mt-2 text-2xl font-bold text-white">{selectedQuarter?.title ?? 'Quarter Study'}</h2>
                            <p className="mt-1 text-xs text-white/80 font-medium">Jan - Mar 2024</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        <Button 
                            className="h-14 w-full rounded-[20px] bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white shadow-lg active:scale-95 transition-all text-sm"
                            onClick={() => {
                                if (sabbathSchool?.todayTarget) {
                                    const t = sabbathSchool.todayTarget;
                                    router.push(`/channels/sabbath-school/${t.year}/q${t.quarter}/lesson/${t.lesson_number}/${t.day_key}`);
                                }
                            }}
                        >
                            Lanjutkan Pelajaran <MoveRight className="ml-2 h-4 w-4" />
                        </Button>

                        {/* Tabs Bar Parity */}
                        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-50 p-1.5 ring-1 ring-slate-100">
                             {(['current', 'past', 'upcoming'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setSeriesTab(tab)}
                                    className={cn(
                                        "rounded-xl py-2 text-[11px] font-bold transition-all",
                                        seriesTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                                    )}
                                >
                                    {tab === 'current' ? 'Aktif' : tab === 'past' ? 'Lalu' : 'Mendatang'}
                                </button>
                             ))}
                        </div>

                        {/* Lesson Progress Parity */}
                        <div className="space-y-3 rounded-[24px] bg-slate-50 p-5 ring-1 ring-slate-100">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-800 tracking-tight">Lessons</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">0/{lessonStates.length} Completed</p>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 w-0" />
                            </div>

                            <div className="grid gap-2.5 mt-4">
                                {filteredLessons.map(({ lesson, locked, isCurrent }) => (
                                    <button
                                        key={lesson.id}
                                        onClick={() => {
                                             router.push(`/channels/sabbath-school/${selectedQuarter?.year}/q${selectedQuarter?.quarter}/lesson/${lesson.lesson_number}`);
                                        }}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-2xl bg-white ring-1 ring-black/[0.02] shadow-sm transition-all text-left",
                                            isCurrent ? "ring-cyan-500/30 bg-cyan-50/50" : ""
                                        )}
                                    >
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lesson {lesson.lesson_number}</p>
                                            <p className="font-bold text-sm text-slate-900 mt-1">{lesson.title}</p>
                                        </div>
                                        {isCurrent && <span className="bg-cyan-500 rounded-full px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-widest">Sekarang</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Sub-Channels Section Parity */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                         <h3 className="text-lg font-bold tracking-tight">Channel Lainnya</h3>
                         <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full ring-1 ring-cyan-100">
                            {channels.length} Kanal
                         </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {channels.map(channel => (
                            <button
                                key={channel.slug}
                                onClick={() => router.push(`/channels/${channel.slug}`)}
                                className="group flex flex-col overflow-hidden rounded-[32px] bg-white shadow-soft ring-1 ring-black/[0.04] transition-all hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="relative h-32 w-full overflow-hidden">
                                    <img
                                        src={channel.cover_image_url ?? "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800"}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
                                </div>
                                <div className="p-4 pt-3 flex-1 flex flex-col justify-between">
                                    <div>
                                        <p className="font-bold text-sm tracking-tight text-slate-900 line-clamp-1">{channel.title}</p>
                                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{channel.description}</p>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <div className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse" />
                                            <span className="text-[9px] font-bold text-slate-400">{channel.members_count} anggota</span>
                                        </div>
                                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-cyan-500 transition-colors" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}