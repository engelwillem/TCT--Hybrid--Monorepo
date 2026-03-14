'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/firebase/auth/use-user';
import Link from 'next/link';
import { Share2, Sparkles, MessageSquare } from 'lucide-react';
import { useMemo } from 'react';

export default function QuoteCard({
    payload,
}: {
    payload?: { text: string; author?: string | null; reference?: string | null; ref?: string | null; source?: string | null };
}) {
    const { user } = useUser();
    const isAuthenticated = Boolean(user);
    
    const quoteText =
        payload?.text?.trim() ||
        'Setiap langkah kecil hari ini tetap berarti. Kamu tidak berjalan sendiri.';

    const shareQuote = async () => {
        const shareTitle = 'Kutipan Hari Ini • TheChosenTalks';
        const url = window.location.origin + '/community';
        
        try {
            if (navigator.share) {
                await navigator.share({ title: shareTitle, text: quoteText, url });
            } else {
                await navigator.clipboard.writeText(`${quoteText}\n\n${url}`);
                alert('Teks kutipan telah disalin.');
            }
        } catch (e) { /* ignore */ }
    };

    return (
        <Card className="overflow-hidden rounded-[32px] border-0 bg-surface/80 shadow-soft ring-1 ring-border/60 backdrop-blur-xl">
            <CardContent className="px-5 pb-5 pt-5 md:px-7 md:pb-7 md:pt-7">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-surface-muted px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground ring-1 ring-border/70">
                            Quotes
                        </span>
                        <span className="text-[12px] font-medium text-muted-foreground">Today Reflection</span>
                    </div>
                    <Sparkles className="h-4 w-4 text-brand/40" />
                </div>

                <div className="relative overflow-hidden rounded-2xl shadow-inner ring-1 ring-slate-900/5">
                    <div className="aspect-[4/5] bg-[radial-gradient(120%_110%_at_5%_95%,rgba(15,23,42,0.95),transparent_45%),radial-gradient(80%_80%_at_82%_20%,rgba(30,58,138,0.6),transparent_55%),linear-gradient(145deg,#0f172a_0%,#1e293b_52%,#0f172a_100%)] md:aspect-[21/9]" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                        <div className="space-y-1">
                            <div className="select-none font-serif text-3xl text-white/20">"</div>
                            <p className="line-clamp-3 font-serif text-lg italic leading-relaxed text-slate-200">
                                Satu kutipan yang menguatkan perjalananmu hari ini.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative mt-5 overflow-hidden rounded-2xl bg-surface-muted/70 p-6 ring-1 ring-border/40 md:p-8">
                    <div className="absolute right-0 top-0 p-4 opacity-5">
                        <Sparkles className="h-12 w-12" />
                    </div>
                    <p className="relative font-serif text-[22px] tracking-tight leading-[1.6] text-foreground md:text-[26px]">
                        {quoteText}
                    </p>
                    <div className="mt-4 flex flex-col gap-1">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-brand">
                            {payload?.reference?.trim() ? payload.reference : 'Kutipan Rohani'}
                        </p>
                        {payload?.ref?.trim() ? (
                            <Link
                                href={`/versehub/id/${payload.ref}`}
                                className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground transition-colors hover:text-brand"
                            >
                                Buka dalam Alkitab
                            </Link>
                        ) : null}
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <button 
                        onClick={() => window.location.assign('/community')}
                        className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-brand transition-colors"
                    >
                        <MessageSquare className="h-4 w-4" />
                        Lihat Diskusi Komunitas
                    </button>
                    <button 
                        onClick={shareQuote}
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-muted text-muted-foreground hover:text-brand transition-all"
                    >
                        <Share2 className="h-4.5 w-4.5" />
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}
