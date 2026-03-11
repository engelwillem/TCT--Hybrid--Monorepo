'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

type Props = {
    pinned: {
        quarter: {
            id: number;
            title: string;
            date_range_human?: string | null;
            cover_image_url?: string | null;
        };
        lesson: {
            id: number;
            title: string;
            excerpt?: string | null;
            estimated_minutes: number;
        };
        progress: {
            state: 'start' | 'continue' | 'completed';
        };
    };
};

export default function PinnedLessonCard({ pinned }: Props) {
    const lesson = pinned.lesson;
    const quarter = pinned.quarter;

    const ctaLabel =
        pinned.progress.state === 'continue'
            ? 'Continue'
            : pinned.progress.state === 'completed'
              ? 'Review'
              : 'Start';

    return (
        <Card className="overflow-hidden rounded-3xl bg-white/40 dark:bg-white/5 border-0 shadow-[0_8px_32px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03] dark:ring-white/[0.08] backdrop-blur-xl">
            <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="secondary" className="rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-0">
                        Pinned • Today’s Lesson
                    </Badge>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                        ~{lesson.estimated_minutes} min
                    </p>
                </div>

                <CardTitle className="mt-2 text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 font-serif">
                    {lesson.title}
                </CardTitle>

                {lesson.excerpt ? (
                    <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                        {lesson.excerpt}
                    </p>
                ) : null}
            </CardHeader>

            <CardContent className="pt-0">
                <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Button
                        className="rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-6 font-bold shadow-lg transition-all active:scale-[0.98]"
                    >
                        {ctaLabel}
                    </Button>

                    <Button asChild variant="outline" className="rounded-2xl border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-slate-600 dark:text-slate-300">
                        <Link href="/channels/sabbath-school">View Quarter</Link>
                    </Button>

                    <div className="ms-auto flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            {quarter.title}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
