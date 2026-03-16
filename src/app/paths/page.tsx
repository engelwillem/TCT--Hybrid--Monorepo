'use client';

import React from 'react';
import MobileAppLayout from '@/layouts/MobileAppLayout';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass, Clock, CheckCircle2, PlayCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Dummy Journey List
const JOURNEYS = [
    {
        id: 'mengelola-kecewa',
        title: '7 Hari Mengelola Kecewa',
        description: 'Langkah alkitabiah untuk berdamai dengan ekspektasi yang patah dan menemukan kembali harapan.',
        total_days: 7,
        thumbnail_color: 'from-rose-500/20 to-orange-500/5',
        icon: Compass,
    },
    {
        id: 'dasar-iman',
        title: 'Fondasi Iman 101',
        description: 'Memahami kembali pilar-pilar kekristenan dalam bahasa yang relevan dengan hari ini.',
        total_days: 14,
        thumbnail_color: 'from-sky-500/20 to-blue-500/5',
        icon: Compass,
    }
];

export default function PathsLibraryPage() {
    return (
        <MobileAppLayout
            title="Spiritual Journeys"
            activeNavId="paths"
            backHref="/today"
            className="md:max-w-none bg-slate-950 text-white min-h-screen"
            header={
                <div className="px-4 py-4 md:px-0">
                    <h1 className="font-serif text-3xl font-medium tracking-tight text-white">
                        Spiritual Journeys
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Pilih satu jalan, dan bertumbuhlah satu hari pada satu waktu.
                    </p>
                </div>
            }
        >
            <div className="mx-auto w-full max-w-[720px] px-4 pb-28 pt-2">
                <div className="grid gap-5 md:grid-cols-2">
                    {JOURNEYS.map((item, idx) => {
                        // In MVP we simulate 0 progress locally just for the list
                        const progress = idx === 0 ? 2 : 0; // Fake state for visual
                        const isActive = progress > 0;
                        const Icon = item.icon;

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Link href={`/paths/${item.id}`}>
                                    <Card className="group relative overflow-hidden rounded-[32px] border-white/5 bg-white/[0.02] transition-colors hover:bg-white/[0.04]">
                                        <div className={`absolute inset-0 bg-gradient-to-br ${item.thumbnail_color} opacity-20`} />
                                        
                                        <CardContent className="relative p-6">
                                            <div className="mb-4 flex items-center justify-between">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 backdrop-blur-md ring-1 ring-white/10">
                                                    <Icon className="h-6 w-6 text-white/70" />
                                                </div>
                                                <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/50 ring-1 ring-white/10">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {item.total_days} Hari
                                                </div>
                                            </div>

                                            <h3 className="mb-2 font-serif text-xl font-medium text-white group-hover:text-brand transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-slate-400">
                                                {item.description}
                                            </p>

                                            <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                                <div className="flex items-center gap-2">
                                                    {isActive ? (
                                                        <span className="text-xs font-bold uppercase tracking-widest text-brand">
                                                            Lanjut Hari {progress + 1}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                                            Belum Dimulai
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-slate-950 transition-transform group-hover:scale-110">
                                                    {isActive ? <PlayCircle className="h-4 w-4" /> : <ChevronRightIcon />}
                                                </div>
                                            </div>
                                            
                                            {/* Progress Bar */}
                                            {isActive && (
                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                                                    <div 
                                                        className="h-full bg-brand transition-all duration-1000" 
                                                        style={{ width: `${(progress / item.total_days) * 100}%` }} 
                                                    />
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </MobileAppLayout>
    );
}

function ChevronRightIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="m9 18 6-6-6-6"/>
        </svg>
    );
}
