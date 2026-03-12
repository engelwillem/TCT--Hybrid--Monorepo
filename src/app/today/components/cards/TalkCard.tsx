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
        <Card className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl">
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
                            <span className="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-amber-500">
                                <Radio className="h-3.5 w-3.5" />
                                Talk
                            </span>

                            <p className="line-clamp-2 text-base font-bold leading-tight tracking-tight text-white mb-2">
                                {payload.title}
                            </p>

                            {durationStr && (
                                <span className="mt-2 inline-flex items-center rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-bold tracking-widest text-sky-400 uppercase">
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
