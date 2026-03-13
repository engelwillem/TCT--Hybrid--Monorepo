'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { MessageSquarePlus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReflectionPrompt({ payload }: { payload?: { question: string; response_count?: number } }) {
    const question = payload?.question ?? "Apa hal kecil hari ini yang membuatmu bersyukur?";
    const responseCount = payload?.response_count ?? 42;

    const handleChipClick = () => window.location.assign('/community');

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Card className="overflow-hidden rounded-[32px] border-0 bg-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03] backdrop-blur-xl dark:bg-white/5 dark:ring-white/[0.08]">
                <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col items-center space-y-5 text-center">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                            <Sparkles className="h-6 w-6" />
                        </div>

                        <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Renungan Hari Ini</span>
                            <p className="text-xl font-bold leading-relaxed text-slate-800 md:text-2xl md:tracking-tight dark:text-slate-100">
                                {question}
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <div className="flex flex-wrap justify-center gap-2">
                                {['Amin', 'Setuju', 'Terberkati', 'Inspiratif'].map((chip) => (
                                    <button
                                        key={chip}
                                        onClick={handleChipClick}
                                        className="rounded-full bg-indigo-100/50 px-4 py-2 text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-800"
                                    >
                                        {chip}
                                    </button>
                                ))}
                            </div>

                            <Button
                                asChild
                                className="group h-12 rounded-2xl bg-slate-900 px-8 font-bold text-white shadow-lg transition-all active:scale-[0.98] hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                            >
                                <Link href="/community">
                                    <MessageSquarePlus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
                                    Tulis Refleksi
                                </Link>
                            </Button>

                            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-500">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                                </span>
                                {responseCount} Chosen People sedang merenung
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
