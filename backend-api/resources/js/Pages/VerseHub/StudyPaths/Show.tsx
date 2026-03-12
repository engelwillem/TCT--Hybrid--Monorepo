import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, CheckCircle2, Circle, Play, ArrowRight, Info, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import SharePanel from '@/Components/versehub/SharePanel';
import { useState } from 'react';

interface Step {
    id: number;
    step_order: number;
    verse_ref: string;
    focus_question: string;
    mentor_note: string | null;
}

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
    steps: Step[];
}

interface ShowProps {
    lang: string;
    path: StudyPath;
    userProgress: number[];
    meta: {
        title: string;
        description: string;
        canonical_url: string;
        og_image_url: string;
    };
}

export default function Show({ lang, path, userProgress, meta }: ShowProps) {
    const isId = lang === 'id';
    const { post, processing } = useForm();
    const [shareOpen, setShareOpen] = useState(false);

    const isStepCompleted = (stepId: number) => userProgress.includes(stepId);
    const completedCount = userProgress.length;
    const totalSteps = Math.max(1, path.steps.length);
    const progressPercent = Math.round((completedCount / totalSteps) * 100);

    return (
        <MobileAppLayout
            title={isId ? path.title_id : path.title_en}
            activeNavId="library"
        >
            <Head title={meta.title}>
                <link rel="canonical" href={meta.canonical_url} />
                <meta name="description" content={meta.description} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={meta.title} />
                <meta property="og:description" content={meta.description} />
                <meta property="og:url" content={meta.canonical_url} />
                <meta property="og:image" content={meta.og_image_url} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={meta.title} />
                <meta name="twitter:description" content={meta.description} />
                <meta name="twitter:image" content={meta.og_image_url} />
            </Head>

            <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
                {/* Navigation */}
                <Link
                    href={`/versehub/${lang}/study`}
                    className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
                >
                    <ChevronLeft className="h-4 w-4" />
                    {isId ? 'Kembali ke Daftar Jalur' : 'Back to Study Paths'}
                </Link>

                {/* Hero Header */}
                <div className={cn(
                    "mb-10 overflow-hidden rounded-[40px] p-8 text-white shadow-xl md:p-12",
                    path.cover_color === 'amber' && "bg-gradient-to-br from-amber-400 to-amber-600",
                    path.cover_color === 'sky' && "bg-gradient-to-br from-sky-400 to-sky-600",
                    path.cover_color === 'green' && "bg-gradient-to-br from-emerald-400 to-emerald-600",
                    path.cover_color === 'rose' && "bg-gradient-to-br from-rose-400 to-rose-600"
                )}>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                            {path.difficulty}
                        </span>
                        <span className="text-xs font-medium opacity-80">
                            {path.estimated_minutes} {isId ? 'menit' : 'minutes'}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold md:text-5xl">
                        {isId ? path.title_id : path.title_en}
                    </h1>
                    <p className="mt-4 max-w-xl text-lg opacity-90 leading-relaxed">
                        {isId ? path.description_id : path.description_en}
                    </p>

                    <div className="mt-8">
                        <button
                            onClick={() => setShareOpen(true)}
                            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-bold backdrop-blur-md transition-all hover:bg-white/20"
                        >
                            <Share2 className="h-4 w-4" />
                            {isId ? 'Bagikan Jalur' : 'Share Path'}
                        </button>
                    </div>

                    {/* Progress Bar (Visible if user has progress) */}
                    {completedCount > 0 && (
                        <div className="mt-8">
                            <div className="flex items-baseline justify-between mb-2">
                                <p className="text-sm font-bold">{progressPercent}% {isId ? 'Selesai' : 'Complete'}</p>
                                <p className="text-xs opacity-80">{completedCount} / {path.steps.length} {isId ? 'Langkah' : 'Steps'}</p>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                                <div
                                    className="h-full bg-white transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Steps List */}
                <section className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-900 px-2">
                        {isId ? 'Langkah Pembelajaran' : 'Learning Steps'}
                    </h2>

                    <div className="space-y-3">
                        {path.steps.map((step, index) => {
                            const completed = isStepCompleted(step.id);

                            return (
                                <div
                                    key={step.id}
                                    className={cn(
                                        "group flex items-start gap-4 rounded-3xl p-5 ring-1 transition-all",
                                        completed
                                            ? "bg-slate-50 ring-slate-100"
                                            : "bg-white shadow-soft ring-slate-200 hover:ring-amber-200"
                                    )}
                                >
                                    {/* Order / Status Icon */}
                                    <div className="mt-1 flex shrink-0 items-center justify-center">
                                        {completed ? (
                                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                        ) : (
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-200 text-[10px] font-bold text-slate-400 group-hover:border-amber-300 group-hover:text-amber-500">
                                                {index + 1}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between gap-4">
                                            <h3 className={cn(
                                                "font-bold uppercase tracking-wide text-xs",
                                                completed ? "text-slate-400" : "text-slate-500"
                                            )}>
                                                {step.verse_ref.replace(/-/g, ' ')}
                                            </h3>
                                        </div>

                                        <p className={cn(
                                            "mt-1.5 text-sm leading-relaxed",
                                            completed ? "text-slate-500 line-through opacity-60" : "text-slate-800"
                                        )}>
                                            {step.focus_question}
                                        </p>

                                        {step.mentor_note && !completed && (
                                            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50/50 p-3 text-[11px] text-amber-700 ring-1 ring-amber-100">
                                                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                                <p>{step.mentor_note}</p>
                                            </div>
                                        )}

                                        <div className="mt-6 flex items-center gap-3">
                                            <Link
                                                href={`/versehub/${lang}/${step.verse_ref}`}
                                                className={cn(
                                                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all",
                                                    completed
                                                        ? "bg-slate-200 text-slate-600 hover:bg-slate-300"
                                                        : "bg-slate-900 text-white hover:bg-amber-600 shadow-md"
                                                )}
                                            >
                                                <Play className="h-3 w-3" />
                                                {isId ? 'Baca Ayat' : 'Read Verse'}
                                            </Link>

                                            {!completed && (
                                                <button
                                                    onClick={() => post(`/versehub/${lang}/study/${path.slug}/complete/${step.id}`)}
                                                    disabled={processing}
                                                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
                                                >
                                                    {isId ? 'Tandai Selesai' : 'Mark Complete'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Footer CTA */}
                {progressPercent === 100 && (
                    <div className="mt-12 rounded-[32px] bg-emerald-50 p-8 text-center ring-1 ring-emerald-100">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                        <h2 className="mt-4 text-xl font-bold text-emerald-900">
                            {isId ? 'Luar Biasa!' : 'Congratulations!'}
                        </h2>
                        <p className="mt-2 text-sm text-emerald-700">
                            {isId
                                ? 'Anda telah menyelesaikan jalur belajar ini. Teruslah bertumbuh dalam Firman Allah.'
                                : 'You have completed this study path. Keep growing in the Word of God.'}
                        </p>
                        <Link
                            href={`/versehub/${lang}/study`}
                            className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-emerald-700"
                        >
                            {isId ? 'Lihat Jalur Lainnya' : 'View Other Paths'}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                )}
            </div>

            <SharePanel
                isOpen={shareOpen}
                onClose={() => setShareOpen(false)}
                title={isId ? path.title_id : path.title_en}
                subtitle={isId ? path.description_id : path.description_en}
                url={meta.canonical_url}
                ogImageUrl={meta.og_image_url}
                lang={lang}
            />
        </MobileAppLayout>
    );
}
