'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Play, Radio } from 'lucide-react';

export default function TalkCard({
    payload,
}: {
    payload: {
        title: string;
        duration?: string | number | null;
        thumbnailUrl?: string | null;
        ctaUrl: string;
    };
}) {
    const durationStr = payload.duration ? String(payload.duration) : null;

    return (
        <Card className="overflow-hidden rounded-3xl border-0 bg-white/60 dark:bg-slate-900/40 shadow-sm ring-1 ring-black/5 dark:ring-white/8 backdrop-blur-sm">
            <CardContent className="p-0">
                <a
                    href={payload.ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                >
                    <div className="flex items-center gap-4 p-5">
                        {/* Thumbnail / placeholder */}
                        <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-2xl">
                            {payload.thumbnailUrl ? (
                                <img
                                    src={payload.thumbnailUrl}
                                    alt={payload.title}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                    <Radio className="h-7 w-7 text-slate-400" />
                                </div>
                            )}
                            {/* Play overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100 rounded-2xl">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-lg">
                                    <Play className="h-4 w-4 fill-slate-900 text-slate-900 translate-x-0.5" />
                                </div>
                            </div>
                        </div>

                        <div className="min-w-0 flex-1">
                            {/* Kicker */}
                            <span className="mb-1.5 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                                <Radio className="h-3 w-3" />
                                Talk
                            </span>

                            <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800 dark:text-slate-100">
                                {payload.title}
                            </p>

                            {durationStr && (
                                <span className="mt-2 inline-flex items-center rounded-full bg-slate-100 dark:bg-white/8 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                    {durationStr}
                                </span>
                            )}
                        </div>
                    </div>
                </a>
            </CardContent>
        </Card>
    );
}
