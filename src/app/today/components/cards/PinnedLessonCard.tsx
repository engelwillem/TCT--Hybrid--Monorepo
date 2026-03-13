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
        <Card className="overflow-hidden rounded-3xl bg-surface shadow-soft">
            <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="secondary" className="chip border-0">
                        Pinned • Today’s Lesson
                    </Badge>
                    <p className="tct-meta">
                        ~{lesson.estimated_minutes} min
                    </p>
                </div>

                <CardTitle className="mt-2 tct-h2">
                    {lesson.title}
                </CardTitle>

                {lesson.excerpt ? (
                    <p className="mt-2 tct-meta">
                        {lesson.excerpt}
                    </p>
                ) : null}
            </CardHeader>

            <CardContent className="pt-0">
                <div className="mt-1 flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Button
                            className="tct-pressable"
                        >
                            {ctaLabel}
                        </Button>

                        <Button asChild variant="outline" className="tct-pressable">
                            <Link href="/channels/sabbath-school">View Quarter</Link>
                        </Button>
                    </div>

                    <div className="ms-auto flex items-center gap-2">
                        <span className="tct-meta">
                            {quarter.title}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
