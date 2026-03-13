'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function PrayerRequestCard({
    id,
    payload,
    interactions,
}: {
    id?: number | string;
    payload: {
        author?: { name: string; avatar_url?: string };
        user?: { name: string; avatar?: string };
        title?: string;
        text?: string;
        request?: string;
        stats?: { pray_count: number; comments_count: number };
        prayCount?: number;
        commentCount?: number;
    };
    interactions?: { is_prayed: boolean };
}) {
    const userName = payload.author?.name ?? payload.user?.name ?? 'Anonymous';
    const avatar = payload.author?.avatar_url ?? payload.user?.avatar;
    const requestText = payload.text ?? payload.request ?? '';
    const initialPrays = payload.stats?.pray_count ?? payload.prayCount ?? 0;
    const commentCount = payload.stats?.comments_count ?? payload.commentCount ?? 0;
    const title = payload.title ?? 'Prayer Request';
    const postId = id != null ? String(id) : null;

    const [prayed, setPrayed] = useState(interactions?.is_prayed ?? false);
    const [count, setCount] = useState(initialPrays);

    const togglePray = () => {
        if (!postId) return;

        const prevPrayed = prayed;
        const prevCount = count;

        if (prayed) {
            setCount((prev) => prev - 1);
        } else {
            setCount((prev) => prev + 1);
        }
        setPrayed(!prayed);

        void fetch(`/api/community/posts/${postId}/pray`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        }).then((response) => {
            if (!response.ok) {
                setPrayed(prevPrayed);
                setCount(prevCount);
            }
        }).catch(() => {
            setPrayed(prevPrayed);
            setCount(prevCount);
        });
    };

    return (
        <Card className="overflow-hidden rounded-[32px] border-0 bg-violet-50/50 dark:bg-violet-950/20 shadow-soft ring-1 ring-violet-200/50 dark:ring-violet-500/10 backdrop-blur-sm">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold border border-violet-200/50 dark:border-violet-700/50">
                            {avatar ? (
                                <img src={avatar} alt={userName} className="h-full w-full rounded-full object-cover" />
                            ) : (
                                userName.charAt(0)
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{userName}</p>
                            <p className="text-[11px] font-medium text-violet-500 dark:text-violet-400 uppercase tracking-wider">{title}</p>
                        </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-white/50 dark:bg-slate-800/50 flex items-center justify-center text-violet-500">
                        <Heart className="h-4 w-4 fill-violet-500" />
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-[17px] leading-relaxed text-slate-700 dark:text-slate-200 font-medium italic font-serif">
                        "{requestText}"
                    </p>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={togglePray}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-2xl transition-all active:scale-95",
                                    prayed
                                        ? "bg-violet-500 text-white shadow-md shadow-violet-500/20"
                                        : "bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 ring-1 ring-violet-100 dark:ring-violet-800 hover:bg-violet-50"
                                )}
                            >
                                <span className="text-lg">🙏</span>
                                <span className="text-sm font-bold">{prayed ? 'Sudah Didoakan' : 'Doakan'}</span>
                            </button>

                            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-sm font-medium">
                                <MessageCircle className="h-4 w-4" />
                                <span>{commentCount}</span>
                            </div>
                        </div>

                        <div className="text-xs font-bold text-violet-400 dark:text-violet-500">
                            {count} AMIN
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
