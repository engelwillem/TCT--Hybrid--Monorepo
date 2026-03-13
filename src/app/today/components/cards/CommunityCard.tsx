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
        <Card className="relative overflow-hidden rounded-3xl border-0 bg-white/60 shadow-sm ring-1 ring-black/5 backdrop-blur-sm dark:bg-slate-900/40 dark:ring-white/8">
            {/* Accent blob */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-400/15 blur-2xl" />
            <div className="pointer-events-none absolute bottom-0 left-4 h-20 w-20 rounded-full bg-cyan-400/10 blur-2xl" />

            <CardContent className="relative p-5">
                {/* Header */}
                <div className="mb-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                        <Users className="h-3 w-3" />
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
                                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[8px] font-bold text-white shadow-sm dark:border-slate-900 ${g}`}
                            >
                                {String.fromCharCode(65 + i)}
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-base font-bold leading-snug text-slate-800 dark:text-slate-100">
                    {payload.title}
                </p>

                {typeof payload.count === 'number' && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        {payload.count} orang sedang berdiskusi
                    </div>
                )}

                <div className="mt-4">
                    <Button
                        asChild
                        className="h-11 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 font-semibold text-white shadow-md shadow-emerald-500/20 transition-opacity active:scale-[0.98] hover:opacity-90"
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
