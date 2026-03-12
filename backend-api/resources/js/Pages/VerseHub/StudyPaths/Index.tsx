import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudyPath {
    id: number;
    slug: string;
    title_id: string;
    title_en: string;
    description_id: string;
    description_en: string;
    cover_color: string;
    difficulty: string;
    estimated_minutes: number;
}

interface IndexProps {
    lang: string;
    paths: StudyPath[];
}

export default function Index({ lang, paths }: IndexProps) {
    const isId = lang === 'id';

    return (
        <MobileAppLayout
            title={isId ? 'Jalur Belajar' : 'Study Paths'}
            activeNavId="library"
        >
            <Head title={isId ? 'Jalur Belajar Alkitab' : 'Bible Study Paths'} />

            <div className="relative mx-auto max-w-4xl px-4 py-8">
                {/* Header */}
                <header className="mb-10 text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                        <Sparkles className="h-3.5 w-3.5" />
                        {isId ? 'Scripture Guide' : 'Scripture Guide'}
                    </div>
                    <h1 className="tct-brand-gradient text-4xl font-bold tracking-tight">
                        {isId ? 'Jalur Belajar' : 'Study Paths'}
                    </h1>
                    <p className="mt-3 text-sm text-slate-500">
                        {isId
                            ? 'Ikuti kurikulum ayat-ayat Alkitab yang dikurasi untuk pertumbuhanmu.'
                            : 'Follow curated Bible verse paths designed for your growth.'}
                    </p>
                </header>

                {/* Paths Grid */}
                <div className="grid gap-6 sm:grid-cols-2">
                    {paths.map((path) => (
                        <Link
                            key={path.id}
                            href={`/versehub/${lang}/study/${path.slug}`}
                            className="group relative flex flex-col overflow-hidden rounded-[32px] bg-white p-6 shadow-soft ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-xl hover:ring-amber-200"
                        >
                            {/* Accent Background */}
                            <div className={cn(
                                "absolute -right-16 -top-16 h-32 w-32 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20",
                                path.cover_color === 'amber' && "bg-amber-500",
                                path.cover_color === 'sky' && "bg-sky-500",
                                path.cover_color === 'green' && "bg-emerald-500",
                                path.cover_color === 'rose' && "bg-rose-500"
                            )} />

                            <div className="flex flex-1 flex-col">
                                <div className="mb-4 flex items-center justify-between">
                                    <span className={cn(
                                        "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
                                        path.cover_color === 'amber' && "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
                                        path.cover_color === 'sky' && "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
                                        path.cover_color === 'green' && "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
                                        path.cover_color === 'rose' && "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                                    )}>
                                        {path.difficulty}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <Clock className="h-3.5 w-3.5" />
                                        {path.estimated_minutes}m
                                    </div>
                                </div>

                                <h2 className="text-xl font-bold text-slate-900 group-hover:text-amber-600">
                                    {isId ? path.title_id : path.title_en}
                                </h2>
                                <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                                    {isId ? path.description_id : path.description_en}
                                </p>

                                <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                        <BookOpen className="h-4 w-4" />
                                        {isId ? 'Mulai Belajar' : 'Start Learning'}
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-amber-500" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Empty State */}
                {paths.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-4 rounded-full bg-slate-50 p-6 text-slate-300">
                            <BookOpen className="h-10 w-10" />
                        </div>
                        <p className="text-slate-500">
                            {isId ? 'Belum ada jalur belajar tersedia.' : 'No study paths available yet.'}
                        </p>
                    </div>
                )}
            </div>
        </MobileAppLayout>
    );
}
