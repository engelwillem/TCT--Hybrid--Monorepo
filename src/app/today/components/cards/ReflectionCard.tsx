'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { BookHeart, PenLine } from 'lucide-react';

export default function ReflectionCard({
    payload,
}: {
    payload: { prompt: string; prompt_id?: string | number | null };
}) {
    const href = payload.prompt_id
        ? `/journal/new?prompt_id=${encodeURIComponent(String(payload.prompt_id))}`
        : `/journal/new`;

    return (
        <Card className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-amber-50/60 to-white dark:from-amber-950/20 dark:to-slate-900/40 shadow-sm ring-1 ring-amber-100/60 dark:ring-amber-500/10 backdrop-blur-sm">
            {/* Accent blob */}
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-300/20 blur-2xl" />

            <CardContent className="relative p-5">
                <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
                        <BookHeart className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                        Jurnal Pribadi
                    </span>
                </div>

                <p className="text-base font-semibold leading-snug text-slate-800 dark:text-slate-100">
                    {payload.prompt}
                </p>

                <div className="mt-4">
                    <Button
                        asChild
                        variant="outline"
                        className="h-10 rounded-2xl border-amber-200 bg-amber-50/80 px-5 text-sm font-semibold text-amber-700 hover:bg-amber-100 hover:border-amber-300 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 transition-all active:scale-[0.98]"
                    >
                        <Link href={href} className="inline-flex items-center gap-1.5">
                            <PenLine className="h-3.5 w-3.5" />
                            Tulis Jurnal
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
