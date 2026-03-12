'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquarePlus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReflectionPrompt({ payload }: { payload?: { question: string; response_count?: number } }) {
    const router = useRouter();
    const question = payload?.question ?? "Apa hal kecil hari ini yang membuatmu bersyukur?";
    const responseCount = payload?.response_count ?? 42;

    const handleChipClick = (chip: string) => {
        // Mocking community post for now. In reality, this would hit an API.
        console.log('Posting reflection:', chip);
        router.push('/community');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Card className="overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl">
                <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                            <Sparkles className="h-6 w-6" />
                        </div>

                        <div className="space-y-3">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 shadow-sm">Renungan Hari Ini</span>
                            <p className="text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight">
                                {question}
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <div className="flex flex-wrap justify-center gap-3 mb-4">
                                {['Amin', 'Setuju', 'Terberkati', 'Inspiratif'].map((chip) => (
                                    <button
                                        key={chip}
                                        onClick={() => handleChipClick(chip)}
                                        className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-[11px] font-bold hover:bg-white/10 hover:text-white transition-all active:scale-95"
                                    >
                                        {chip}
                                    </button>
                                ))}
                            </div>

                            <Button
                                asChild
                                className="group h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-8 font-bold shadow-lg transition-all active:scale-[0.98]"
                            >
                                <Link href="/community">
                                    <MessageSquarePlus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
                                    Tulis Refleksi
                                </Link>
                            </Button>

                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-500 uppercase tracking-widest">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
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
