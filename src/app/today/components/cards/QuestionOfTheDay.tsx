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
        // Mocking submission for now
        console.log('Submitting answer:', answer);
        setTimeout(() => {
            setAnswer('');
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <Card className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl">
            <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                        <HelpCircle className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">Pertanyaan Hari Ini</span>
                </div>

                <div className="space-y-6">
                    <h3 className="text-2xl font-bold leading-tight tracking-tight text-white mb-4">
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
                            className="w-full h-12 rounded-2xl bg-white dark:bg-slate-900/50 px-4 pr-12 text-sm ring-1 ring-black/5 dark:ring-white/10 focus:ring-emerald-500/50 transition-all outline-none"
                        />
                        <button
                            onClick={handleSubmit}
                            className="absolute right-2 top-1.5 h-9 w-9 flex items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50"
                            disabled={!answer.trim() || isSubmitting}
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500/50 uppercase tracking-[0.15em]">
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>{count} orang sudah menjawab</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
