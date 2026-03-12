'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { MessageCircle, Users } from 'lucide-react';

export default function CommunityCard({
    payload,
}: {
    payload: { title: string; count?: number | null; ctaText?: string | null };
}) {
    return (
        <Card className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl">
            {/* Accent blob */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-400/15 blur-2xl" />
            <div className="pointer-events-none absolute bottom-0 left-4 h-20 w-20 rounded-full bg-cyan-400/10 blur-2xl" />

            <CardContent className="relative p-5">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">
                        <Users className="h-3.5 w-3.5" />
                        Community Highlight
                    </span>
                    {/* Avatar cluster */}
                    <div className="flex -space-x-1.5">
                        {[
                            'bg-gradient-to-br from-rose-400 to-pink-500',
                            'bg-gradient-to-br from-amber-400 to-orange-500',
                            'bg-gradient-to-br from-cyan-400 to-blue-500',
                        ].map((g, i) => (
                            <div
                                key={i}
                                className={`h-6 w-6 rounded-full border-2 border-white dark:border-slate-900 ${g} flex items-center justify-center text-[8px] font-bold text-white shadow-sm`}
                            >
                                {String.fromCharCode(65 + i)}
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-xl font-bold leading-tight tracking-tight text-sky-400">
                    {payload.title}
                </p>

                {typeof payload.count === 'number' && (
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500/80" />
                        </span>
                        {payload.count} orang sedang berdiskusi
                    </div>
                )}

                <div className="mt-4">
                    <Button
                        asChild
                        className="w-full h-11 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-md shadow-emerald-500/20 hover:opacity-90 transition-opacity active:scale-[0.98]"
                    >
                        <Link href="/community" className="inline-flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            {payload.ctaText ?? 'Open discussion'}
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
