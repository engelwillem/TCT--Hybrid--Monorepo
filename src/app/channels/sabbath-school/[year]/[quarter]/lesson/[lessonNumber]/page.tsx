"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, CalendarDays, BookOpen, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAppAccessToken } from '@/services/app-auth-token';

type Day = {
    day_key: string;
    date: string;
    title: string;
    status: string;
};

export default function SabbathSchoolLessonPage() {
    const params = useParams();
    const router = useRouter();
    const yearParam = params?.year;
    const quarterParam = params?.quarter;
    const lessonParam = params?.lessonNumber;
    const year = Array.isArray(yearParam) ? yearParam[0] : yearParam;
    const quarter = Array.isArray(quarterParam) ? quarterParam[0] : quarterParam;
    const lessonNumber = Array.isArray(lessonParam) ? lessonParam[0] : lessonParam;

    const [days, setDays] = useState<Day[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!year || !quarter || !lessonNumber) return;

        let isActive = true;
        const load = async () => {
            try {
                const token = getAppAccessToken();
                const response = await fetch(`/api/sabbath-school/${year}/${quarter}/lesson/${lessonNumber}`, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    cache: 'no-store',
                });
                if (!response.ok) return;
                const payload = await response.json();
                if (!isActive) return;
                setDays(Array.isArray(payload.days) ? payload.days : []);
            } catch {
                // Keep UI stable when API is unreachable.
            } finally {
                if (isActive) setLoading(false);
            }
        };
        load();
        return () => {
            isActive = false;
        };
    }, [year, quarter, lessonNumber]);

    const formatShortDate = (iso: string) => {
        try {
            const d = new Date(iso);
            return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(d);
        } catch {
            return iso;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
                <div className="h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAF8] text-slate-900 pb-20">
            {/* Header Parity */}
            <div className="sticky top-0 z-40 bg-[#FAFAF8]/80 backdrop-blur-md border-b border-slate-200/60">
                <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
                    <button onClick={() => router.back()} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/50 active:scale-95 transition-all">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lesson {lessonNumber}</p>
                        <h1 className="font-bold text-base leading-tight">Materi Mingguan</h1>
                    </div>
                    <div className="w-10" />
                </div>
            </div>

            <main className="mx-auto max-w-2xl px-4 py-8 space-y-4">
                <div className="grid gap-3">
                    {days.map((day) => (
                        <button
                            key={day.day_key}
                            onClick={() => router.push(`/channels/sabbath-school/${year}/${quarter}/lesson/${lessonNumber}/${day.day_key}`)}
                            className="group flex items-center justify-between p-5 rounded-[28px] bg-white shadow-soft ring-1 ring-black/[0.03] transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-5">
                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex flex-col items-center justify-center ring-1 ring-slate-100">
                                    <span className="text-[9px] font-bold uppercase text-slate-400">{day.day_key}</span>
                                    <span className="text-sm font-bold text-slate-900">{formatShortDate(day.date)}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-[15px] text-slate-900 leading-tight">{day.title}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <BookOpen className="h-3 w-3 text-cyan-500" />
                                        <span className="text-[11px] font-bold text-slate-400">Baca Materi</span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-cyan-500 transition-colors" />
                        </button>
                    ))}
                </div>

                <div className="pt-8 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">Sabbath School Channel</p>
                </div>
            </main>
        </div>
    );
}
