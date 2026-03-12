import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Link, router } from '@inertiajs/react';
import { MessageSquarePlus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReflectionPrompt({ payload }: { payload?: { question: string; response_count?: number } }) {
    const question = payload?.question ?? "Apa hal kecil hari ini yang membuatmu bersyukur?";
    const responseCount = payload?.response_count ?? 42;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Card className="overflow-hidden rounded-[32px] border-0 bg-white/40 dark:bg-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03] dark:ring-white/[0.08] backdrop-blur-xl">
                <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col items-center text-center space-y-5">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                            <Sparkles className="h-6 w-6" />
                        </div>

                        <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Renungan Hari Ini</span>
                            <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-relaxed md:tracking-tight">
                                {question}
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <div className="flex flex-wrap justify-center gap-2 mb-2">
                                {['Amin', 'Setuju', 'Terberkati', 'Inspiratif'].map((chip) => (
                                    <button
                                        key={chip}
                                        onClick={() => {
                                            router.post(route('community.posts.store'), {
                                                type: 'reflection',
                                                text: `Saya merasa ${chip.toLowerCase()} dengan renungan ini: "${question}"`,
                                                metadata: { source: 'reflection_prompt_chip', chip }
                                            }, { preserveScroll: true });
                                        }}
                                        className="px-4 py-2 rounded-full bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
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
