import { Card, CardContent } from '@/Components/ui/card';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function SystemReflectionCard({
    id,
    payload,
    interactions,
}: {
    id?: number;
    payload: {
        title?: string;
        text?: string;
        content?: string;
        verseRef?: string;
        ctaText?: string;
        ctaLink?: string;
        stats?: { encouraged_count: number };
    };
    interactions?: { is_encouraged: boolean };
}) {
    const title = payload.title ?? 'Refleksi Terpilih';
    const content = payload.text ?? payload.content ?? 'Satu kutipan yang menguatkan perjalananmu hari ini.';
    const postId = id;

    const [encouraged, setEncouraged] = useState(interactions?.is_encouraged ?? false);
    const [count, setCount] = useState(payload.stats?.encouraged_count ?? 0);

    const toggleEncourage = () => {
        if (!postId) return;

        if (encouraged) {
            setCount(prev => prev - 1);
        } else {
            setCount(prev => prev + 1);
        }
        setEncouraged(!encouraged);

        router.post(route('community.posts.encourage', postId), {}, {
            preserveScroll: true,
            onError: () => {
                setEncouraged(encouraged);
                setCount(count);
            }
        });
    };

    return (
        <Card className="overflow-hidden rounded-[32px] border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl ring-1 ring-white/10 relative">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            <CardContent className="p-7 relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                            <Sparkles className="h-4 w-4 text-cyan-300" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300/80">Refleksi Terpilih</span>
                    </div>

                    <button
                        onClick={toggleEncourage}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-all active:scale-95",
                            encouraged
                                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                                : "bg-white/10 text-white hover:bg-white/20 border border-white/5"
                        )}
                    >
                        <Heart className={cn("h-3.5 w-3.5", encouraged && "fill-current")} />
                        <span className="text-[10px] font-bold">{encouraged ? 'Terberkati' : count > 0 ? count : 'Amin'}</span>
                    </button>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-bold leading-tight">
                        {title}
                    </h3>

                    <p className="text-sm leading-relaxed text-slate-300">
                        {content}
                    </p>

                    {payload.verseRef && (
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 border border-white/5">
                            <span className="text-[10px] font-bold text-slate-300">{payload.verseRef}</span>
                        </div>
                    )}

                    <div className="pt-4">
                        <Link
                            href={payload.ctaLink ?? '/community'}
                            className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-cyan-300 transition-colors group"
                        >
                            {payload.ctaText ?? 'Bagikan pemikiranmu'}
                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
