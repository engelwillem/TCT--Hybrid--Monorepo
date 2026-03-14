'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { MessageSquarePlus, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { CommunityService } from '@/services/community.service';

export default function ReflectionPrompt({ payload }: { payload?: { question: string; response_count?: number } }) {
    const question = payload?.question ?? "Apa hal kecil hari ini yang membuatmu bersyukur?";
    const responseCount = payload?.response_count ?? 42;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChipClick = async (chip: string) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await CommunityService.createPost(
                `Saya merasa ${chip.toLowerCase()} dengan renungan ini: "${question}"`,
                'reflection'
            );
            alert('Refleksi singkat Anda telah dibagikan!');
        } catch (error) {
            console.error('Failed to post reflection:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Card className="overflow-hidden rounded-[32px] border-0 bg-surface/80 shadow-soft ring-1 ring-border/60 backdrop-blur-xl">
                <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col items-center space-y-5 text-center">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand ring-1 ring-brand/20">
                            <Sparkles className="h-6 w-6" />
                        </div>

                        <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">Renungan Hari Ini</span>
                            <p className="text-xl font-bold leading-relaxed text-foreground md:text-2xl md:tracking-tight">
                                {question}
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <div className="flex flex-wrap justify-center gap-2">
                                {['Amin', 'Setuju', 'Terberkati', 'Inspiratif'].map((chip) => (
                                    <button
                                        key={chip}
                                        disabled={isSubmitting}
                                        onClick={() => handleChipClick(chip)}
                                        className="rounded-full bg-surface-muted px-4 py-2 text-xs font-bold text-foreground transition-colors hover:bg-surface-elevated disabled:opacity-50"
                                    >
                                        {chip}
                                    </button>
                                ))}
                            </div>

                            <Button
                                asChild
                                className="group h-12 rounded-2xl bg-brand px-8 font-bold text-brand-foreground shadow-lg transition-all active:scale-[0.98] hover:opacity-90"
                            >
                                <Link href="/community">
                                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <MessageSquarePlus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />}
                                    Tulis Refleksi
                                </Link>
                            </Button>

                            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/70 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
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
