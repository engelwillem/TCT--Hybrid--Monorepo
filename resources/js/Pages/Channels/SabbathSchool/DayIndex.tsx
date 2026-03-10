import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { Link } from '@inertiajs/react';

type Quarter = {
    year: number;
    quarter: number;
    title?: string | null;
};

type Lesson = {
    lesson_number: number;
    title?: string | null;
};

type Day = {
    id: number;
    day_key: string;
    date: string;
    title?: string | null;
    status: 'draft' | 'published' | string;
};

const dayLabel: Record<string, string> = {
    sat: 'Saturday',
    sun: 'Sunday',
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
};

export default function DayIndex({
    quarter,
    lesson,
    days,
}: {
    quarter: Quarter;
    lesson: Lesson;
    days: Day[];
}) {
    return (
        <MobileAppLayout
            title={`Lesson ${lesson.lesson_number}`}
            activeNavId="channels"
            backHref={`/channels/sabbath-school`}
        >
            <div className="space-y-3">
                {days.map((day) => (
                    <Link
                        key={day.id}
                        href={`/channels/sabbath-school/${quarter.year}/q${quarter.quarter}/lesson/${lesson.lesson_number}/${day.day_key}`}
                        className="block rounded-3xl bg-surface p-4 shadow-soft"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold">
                                    {dayLabel[day.day_key] ?? day.day_key}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {day.date}
                                </p>
                            </div>

                            <span className="rounded-full bg-surface-muted px-3 py-1 text-xs text-muted-foreground">
                                {day.status}
                            </span>
                        </div>

                        {day.title ? (
                            <p className="mt-2 text-xs text-muted-foreground">
                                {day.title}
                            </p>
                        ) : null}
                    </Link>
                ))}
            </div>
        </MobileAppLayout>
    );
}
