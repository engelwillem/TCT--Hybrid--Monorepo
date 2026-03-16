'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Share2, Quote, Flame, Edit3, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import HookCard from '@/components/cards/HookCard';

interface ReflectionDetail {
    title: string;
    relevance_intro: string;
    verse_quote: string;
    verse_ref: string;
    verse_reference_label: string;
    body_content: React.ReactNode;
    practical_application: string;
    discussion_prompt: string;
}

// Dummy data for the template
const DUMMY_REFLECTION: ReflectionDetail = {
    title: 'Menemukan Kedamaian di Tengah Ketidakpastian',
    relevance_intro: 'Kita sering merasa memegang kendali atas hidup, sampai sebuah kejadian tak terduga mengingatkan betapa rapuhnya rencana kita. Kecemasan adalah respons alami saat kita tidak tahu apa yang akan terjadi besok.',
    verse_quote: 'Janganlah hendaknya kamu kuatir tentang apapun juga, tetapi nyatakanlah dalam segala hal keinginanmu kepada Allah dalam doa dan permohonan dengan ucapan syukur.',
    verse_ref: 'flp-4-6',
    verse_reference_label: 'Filipi 4:6',
    body_content: (
        <>
            <p>
                Kecemasan sering kali lahir bukan dari kenyataan hari ini, melainkan dari ilusi tentang masa depan. Paulus menuliskan surat Filipi bukan dari vila mewah, melainkan dari penjara Roma. Ia sangat mengerti apa artinya tidak memiliki kepastian hari esok.
            </p>
            <p>
                Namun, perhatikan pendekatannya: ia tidak menyuruh kita menekan rasa cemas, melainkan mengalihkannya. Mengubah kekhawatiran yang berpusat pada diri sendiri menjadi doa yang berpusat pada Allah.
            </p>
        </>
    ),
    practical_application: 'Hari ini, setiap kali Anda mulai mereka-reka skenario terburuk di pikiran Anda, berhentilah sejenak. Tarik napas, dan ubah skenario itu menjadi satu kalimat doa yang sederhana.',
    discussion_prompt: 'Apa satu hal spesifik yang paling membuatmu khawatir minggu ini? Maukah kamu menyerahkannya dalam doa hari ini?',
};

export default function ReflectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();
    const [data, setData] = useState<ReflectionDetail | null>(null);

    useEffect(() => {
        // Mock data fetch
        setData(DUMMY_REFLECTION);
    }, [slug]);

    if (!data) {
        return <div className="min-h-screen bg-slate-950/40 animate-pulse" />;
    }

    return (
        <div className="min-h-screen bg-slate-950 pb-20 text-white selection:bg-brand/30">
            {/* Minimalist Reader Navigation */}
            <nav className="sticky top-0 z-40 bg-slate-950/80 p-4 backdrop-blur-xl border-b border-white/5">
                <div className="mx-auto flex max-w-2xl items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-muted-foreground transition-all hover:bg-white/10 hover:text-white active:scale-95"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/70">
                        Refleksi Harian
                    </span>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-muted-foreground transition-all hover:bg-white/10 hover:text-white active:scale-95">
                        <Share2 className="h-4.5 w-4.5" />
                    </button>
                </div>
            </nav>

            <motion.article 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto mt-6 max-w-2xl px-5 md:px-8"
            >
                {/* 1. Relevance Intro (Problem statement that hooks the user) */}
                <span className="mb-4 inline-block rounded-full bg-rose-500/10 px-3 py-1 font-serif text-sm font-medium italic text-rose-400 ring-1 ring-rose-500/20">
                    Kecemasan & Masa Depan
                </span>
                <h1 className="mb-6 font-serif text-3xl font-normal leading-[1.2] tracking-tight md:text-5xl">
                    {data.title}
                </h1>
                
                <p className="mb-10 text-lg font-medium leading-relaxed text-slate-300/90 md:text-xl">
                    {data.relevance_intro}
                </p>

                {/* 2. Anchor Verse (The Truth) */}
                <div className="relative mb-12 overflow-hidden rounded-[32px] bg-surface-muted/30 p-8 ring-1 ring-border/50 backdrop-blur-sm">
                    <Quote className="absolute right-6 top-6 h-16 w-16 text-slate-800/10" />
                    <p className="relative z-10 font-serif text-2xl italic leading-relaxed text-white md:text-3xl">
                        "{data.verse_quote}"
                    </p>
                    <div className="mt-6 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-brand">
                            {data.verse_reference_label}
                        </span>
                    </div>
                </div>

                {/* 3. Reflection Body (The Guidance) */}
                <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                    {data.body_content}
                </div>

                {/* 4. Practical Application (The Challenge) */}
                <div className="mt-12 rounded-[24px] border-l-4 border-amber-500/50 bg-amber-500/5 p-6 md:p-8">
                    <div className="mb-3 flex items-center gap-2 text-amber-500">
                        <Flame className="h-5 w-5" />
                        <h3 className="font-bold uppercase tracking-wider text-sm">Aplikasi Praktis</h3>
                    </div>
                    <p className="text-base font-medium leading-relaxed text-slate-200">
                        {data.practical_application}
                    </p>
                </div>

                {/* Divider */}
                <div className="my-12 py-6 border-t border-white/5 flex justify-center">
                    <div className="h-1 w-1 bg-white/20 rounded-full mx-1"></div>
                    <div className="h-1 w-1 bg-white/20 rounded-full mx-1"></div>
                    <div className="h-1 w-1 bg-white/20 rounded-full mx-1"></div>
                </div>

                {/* 5. Journaling/Discussion Prompt & CTA */}
                <div className="mb-20 space-y-6">
                    <h2 className="font-serif text-2xl mb-4">Ruang Respons</h2>
                    <HookCard
                        variant="highlight"
                        hookText={data.discussion_prompt}
                        verseReference={data.verse_reference_label}
                        relevanceText="Tuliskan pengalamanmu, atau doakan bersama di The Chosen."
                        primaryAction={{
                            type: 'discuss',
                            href: `/community?intent=verse_reflection&ref=${data.verse_ref}`,
                            label: 'Tulis Jurnal & Doa'
                        }}
                    />
                    
                    {/* Private Journal Fallback Action */}
                    <button className="w-full flex items-center justify-between rounded-[24px] bg-white/[0.03] p-5 ring-1 ring-white/10 hover:bg-white/[0.05] transition-colors focus:outline-none">
                        <div className="flex items-center gap-3 text-slate-400">
                            <Edit3 className="h-5 w-5" />
                            <span className="text-sm font-medium">Buat Jurnal Pribadi (Hanya Anda yang melihat)</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-500" />
                    </button>
                </div>
            </motion.article>
        </div>
    );
}
