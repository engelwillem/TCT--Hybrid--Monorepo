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
            setCount(prev => prev - 1);
        } else {
            setCount(prev => prev + 1);
        }
        setSaidAmin(!saidAmin);
    };

    return (
        <Card className="overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl">
            <CardContent className="p-6 md:p-8">
                <div className="flex flex-col items-center text-center space-y-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                        <Sparkles className="h-7 w-7" />
                    </div>

                    <div className="space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">Doa Hari Ini</span>
                        <p className="text-xl md:text-2xl font-bold leading-relaxed text-white italic font-serif">
                            "{prayer}"
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <Button
                            onClick={toggleAmin}
                            className={cn(
                                "h-14 px-10 rounded-2xl font-bold shadow-2xl transition-all active:scale-[0.95] text-xs tracking-widest uppercase",
                                saidAmin
                                    ? "bg-sky-500 text-white hover:bg-sky-600 shadow-sky-500/20"
                                    : "bg-white text-slate-950 hover:bg-slate-200"
                            )}
                        >
                            <span className="mr-2">🙌</span>
                            {saidAmin ? 'Kami Mengamini' : 'Sebut AMIN'}
                        </Button>

                        <p className="text-[10px] font-bold text-amber-500/60 uppercase tracking-[0.2em]">
                            {count} Chosen People Mengamini
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
