'use client';

import React, { useState, useEffect } from 'react';
import MobileAppLayout from '@/layouts/MobileAppLayout';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass, Clock, PlayCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getStudyPaths } from '@/services/journeys.service';

export default function PathsPage() {
    const [paths, setPaths] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        getStudyPaths()
            .then((data) => {
                if (data.paths) setPaths(data.paths);
                else setError(true);
            })
            .catch((e) => {
                console.error(e);
                setError(true);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <MobileAppLayout
            title="Spiritual Journeys"
            activeNavId="paths"
            backHref="/today"
            className="md:max-w-none bg-background text-foreground min-h-screen"
            header={
                <div className="px-4 py-4 md:px-0">
                    <h1 className="tct-h1 text-foreground">
                        Spiritual Journeys
                    </h1>
                    <p className="mt-1 text-sm font-medium text-muted-foreground">
                        Pilih satu jalan, dan bertumbuhlah satu hari pada satu waktu.
                    </p>
                </div>
            }
        >
            <div className="mx-auto w-full max-w-[720px] px-4 pb-28 pt-2">
                {loading ? (
                    <div className="flex h-32 items-center justify-center text-muted-foreground">Memuat perjalanan...</div>
                ) : error || paths.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-20 text-center text-muted-foreground px-4">
                        <Compass className="h-10 w-10 mb-4 opacity-50" />
                        <p>Belum ada perjalanan spiritual yang tersedia saat ini.<br/>Silakan kembali lagi nanti.</p>
                    </div>
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
                                        <Card className="group relative overflow-hidden rounded-[32px] md:rounded-[40px] border-0 glass-card transition-all hover:shadow-card">
                                            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-50" />
                                            
                                            <CardContent className="relative tct-card-pad">
                                                <div className="mb-4 flex items-center justify-between">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted backdrop-blur-md ring-1 ring-border/50">
                                                        <Compass className="h-6 w-6 text-brand" />
                                                    </div>
                                                    <div className="flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-xs font-bold text-muted-foreground ring-1 ring-border/50">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {item.estimated_minutes || 0} Menit
                                                    </div>
                                                </div>

                                                <h3 className="mb-2 tct-h2 text-foreground group-hover:text-brand transition-colors">
                                                    {title}
                                                </h3>
                                                <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-muted-foreground font-medium">
                                                    {description}
                                                </p>

                                                <div className="flex items-center justify-between border-t border-border pt-4">
                                                    <div className="flex items-center gap-2">
                                                        {isActive ? (
                                                            <span className="text-xs font-bold uppercase tracking-widest text-brand">
                                                                Lanjut
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                                                                Mulai Perjalanan
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background transition-transform group-hover:scale-110">
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
