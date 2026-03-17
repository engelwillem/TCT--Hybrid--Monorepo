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
        <Card className="overflow-hidden rounded-[32px] md:rounded-[40px] border-0 glass-card p-0">
            <CardContent className="tct-card-pad space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="secondary" className="chip border-0">
                        Pinned • Today’s Lesson
                    </Badge>
                    <p className="tct-meta font-medium">
                        ~{lesson.estimated_minutes} min
                    </p>
                </div>

                <div className="space-y-1.5">
                    <h3 className="tct-h2 text-foreground">
                        {lesson.title}
                    </h3>
                    {lesson.excerpt ? (
                        <p className="tct-body text-muted-foreground line-clamp-2">
                            {lesson.excerpt}
                        </p>
                    ) : null}
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button className="tct-pressable rounded-xl shadow-md bg-foreground text-background font-bold tracking-wide hover:opacity-90 active:scale-95">
                            {ctaLabel}
                        </Button>
                        <Button asChild variant="outline" className="tct-pressable rounded-xl font-bold tracking-wide active:scale-95">
                            <Link href="/paths">View Path</Link>
                        </Button>
                    </div>

                    <div className="flex items-center">
                        <span className="tct-meta font-medium text-slate-400">
                            {quarter.title}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
