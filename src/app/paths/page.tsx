'use client';

import React, { useState, useEffect } from 'react';
import MobileAppLayout from '@/layouts/MobileAppLayout';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass, Clock, PlayCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getStudyPaths } from '@/services/journeys.service';

export default function PathsLibraryPage() {
    const [paths, setPaths] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getStudyPaths()
            .then((data) => {
                if (data.paths) setPaths(data.paths);
            })
            .catch((e) => console.error(e))
            .finally(() => setLoading(false));
    }, []);

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
                {loading ? (
                    <div className="flex h-32 items-center justify-center text-white/50">Memuat perjalanan...</div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2">
                        {paths.map((item, idx) => {
                            const title = item.title_id || item.title_en || item.slug;
                            const description = item.description_id || item.description_en || '';
                            const isActive = false; // Need user progress on index if we want progress display

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Link href={`/paths/${item.slug}`}>
                                        <Card className="group relative overflow-hidden rounded-[32px] border-white/5 bg-white/[0.02] transition-colors hover:bg-white/[0.04]">
                                            <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-brand/5 opacity-20" />
                                            
                                            <CardContent className="relative p-6">
                                                <div className="mb-4 flex items-center justify-between">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 backdrop-blur-md ring-1 ring-white/10">
                                                        <Compass className="h-6 w-6 text-white/70" />
                                                    </div>
                                                    <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/50 ring-1 ring-white/10">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {item.estimated_minutes || 0} Menit / sesi
                                                    </div>
                                                </div>

                                                <h3 className="mb-2 font-serif text-xl font-medium text-white group-hover:text-brand transition-colors">
                                                    {title}
                                                </h3>
                                                <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-slate-400">
                                                    {description}
                                                </p>

                                                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                                    <div className="flex items-center gap-2">
                                                        {isActive ? (
                                                            <span className="text-xs font-bold uppercase tracking-widest text-brand">
                                                                Lanjut
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                                                Mulai Perjalanan
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-slate-950 transition-transform group-hover:scale-110">
                                                        {isActive ? <PlayCircle className="h-4 w-4" /> : <ChevronRightIcon />}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
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
