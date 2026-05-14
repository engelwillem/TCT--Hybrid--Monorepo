import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';

export default function LessonShow({
    lesson,
}: {
    lesson: {
        id: number;
        title: string;
        day_number: number;
        estimated_minutes: number;
    };
}) {
    return (
        <MobileAppLayout
            title={lesson.title}
            activeNavId="home"
            backHref="/today"
        >
            <div className="mx-auto w-full max-w-[720px]">
                <Card className="rounded-3xl bg-surface shadow-soft">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg tracking-tight">
                            {lesson.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">
                            Placeholder lesson page. Day #{lesson.day_number} • ~{lesson.estimated_minutes} min
                        </p>
                        <div className="mt-4">
                            <Button asChild variant="secondary" className="tct-pressable">
                                <Link href="/today">Back to Today</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MobileAppLayout>
    );
}
