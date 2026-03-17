"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BookOpen, Globe, Search, Settings2, Share2, Copy, 
    ExternalLink, PenLine, ChevronDown, Check, X, Calendar,
    Zap, MousePointer2, Sparkles, Heart, Bookmark as BookmarkIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types from Laravel Activity.tsx
type ActivityItem = {
    id: number;
    ref: string;
    book: string;
    book_label: string;
    chapter: number;
    verse: number;
    chapter_href: string;
    is_favorite: boolean;
    is_bookmark: boolean;
    note: string;
    updated_at: string | null;
};

type ActivityGroup = {
    label: string;
    items: ActivityItem[];
};

type ActivityStats = {
    streak: number;
    total_saved: number;
    this_week: number;
    growth_percent: number;
    quote_of_week?: string | null;
    quote_ref?: string | null;
};

const JAKARTA_TIMEZONE = 'Asia/Jakarta';
const TIMELINE_ORDER = ['Hari Ini', 'Kemarin', 'Minggu Ini', 'Bulan Ini', 'Bulan Lalu', 'Tanpa tanggal'] as const;

// Utility functions ported from Laravel
function toTimestamp(raw: string | null | undefined): number {
    if (!raw) return 0;
    const t = new Date(raw).getTime();
    return Number.isFinite(t) ? t : 0;
}

function getTimelineLabel(raw: string | null | undefined): string {
    if (!raw) return 'Tanpa tanggal';
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return 'Tanpa tanggal';

    const now = new Date();
    const toKey = (dt: Date) =>
        dt.toLocaleDateString('en-CA', {
            timeZone: JAKARTA_TIMEZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    const toParts = (dt: Date) => {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: JAKARTA_TIMEZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        })
            .formatToParts(dt)
            .reduce<Record<string, string>>((acc, p) => {
                if (p.type !== 'literal') acc[p.type] = p.value;
                return acc;
            }, {});
        return {
            year: Number(parts.year),
            month: Number(parts.month),
            day: Number(parts.day),
        };
    };

    const rowKey = toKey(date);
    const todayKey = toKey(now);
    if (rowKey === todayKey) return 'Hari Ini';

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (rowKey === toKey(yesterday)) return 'Kemarin';

    const rowParts = toParts(date);
    const nowParts = toParts(now);
    const rowMonthIndex = rowParts.year * 12 + rowParts.month;
    const nowMonthIndex = nowParts.year * 12 + nowParts.month;

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
    const weekStartKey = toKey(startOfWeek);
    if (rowKey >= weekStartKey && rowKey <= todayKey) return 'Minggu Ini';

    if (rowMonthIndex === nowMonthIndex) return 'Bulan Ini';
    if (rowMonthIndex === nowMonthIndex - 1) return 'Bulan Lalu';

    return date.toLocaleDateString('id-ID', {
        timeZone: JAKARTA_TIMEZONE,
        month: 'long',
        year: 'numeric',
    });
}

function groupByTimeline(items: ActivityItem[]): ActivityGroup[] {
    const grouped = new Map<string, ActivityItem[]>();
    items.forEach((item) => {
        const label = getTimelineLabel(item.updated_at);
        const bucket = grouped.get(label) ?? [];
        bucket.push(item);
        grouped.set(label, bucket);
    });

    const weight = new Map<string, number>();
    TIMELINE_ORDER.forEach((label, index) => {
        weight.set(label, index);
    });

    return Array.from(grouped.entries())
        .sort(([labelA, itemsA], [labelB, itemsB]) => {
            const wa = weight.get(labelA);
            const wb = weight.get(labelB);
            if (wa !== undefined && wb !== undefined) return wa - wb;
            if (wa !== undefined) return -1;
            if (wb !== undefined) return 1;

            const maxA = Math.max(...itemsA.map((item) => toTimestamp(item.updated_at)));
            const maxB = Math.max(...itemsB.map((item) => toTimestamp(item.updated_at)));
            return maxB - maxA;
        })
        .map(([label, groupItems]) => ({
            label,
            items: groupItems,
        }));
}

function formatRelativeDate(raw?: string | null) {
    if (!raw) return '';
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return '';
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86_400_000);
    if (diffDays <= 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
    return d.toLocaleDateString('id-ID', { dateStyle: 'medium' });
}

export default function SpiritualJourneyPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const lang = params?.lang as string || 'id';
    const isId = lang === 'id';

    // State
    const [localItems, setLocalItems] = useState<ActivityItem[]>([]);
    const [stats, setStats] = useState<ActivityStats>({
        streak: 0,
        total_saved: 0,
        this_week: 0,
        growth_percent: 0
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [searchQuery, setSearchQuery] = useState('');

    // Mock data population for parity demonstration
    useEffect(() => {
        // Fetch from API in real implementation
        setTimeout(() => {
            setLocalItems([
                { id: 101, ref: 'yoh-3-16', book: 'yoh', book_label: 'Yohanes', chapter: 3, verse: 16, chapter_href: '/versehub/id/yoh-3', is_favorite: true, is_bookmark: false, note: 'Ayat yang menguatkan iman.', updated_at: new Date().toISOString() },
                { id: 102, ref: 'mat-5-1', book: 'mat', book_label: 'Matius', chapter: 5, verse: 1, chapter_href: '/versehub/id/mat-5', is_favorite: false, is_bookmark: true, note: '', updated_at: new Date(Date.now() - 86400000).toISOString() },
                { id: 103, ref: 'kej-1-1', book: 'kej', book_label: 'Kejadian', chapter: 1, verse: 1, chapter_href: '/versehub/id/kej-1', is_favorite: false, is_bookmark: false, note: 'Awal segalanya.', updated_at: new Date(Date.now() - 86400000 * 3).toISOString() },
            ]);
            setStats({
                streak: 5,
                total_saved: 42,
                this_week: 12,
                growth_percent: 15,
                quote_of_week: 'Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku...',
                quote_ref: 'Yeremia 29:11'
            });
            setLoading(false);
        }, 800);
    }, []);

    const localGroups = useMemo(() => groupByTimeline(localItems), [localItems]);

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Header Parity */}
            <div className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border/50 transition-all">
                <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
                    <button onClick={() => router.back()} className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-muted border border-border/50 active:scale-95 transition-all hover:bg-surface-elevated text-foreground">
                        <X className="h-4 w-4" />
                    </button>
                    <h1 className="font-bold text-lg text-foreground">Perjalanan Rohani</h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </div>

            <main className="mx-auto max-w-2xl px-4 py-8">
                {/* Stats Grid Parity */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-surface-muted rounded-[32px] p-6 text-foreground shadow-soft border border-border/50">
                        <div id="vh-streak-card-react" className="flex items-center gap-2 mb-2">
                            <Zap className="h-5 w-5 text-brand" fill="currentColor" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Streak</span>
                        </div>
                        <p className="text-4xl font-bold">{stats.streak}<span className="text-lg opacity-50 ml-1">Hari</span></p>
                        <p className="mt-2 text-xs text-muted-foreground font-medium">Lanjutkan konsistensi Anda.</p>
                    </div>
                    <div className="bg-surface border border-border/50 rounded-[40px] p-8 shadow-card transition-all hover:bg-surface-elevated">
                        <div className="flex items-center gap-3 mb-3">
                            <Sparkles className="h-6 w-6 text-brand shadow-[0_0_15px_rgba(var(--brand-rgb),0.3)]" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Total Saved</span>
                        </div>
                        <p className="text-5xl font-bold text-foreground tracking-tighter">{stats.total_saved}</p>
                        <p className="mt-3 text-xs text-brand font-medium">+ {stats.growth_percent}% vs last week</p>
                    </div>
                </div>

                {/* Quote of the Week Parity */}
                {stats.quote_of_week && (
                    <div className="bg-brand/5 rounded-[40px] p-10 mb-8 border border-brand/10 backdrop-blur-sm shadow-soft relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-3xl -mr-16 -mt-16" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand mb-6 text-center">Quote of the Week</p>
                        <p className="font-serif text-2xl italic text-center text-foreground leading-relaxed">"{stats.quote_of_week}"</p>
                        <p className="mt-6 text-xs font-bold text-center text-brand/80 tracking-widest">{stats.quote_ref}</p>
                    </div>
                )}

                {/* Tabs & Search */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {['all', 'favorites', 'bookmarks', 'notes'].map(t => (
                            <button
                                key={t}
                                onClick={() => setActiveTab(t)}
                                className={cn(
                                    "px-6 py-2.5 rounded-full text-[11px] font-bold tracking-widest transition-all whitespace-nowrap border",
                                    activeTab === t ? "bg-foreground text-background border-border/50 shadow-soft" : "bg-surface text-muted-foreground border-border/50 hover:bg-surface-elevated"
                                )}
                            >
                                {t.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Cari dalam riwayat..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-13 bg-surface border border-border/50 rounded-2xl pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-border/50 focus:bg-surface-elevated outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Activity List */}
                <div className="mt-8 space-y-8">
                    {loading ? (
                         <div className="space-y-4">
                            {[1,2,3].map(i => <div key={i} className="h-28 bg-surface-muted rounded-[28px] animate-pulse" />)}
                         </div>
                    ) : localGroups.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground">Belum ada aktivitas tercatat.</p>
                        </div>
                    ) : (
                        localGroups.map(group => (
                            <div key={group.label} className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2">{group.label}</h3>
                                <div className="space-y-3">
                                    {group.items.map(row => (
                                        <motion.div
                                            key={row.id}
                                            layout
                                            className={cn(
                                                "rounded-[32px] glass-card border-0 backdrop-blur-md transition-all duration-300",
                                                expanded[row.id] ? "ring-2 ring-brand/20 bg-surface-elevated shadow-card" : "hover:bg-surface-elevated"
                                            )}
                                        >
                                            <button 
                                                onClick={() => setExpanded(prev => ({...prev, [row.id]: !prev[row.id]}))}
                                                className="w-full text-left p-5"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-bold text-foreground text-base tracking-tight">{row.book_label} {row.chapter}:{row.verse}</p>
                                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1.5">{formatRelativeDate(row.updated_at)}</p>
                                                    </div>
                                                    <div className="flex gap-1.5">
                                                        {row.is_favorite && <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />}
                                                        {row.is_bookmark && <BookmarkIcon className="h-3.5 w-3.5 text-brand fill-brand" />}
                                                    </div>
                                                </div>
                                                {row.note && (
                                                    <p className="mt-3 text-sm text-muted-foreground italic line-clamp-1">"{row.note}"</p>
                                                )}
                                            </button>
                                            <AnimatePresence>
                                                {expanded[row.id] && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="px-6 pb-6 pt-2 border-t border-border/50 bg-surface/50"
                                                    >
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <a href={row.chapter_href} className="flex items-center gap-1.5 px-4 h-9 rounded-full bg-foreground text-background text-[11px] font-bold hover:bg-foreground/90">
                                                                <ExternalLink className="h-3 w-3" /> Reader
                                                            </a>
                                                            <button className="flex items-center gap-1.5 px-4 h-9 rounded-full bg-surface-muted border border-border/50 text-[11px] font-bold text-foreground/80 hover:bg-surface-elevated">
                                                                <PenLine className="h-3 w-3" /> Edit Note
                                                            </button>
                                                            <button className="flex items-center gap-1.5 px-4 h-9 rounded-full bg-surface-muted border border-border/50 text-[11px] font-bold text-foreground/80 hover:bg-surface-elevated">
                                                                <Share2 className="h-3 w-3" /> Share
                                                            </button>
                                                            <button className="flex items-center gap-1.5 px-4 h-9 rounded-full bg-brand text-[11px] font-bold text-brand-foreground shadow-sm shadow-brand/20">
                                                                ✨ Post to Today
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
