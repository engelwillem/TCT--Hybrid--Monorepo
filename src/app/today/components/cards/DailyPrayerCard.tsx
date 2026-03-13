'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function DailyPrayerCard({
    payload,
}: {
    payload?: { prayer?: string; text?: string; aminCount?: number; response_count?: number };
}) {
    const [saidAmin, setSaidAmin] = useState(false);
    const prayer = payload?.prayer ?? payload?.text ?? "Tuhan, sertai langkah kami hari ini.";
    const [count, setCount] = useState(payload?.aminCount ?? payload?.response_count ?? 28);

    const toggleAmin = () => {
        if (saidAmin) {
            setCount((prev) => prev - 1);
        } else {
            setCount((prev) => prev + 1);
        }
        setSaidAmin(!saidAmin);
    };

    return (
        <Card className="overflow-hidden rounded-[32px] border-0 bg-sky-50/50 shadow-soft ring-1 ring-sky-200/50 backdrop-blur-sm dark:bg-sky-950/20 dark:ring-sky-500/10">
            <CardContent className="p-6 md:p-8">
                <div className="flex flex-col items-center space-y-5 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400">
                        <Sparkles className="h-6 w-6" />
                    </div>

                    <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">Doa Hari Ini</span>
                        <p className="text-lg font-medium italic leading-relaxed text-slate-800 md:text-xl dark:text-slate-100">
                            "{prayer}"
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <Button
                            onClick={toggleAmin}
                            className={cn(
                                'h-12 rounded-2xl px-8 font-bold shadow-lg transition-all active:scale-[0.98]',
                                saidAmin
                                    ? 'bg-sky-500 text-white shadow-sky-500/20 hover:bg-sky-600'
                                    : 'bg-white text-sky-600 ring-1 ring-sky-100 hover:bg-sky-50 dark:bg-slate-900 dark:text-sky-400 dark:ring-sky-800'
                            )}
                        >
                            <span className="mr-2">🙌</span>
                            {saidAmin ? 'Kami Mengamini' : 'Sebut AMIN'}
                        </Button>

                        <p className="text-[11px] font-bold uppercase tracking-widest text-sky-400">
                            {count} Chosen People Mengamini
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
