'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Send, HelpCircle } from 'lucide-react';
import { useState } from 'react';

export default function QuestionOfTheDay({
    payload,
}: {
    payload?: { question: string; participationCount?: number; response_count?: number };
}) {
    const [answer, setAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const question = payload?.question ?? "Apa satu renungan hari ini?";
    const count = payload?.participationCount ?? payload?.response_count ?? 12;

    const handleSubmit = () => {
        if (!answer.trim() || isSubmitting) return;

        setIsSubmitting(true);
        setTimeout(() => {
            setAnswer('');
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <Card className="overflow-hidden rounded-[32px] border-0 bg-emerald-50/50 shadow-soft ring-1 ring-emerald-200/50 backdrop-blur-sm dark:bg-emerald-950/20 dark:ring-emerald-500/10">
            <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                        <HelpCircle className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Pertanyaan Hari Ini</span>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold leading-tight text-slate-800 md:text-xl dark:text-slate-100">
                        {question}
                    </h3>

                    <div className="relative">
                        <input
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder="Tulis jawaban singkat Anda..."
                            disabled={isSubmitting}
                            className="h-12 w-full rounded-2xl bg-white px-4 pr-12 text-sm ring-1 ring-black/5 transition-all outline-none focus:ring-emerald-500/50 dark:bg-slate-900/50 dark:ring-white/10"
                        />
                        <button
                            onClick={handleSubmit}
                            className="absolute right-2 top-1.5 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20 transition-all active:scale-95 hover:bg-emerald-600 disabled:opacity-50"
                            disabled={!answer.trim() || isSubmitting}
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-600/70 dark:text-emerald-400/70">
                        <MessageCircle className="h-3 w-3" />
                        <span>{count} orang sudah menjawab</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
