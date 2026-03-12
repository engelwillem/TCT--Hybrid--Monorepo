import { Head } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { motion } from 'framer-motion';
import { MessageSquareQuote, Lock, Globe, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types';

type Reflection = {
    id: number;
    verse_ref: string;
    question_text: string;
    answer_text: string;
    is_private: boolean;
    created_at: string;
};

type MySpiritualJourneyProps = PageProps<{
    lang: string;
    reflections: {
        data: Reflection[];
        links: any[];
    };
}>;

export default function MySpiritualJourney({ auth, lang, reflections }: MySpiritualJourneyProps) {
    const isId = lang === 'id';
    const reflectionList = reflections.data;

    return (
        <MobileAppLayout
            title={isId ? 'Perjalanan Rohani' : 'Spiritual Journey'}
            activeNavId="bible"
            backHref="/versehub/id"
        >
            <Head title={isId ? 'Jurnal Refleksi' : 'Reflection Journal'} />

            <div className="mx-auto max-w-2xl px-4 py-8 pb-32">
                <header className="mb-10 text-center">
                    <h1 className="mb-2 text-3xl font-bold text-slate-900">
                        {isId ? 'Jurnal Refleksi' : 'Reflection Journal'}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {isId
                            ? 'Kumpulan percakapanmu dengan Firman Tuhan.'
                            : 'A collection of your conversations with God’s Word.'}
                    </p>
                </header>

                {reflectionList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-[32px] bg-slate-50 py-16 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-300">
                            <MessageSquareQuote className="h-8 w-8" />
                        </div>
                        <p className="max-w-[200px] text-sm font-medium text-slate-400">
                            {isId
                                ? 'Refleksimu belum ada. Mari mulai membaca Alkitab.'
                                : 'No reflections yet. Let’s start reading the Bible.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {reflectionList.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative overflow-hidden rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                            <MessageSquareQuote className="h-4 w-4" />
                                        </span>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                            {item.verse_ref.toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-400">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(item.created_at).toLocaleDateString(isId ? 'id-ID' : 'en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>

                                <div className="mb-4 space-y-3">
                                    <p className="font-serif text-lg italic leading-relaxed text-slate-700">
                                        "{item.question_text}"
                                    </p>
                                    <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                                        {item.answer_text}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                                        {item.is_private ? (
                                            <>
                                                <Lock className="h-3 w-3" />
                                                {isId ? 'Privat' : 'Private'}
                                            </>
                                        ) : (
                                            <>
                                                <Globe className="h-3 w-3" />
                                                {isId ? 'Publik' : 'Public'}
                                            </>
                                        )}
                                    </div>
                                    <a
                                        href={`/versehub/${lang}/${item.verse_ref.split('-').slice(0, 2).join('-')}`}
                                        className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:underline"
                                    >
                                        {isId ? 'Baca Pasal' : 'Read Chapter'}
                                        <ChevronRight className="h-3 w-3" />
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </MobileAppLayout>
    );
}
