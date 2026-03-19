'use client';

import React, { useState, useEffect } from 'react';
import MobileAppLayout from '@/layouts/MobileAppLayout';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass, Clock, PlayCircle, Sparkles, ArrowRight, RefreshCcw, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getStudyPaths } from '@/services/journeys.service';
import { cn } from '@/lib/utils';

type StudyPath = {
    id: number | string;
    slug: string;
    title_id?: string;
    title_en?: string;
    description_id?: string;
    description_en?: string;
    estimated_minutes?: number;
    steps_count?: number;
};

export default function PathsPage() {
    const [paths, setPaths] = useState<StudyPath[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const hasPaths = paths.length > 0;

    useEffect(() => {
        getStudyPaths()
            .then((data) => {
                if (Array.isArray(data?.paths)) setPaths(data.paths);
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
                <div className="px-4 py-4 md:px-0 space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-brand ring-1 ring-brand/20">
                        <Sparkles className="h-3.5 w-3.5" />
                        Paths Experience
                    </div>
                    <h1 className="tct-h1 text-foreground tracking-tight">
                        Langkah Kecil, Pertumbuhan Besar.
                    </h1>
                    <p className="mt-1 text-sm font-medium text-muted-foreground">
                        Rangkaian perjalanan spiritual terarah yang dirancang untuk membantu Anda bertumbuh secara sistematis setiap hari.
                    </p>
                </div>
            }
        >
            <div className="mx-auto w-full max-w-[720px] px-4 pb-28 pt-2">
                {!loading && (
                    <Card className="mb-6 rounded-[28px] border border-border/50 bg-background/70 shadow-none">
                        <CardContent className="px-5 py-4 flex items-start gap-3">
                            <div className={cn(
                                "mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full",
                                hasPaths ? "bg-emerald-400" : "bg-amber-400"
                            )} />
                            <div className="space-y-1.5">
                                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-foreground/90">
                                    {hasPaths ? "Journey Siap Dipilih" : "Ruang Sedang Disiapkan"}
                                </p>
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    {hasPaths
                                        ? "Pilih satu jalur dan lanjutkan ritme pertumbuhan rohani Anda."
                                        : "Belum ada jalur aktif saat ini. Anda tetap bisa menjaga ritme lewat refleksi harian dan komunitas."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="mb-6 rounded-[28px] border border-border/50 bg-gradient-to-br from-background via-background to-brand/5 p-5"
                    >
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-foreground/90">
                            Mengapa Paths?
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            Paths bukan sekadar membaca ayat acak. Setiap jalur dirancang sebagai kurikulum rohani bertahap agar refleksi, disiplin, dan pertumbuhan iman berjalan lebih terarah.
                        </p>
                    </motion.div>
                )}

                {loading ? (
                    <div className="grid gap-5 md:grid-cols-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="rounded-[32px] md:rounded-[40px] bg-surface-muted/30 p-6 space-y-5 animate-pulse">
                                <div className="flex items-center justify-between">
                                    <div className="h-12 w-12 rounded-2xl bg-surface-muted" />
                                    <div className="h-6 w-20 rounded-full bg-surface-muted" />
                                </div>
                                <div className="space-y-3">
                                    <div className="h-5 w-3/4 rounded-full bg-surface-muted" />
                                    <div className="h-4 w-full rounded-full bg-surface-muted" />
                                    <div className="h-4 w-4/5 rounded-full bg-surface-muted" />
                                </div>
                                <div className="h-px bg-border/50" />
                                <div className="h-4 w-36 rounded-full bg-surface-muted" />
                            </div>
                        ))}
                    </div>
                ) : error || paths.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                    <Card className="rounded-[32px] md:rounded-[40px] border-0 glass-card overflow-hidden">
                        <CardContent className="p-8 md:p-10">
                            <div className="relative mb-8 rounded-[24px] bg-gradient-to-br from-brand/10 via-transparent to-emerald-300/10 p-6 ring-1 ring-border/50">
                                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-brand/10 blur-3xl" />
                                <div className="relative flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-background/80 ring-1 ring-border/50 flex items-center justify-center">
                                        <Compass className="h-6 w-6 text-brand" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-lg font-black tracking-tight text-foreground">Kami Sedang Merangkai Langkah Anda</p>
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            Tim mentor kami tengah mempersiapkan rangkaian perjalanan baru yang mendalam. Nantikan segera.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8 rounded-[24px] border border-border/50 bg-background/60 p-5">
                                <p className="font-serif text-lg leading-relaxed text-foreground/90">
                                    Hening sejenak. Sesuatu yang indah sedang dipersiapkan untuk menemani pertumbuhan iman Anda.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3 mb-8">
                                {[
                                    "Ritme harian yang tenang",
                                    "Refleksi terarah",
                                    "Aksi kecil yang konsisten",
                                ].map((label) => (
                                    <div key={label} className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-xs font-semibold text-muted-foreground">
                                        {label}
                                    </div>
                                ))}
                            </div>

                            <div className="mb-8 rounded-[24px] border border-dashed border-border/60 bg-background/60 p-5">
                                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">Coming Soon Preview</p>
                                <p className="mt-2 text-sm text-foreground font-semibold">Perjalanan: Memelihara Damai di Tengah Tekanan</p>
                                <p className="mt-1 text-xs text-muted-foreground">7 langkah refleksi praktis untuk menjaga hati tetap teduh dan fokus.</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    href="/versehub/id"
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-background transition-all hover:scale-[1.01]"
                                >
                                    Jelajahi VerseHub Dulu
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="/community"
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border/70 bg-background px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-surface-muted"
                                >
                                    <BookOpen className="h-4 w-4" />
                                    Cari Inspirasi di Komunitas
                                </Link>
                                <a
                                    href="mailto:engel.willem@gmail.com?subject=Notifikasi%20Paths%20Baru&body=Saya%20ingin%20diberitahu%20saat%20jalan%20spiritual%20baru%20tersedia."
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border/70 bg-transparent px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground hover:bg-surface-muted/60"
                                >
                                    <RefreshCcw className="h-4 w-4" />
                                    Beritahu Saya
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                    </motion.div>
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
                                                {typeof item.steps_count === 'number' && (
                                                    <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70">
                                                        {item.steps_count} langkah perjalanan
                                                    </p>
                                                )}

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
