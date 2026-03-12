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
        <Card className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl">
            {/* Accent blob */}
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-300/20 blur-2xl" />

            <CardContent className="relative p-5">
                <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                        <BookHeart className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">
                        Jurnal Pribadi
                    </span>
                </div>

                <p className="text-xl font-bold leading-tight tracking-tight text-white mb-4">
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
