import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { Link } from '@inertiajs/react';

type Quarter = {
    id: number;
    year: number;
    quarter: number;
    title?: string | null;
    start_date: string;
    end_date: string;
};

type Lesson = {
    id: number;
    quarter_id: number;
    lesson_number: number;
    title?: string | null;
    start_date: string;
    end_date: string;
};

export default function LessonIndex({
    quarter,
    lessons,
}: {
    quarter: Quarter;
    lessons: Lesson[];
}) {
    return (
        <MobileAppLayout
            title={quarter.title ?? `Q${quarter.quarter} ${quarter.year}`}
            activeNavId="channels"
            backHref="/channels/sabbath-school"
        >
            <div className="space-y-3">
                {lessons.map((lesson) => (
                    <Link
                        key={lesson.id}
                        href={`/channels/sabbath-school/${quarter.year}/q${quarter.quarter}/lesson/${lesson.lesson_number}`}
                        prefetch="hover"
                        cacheFor="1m"
                        className="block rounded-3xl bg-surface p-4 shadow-soft"
                    >
                        <p className="text-sm font-semibold">
                            Lesson {lesson.lesson_number}{' '}
                            {lesson.title ? `— ${lesson.title}` : ''}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {lesson.start_date} → {lesson.end_date}
                        </p>
                    </Link>
                ))}
            </div>
        </MobileAppLayout>
    );
}
