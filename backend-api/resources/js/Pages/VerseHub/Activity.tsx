import type { PageProps } from '@/types';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import type { Dispatch, SetStateAction } from 'react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Globe, Search, Settings2, Share2, Copy, ExternalLink, PenLine } from 'lucide-react';
import { cn } from '@/lib/utils';

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

type ActivityPageMeta = {
    has_more: boolean;
    next_cursor: string | null;
    cursor?: string | null;
};

type ActivityStats = {
    streak: number;
    total_saved: number;
    this_week: number;
    growth_percent: number;
    quote_of_week?: string | null;
    quote_ref?: string | null;
};

type ActivityProps = PageProps<{
    tab: 'all' | 'favorites' | 'bookmarks' | 'notes';
    query: string;
    sort: 'recent' | 'oldest';
    per_page: 20 | 50 | 100;
    cursor?: string | null;
    totals: {
        all: number;
        favorites: number;
        bookmarks: number;
        notes: number;
    };
    grouped_rows: ActivityGroup[];
    items: ActivityItem[];
    page: ActivityPageMeta;
    activity_stats: ActivityStats;
}>;

const TABS = [
    { key: 'all', label: 'All' },
    { key: 'favorites', label: 'Fav' },
    { key: 'bookmarks', label: 'Bookmarks' },
    { key: 'notes', label: 'Notes' },
] as const;

const ACTIVITY_URL = '/versehub/id/my-spiritual-journey';
const JAKARTA_TIMEZONE = 'Asia/Jakarta';
const TIMELINE_ORDER = ['Hari Ini', 'Kemarin', 'Minggu Ini', 'Bulan Ini', 'Bulan Lalu', 'Tanpa tanggal'] as const;

function toTimestamp(raw: string | null | undefined): number {
    if (!raw) return 0;
    const t = new Date(raw).getTime();
    return Number.isFinite(t) ? t : 0;
}

function sortItems(items: ActivityItem[], sortMode: 'recent' | 'oldest'): ActivityItem[] {
    return [...items].sort((a, b) => {
        const ta = toTimestamp(a.updated_at);
        const tb = toTimestamp(b.updated_at);
        if (ta === tb) {
            return sortMode === 'oldest' ? a.id - b.id : b.id - a.id;
        }
        return sortMode === 'oldest' ? ta - tb : tb - ta;
    });
}

function mergeItemsById(prev: ActivityItem[], next: ActivityItem[], sortMode: 'recent' | 'oldest'): ActivityItem[] {
    if (next.length === 0) return prev;

    const map = new Map<number, ActivityItem>();
    prev.forEach((item) => map.set(item.id, item));
    next.forEach((item) => map.set(item.id, item));

    return sortItems(Array.from(map.values()), sortMode);
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

function pickArray<T>(source: unknown, key: string): T[] {
    if (!source || typeof source !== 'object') return [];
    const data = (source as Record<string, unknown>)[key];
    return Array.isArray(data) ? (data as T[]) : [];
}

function pickObject<T>(source: unknown, key: string, fallback: T): T {
    if (!source || typeof source !== 'object') return fallback;
    const data = (source as Record<string, unknown>)[key];
    if (data && typeof data === 'object') return data as T;
    return fallback;
}

function formatLocalDate(raw?: string | null) {
    if (!raw) return '';
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return '';
    return `${d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WIB`;
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
    return formatLocalDate(raw);
}

type ActivityListCardProps = {
    loadingFilter: boolean;
    totalRows: number;
    localGroups: ActivityGroup[];
    expanded: Record<string, boolean>;
    setExpanded: Dispatch<SetStateAction<Record<string, boolean>>>;
    localPage: ActivityPageMeta;
    loadingMore: boolean;
    onLoadMore: () => void;
    onSaveNote: (row: ActivityItem, note: string) => Promise<boolean>;
    savingNoteId: number | null;
    onPublishQuote: (row: ActivityItem) => Promise<boolean>;
    publishingQuoteId: number | null;
    activeTab: ActivityProps['tab'];
    isId: boolean;
};

const ActivityListCard = memo(function ActivityListCard({
    loadingFilter,
    totalRows,
    localGroups,
    expanded,
    setExpanded,
    localPage,
    loadingMore,
    onLoadMore,
    onSaveNote,
    savingNoteId,
    onPublishQuote,
    publishingQuoteId,
    activeTab,
    isId,
}: ActivityListCardProps) {
    const [editing, setEditing] = useState<Record<string, boolean>>({});
    const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

    return (
        <>
            <div className="mt-8">
                {loadingFilter ? (
                    <div className="space-y-4 px-1">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={`skeleton-${index}`} className="animate-pulse h-28 rounded-[28px] bg-white/20 backdrop-blur-md" />
                        ))}
                    </div>
                ) : totalRows === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-slate-900/5 text-3xl dark:bg-white/5 mb-4">
                            ✨
                        </div>
                        <p className="text-sm font-medium text-slate-400">Mulai simpan ayat pertama Anda hari ini.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {localGroups.map((group) => (
                            <div key={group.label} className="space-y-4">
                                <div className="px-2">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{group.label}</h3>
                                </div>
                                <ul className="space-y-3">
                                    {group.items.map((row) => {
                                        const itemKey = String(row.id);
                                        const isOpen = Boolean(expanded[itemKey]);
                                        const isEditing = Boolean(editing[itemKey]);
                                        const draftValue = noteDraft[itemKey] ?? row.note ?? '';
                                        return (
                                            <motion.li
                                                key={itemKey}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={cn(
                                                    "overflow-hidden rounded-[28px] bg-white/40 shadow-sm backdrop-blur-xl ring-1 ring-black/[0.04] transition-all duration-300 dark:bg-white/5 dark:ring-white/[0.08]",
                                                    isOpen && "ring-black/[0.1] dark:ring-white/[0.2]"
                                                )}
                                            >
                                                <div className="p-1.5">
                                                    <button
                                                        type="button"
                                                        className="w-full text-left p-3.5"
                                                        onClick={() => {
                                                            setExpanded((prev) => ({ ...prev, [itemKey]: !prev[itemKey] }));
                                                        }}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                                                                    {row.book_label} {row.chapter}:{row.verse}
                                                                </p>
                                                                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                                    {row.book.toUpperCase()} {row.chapter}:{row.verse}
                                                                </p>
                                                            </div>
                                                            <div className={cn(
                                                                "flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/5 transition-transform duration-300 dark:bg-white/5",
                                                                isOpen && "rotate-180"
                                                            )}>
                                                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            </div>
                                                        </div>

                                                        {row.note && !isOpen && (
                                                            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500 italic">
                                                                "{row.note}"
                                                            </p>
                                                        )}

                                                        <p className="mt-2 text-[10px] font-medium text-slate-400">
                                                            {formatRelativeDate(row.updated_at)}
                                                        </p>
                                                    </button>

                                                    {isOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            className="px-3.5 pb-4"
                                                        >
                                                            {row.note || isEditing ? (
                                                                <div className="mb-4 rounded-2xl bg-slate-900/[0.02] p-4 ring-1 ring-black/[0.03] dark:bg-white/[0.02] dark:ring-white/[0.05]">
                                                                    {isEditing ? (
                                                                        <div className="space-y-3">
                                                                            <textarea
                                                                                value={draftValue}
                                                                                onChange={(e) => {
                                                                                    const next = e.target.value;
                                                                                    setNoteDraft((prev) => ({ ...prev, [itemKey]: next }));
                                                                                }}
                                                                                className="min-h-[120px] w-full resize-none rounded-2xl border-none bg-white p-4 text-[13px] leading-relaxed shadow-sm outline-none ring-1 ring-black/5 dark:bg-slate-800"
                                                                                placeholder="Tulis refleksi Anda di sini..."
                                                                                autoFocus
                                                                            />
                                                                            <div className="flex justify-end gap-2">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setEditing((prev) => ({ ...prev, [itemKey]: false }));
                                                                                        setNoteDraft((prev) => {
                                                                                            const copy = { ...prev };
                                                                                            delete copy[itemKey];
                                                                                            return copy;
                                                                                        });
                                                                                    }}
                                                                                    className="h-8 rounded-full px-4 text-[11px] font-bold text-slate-400 active:scale-95 transition-all"
                                                                                >
                                                                                    Batal
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={async () => {
                                                                                        const ok = await onSaveNote(row, draftValue);
                                                                                        if (ok) {
                                                                                            setEditing((prev) => ({ ...prev, [itemKey]: false }));
                                                                                            setNoteDraft((prev) => {
                                                                                                const copy = { ...prev };
                                                                                                delete copy[itemKey];
                                                                                                return copy;
                                                                                            });
                                                                                        }
                                                                                    }}
                                                                                    className="h-8 rounded-full bg-slate-900 px-4 text-[11px] font-bold text-white shadow-sm active:scale-95 transition-all dark:bg-white dark:text-slate-900"
                                                                                    disabled={savingNoteId === row.id}
                                                                                >
                                                                                    {savingNoteId === row.id ? '...' : 'Simpan'}
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-[13px] leading-relaxed text-slate-700 italic dark:text-slate-300">
                                                                            "{row.note}"
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ) : null}

                                                            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
                                                                <a
                                                                    href={row.chapter_href}
                                                                    className="flex items-center justify-center gap-1.5 h-10 rounded-2xl bg-slate-900 text-[11px] font-bold text-white shadow-sm active:scale-95 transition-all dark:bg-white dark:text-slate-900"
                                                                >
                                                                    <ExternalLink className="h-3.5 w-3.5" /> Open
                                                                </a>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditing((prev) => ({ ...prev, [itemKey]: true }));
                                                                        setNoteDraft((prev) => ({ ...prev, [itemKey]: row.note ?? '' }));
                                                                    }}
                                                                    className="flex items-center justify-center gap-1.5 h-10 rounded-2xl bg-slate-900/5 text-[11px] font-bold text-slate-600 active:scale-95 transition-all dark:bg-white/5 dark:text-slate-300"
                                                                >
                                                                    <PenLine className="h-3.5 w-3.5" /> Note
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={async () => {
                                                                        try {
                                                                            await navigator.clipboard.writeText(`${row.book.toUpperCase()} ${row.chapter}:${row.verse}`);
                                                                        } catch { /* no-op */ }
                                                                    }}
                                                                    className="flex items-center justify-center gap-1.5 h-10 rounded-2xl bg-slate-900/5 text-[11px] font-bold text-slate-600 active:scale-95 transition-all dark:bg-white/5 dark:text-slate-300"
                                                                >
                                                                    <Copy className="h-3.5 w-3.5" /> Copy
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={async () => {
                                                                        try {
                                                                            if (navigator.share) await navigator.share({ url: row.chapter_href });
                                                                            else await navigator.clipboard.writeText(row.chapter_href);
                                                                        } catch { /* no-op */ }
                                                                    }}
                                                                    className="flex items-center justify-center gap-1.5 h-10 rounded-2xl bg-slate-900/5 text-[11px] font-bold text-slate-600 active:scale-95 transition-all dark:bg-white/5 dark:text-slate-300"
                                                                >
                                                                    <Share2 className="h-3.5 w-3.5" /> Share
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={async () => {
                                                                        await onPublishQuote(row);
                                                                    }}
                                                                    className="flex col-span-2 sm:col-auto items-center justify-center gap-1.5 h-10 rounded-2xl bg-emerald-500 text-[11px] font-bold text-white shadow-sm active:scale-95 transition-all disabled:opacity-50"
                                                                    disabled={publishingQuoteId === row.id}
                                                                >
                                                                    ✨ {publishingQuoteId === row.id ? '...' : (isId ? 'Post ke Today' : 'Post to Today')}
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </motion.li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {localPage?.has_more ? (
                <div className="mt-4 flex justify-center">
                    <button
                        type="button"
                        onClick={onLoadMore}
                        disabled={loadingMore}
                        className="inline-flex items-center rounded-full bg-surface-muted px-4 py-2 text-xs font-semibold text-foreground ring-1 ring-black/5 hover:bg-surface disabled:opacity-60"
                    >
                        {loadingMore ? 'Loading...' : 'Load more'}
                    </button>
                </div>
            ) : null}
        </>
    );
});

export default function VerseHubActivityPage(props: ActivityProps) {
    const { auth, tab, query, sort, per_page, totals, items, page, activity_stats } = props;
    const isId = true;

    const [activeTab, setActiveTab] = useState<ActivityProps['tab']>(tab);
    const [searchQuery, setSearchQuery] = useState(query ?? '');
    const [sortMode, setSortMode] = useState<ActivityProps['sort']>(sort);
    const [perPage, setPerPage] = useState<ActivityProps['per_page']>(per_page);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [localItems, setLocalItems] = useState<ActivityItem[]>(sortItems(items ?? [], sort));
    const [localPage, setLocalPage] = useState<ActivityPageMeta>(page ?? { has_more: false, next_cursor: null });
    const [localTotals, setLocalTotals] = useState(totals);
    const [localStats, setLocalStats] = useState(activity_stats);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [savingNoteId, setSavingNoteId] = useState<number | null>(null);
    const [publishingQuoteId, setPublishingQuoteId] = useState<number | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadingFilter, setLoadingFilter] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    const debounceRef = useRef<number | null>(null);
    const suppressSearchEffectRef = useRef(true);

    const localGroups = useMemo(() => groupByTimeline(localItems), [localItems]);
    const latestReadItem = useMemo(() => (localItems.length > 0 ? sortItems(localItems, 'recent')[0] : null), [localItems]);
    const weeklyProgress = useMemo(() => {
        const target = 7;
        const value = Number(localStats?.this_week ?? 0);
        return Math.max(0, Math.min(100, Math.round((value / target) * 100)));
    }, [localStats?.this_week]);
    const spiritualInsight = useMemo(() => {
        const noteRows = localItems.filter((item) => String(item.note ?? '').trim() !== '');
        const nightNotes = noteRows.filter((item) => {
            if (!item.updated_at) return false;
            const parts = new Intl.DateTimeFormat('en-US', {
                timeZone: JAKARTA_TIMEZONE,
                hour: '2-digit',
                hour12: false,
            }).formatToParts(new Date(item.updated_at));
            const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
            return hour >= 20;
        });
        if (nightNotes.length >= 2) {
            return 'Anda sering mencatat ayat di malam hari. Mau aktifkan pengingat refleksi jam 20.00?';
        }

        const weekAgo = Date.now() - (7 * 86_400_000);
        const weeklyBooks = new Set(
            localItems
                .filter((item) => (item.updated_at ? new Date(item.updated_at).getTime() >= weekAgo : false))
                .map((item) => item.book_label),
        );
        if (weeklyBooks.size >= 3) {
            return `Anda membaca ${weeklyBooks.size} kitab berbeda minggu ini.`;
        }

        if (Number(localStats?.this_week ?? 0) > 0) {
            return 'Perjalanan rohani Anda sedang bertumbuh minggu ini.';
        }
        return null;
    }, [localItems, localStats?.this_week]);

    useEffect(() => {
        const key = 'vh_spiritual_journey_scroll_y';
        const saved = Number(window.sessionStorage.getItem(key) ?? '0');
        if (saved > 0) {
            window.requestAnimationFrame(() => window.scrollTo({ top: saved, behavior: 'auto' }));
        }

        const onScroll = () => {
            window.sessionStorage.setItem(key, String(Math.max(0, window.scrollY)));
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const desktopQuery = window.matchMedia('(min-width: 768px)');
        const syncDesktop = () => setIsDesktop(desktopQuery.matches);
        syncDesktop();
        desktopQuery.addEventListener('change', syncDesktop);
        return () => {
            desktopQuery.removeEventListener('change', syncDesktop);
        };
    }, []);

    useEffect(() => {
        const currentStreak = Number(localStats?.streak ?? 0);
        const key = 'vh_activity_last_streak';
        const last = Number(window.localStorage.getItem(key) || '0');
        if (currentStreak > last && currentStreak > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            const host = document.createElement('div');
            host.className = 'pointer-events-none fixed inset-0 z-50 overflow-hidden';
            document.body.appendChild(host);
            const streakCard = document.getElementById('vh-streak-card-react');
            const rect = streakCard?.getBoundingClientRect();
            const originX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
            const originY = rect ? rect.top + 10 : 80;
            const count = window.innerWidth < 768 ? 10 : 16;
            for (let i = 0; i < count; i++) {
                const dot = document.createElement('span');
                const size = Math.floor(Math.random() * 5) + 4;
                const dx = (Math.random() - 0.5) * 160;
                const dy = Math.random() * 120 + 40;
                dot.style.position = 'absolute';
                dot.style.left = `${originX}px`;
                dot.style.top = `${originY}px`;
                dot.style.width = `${size}px`;
                dot.style.height = `${size}px`;
                dot.style.borderRadius = '9999px';
                dot.style.background = ['#111111', '#22c55e', '#f59e0b'][i % 3];
                dot.style.opacity = '0.9';
                dot.style.transform = 'translate(-50%, -50%)';
                dot.style.transition = 'transform 900ms ease-out, opacity 900ms ease-out';
                host.appendChild(dot);
                requestAnimationFrame(() => {
                    dot.style.transform = `translate(${dx}px, ${dy}px)`;
                    dot.style.opacity = '0';
                });
            }
            window.setTimeout(() => host.remove(), 980);
        }
        window.localStorage.setItem(key, String(currentStreak));
    }, [localStats?.streak]);

    const submitFilters = (next: {
        tab?: ActivityProps['tab'];
        q?: string;
        sort?: ActivityProps['sort'];
        per_page?: ActivityProps['per_page'];
    }) => {
        setLoadingFilter(true);
        router.get(
            ACTIVITY_URL,
            {
                tab: next.tab ?? activeTab,
                q: next.q ?? searchQuery,
                sort: next.sort ?? sortMode,
                per_page: next.per_page ?? perPage,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['tab', 'query', 'sort', 'per_page', 'totals', 'items', 'page', 'activity_stats'],
                onSuccess: (responsePage) => {
                    const responseProps = (responsePage as { props?: unknown })?.props ?? {};
                    const nextItems = pickArray<ActivityItem>(responseProps, 'items');
                    const nextPageMeta = pickObject<ActivityPageMeta>(
                        responseProps,
                        'page',
                        { has_more: false, next_cursor: null },
                    );
                    const nextTotals = pickObject<typeof totals>(responseProps, 'totals', totals);
                    const nextStats = pickObject<ActivityStats>(responseProps, 'activity_stats', localStats);
                    const nextSortMode = next.sort ?? sortMode;

                    setLocalItems(sortItems(nextItems, nextSortMode));
                    setLocalPage(nextPageMeta);
                    setLocalTotals(nextTotals);
                    setLocalStats(nextStats);
                    setExpanded({});
                    suppressSearchEffectRef.current = true;
                    keepCleanUrl();
                },
                onFinish: () => setLoadingFilter(false),
            },
        );
    };

    useEffect(() => {
        if (suppressSearchEffectRef.current) {
            suppressSearchEffectRef.current = false;
            return;
        }

        if (debounceRef.current) {
            window.clearTimeout(debounceRef.current);
        }

        debounceRef.current = window.setTimeout(() => {
            submitFilters({ q: searchQuery.trim() });
        }, 300);

        return () => {
            if (debounceRef.current) window.clearTimeout(debounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    const totalRows = useMemo(() => localItems.length, [localItems]);

    const onLoadMore = useCallback(() => {
        const cursor = localPage?.next_cursor;
        if (!cursor || loadingMore) return;

        router.get(
            ACTIVITY_URL,
            {
                tab: activeTab,
                q: searchQuery.trim(),
                sort: sortMode,
                per_page: perPage,
                cursor,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['items', 'page'],
                onStart: () => setLoadingMore(true),
                onSuccess: (responsePage) => {
                    const responseProps = (responsePage as { props?: unknown })?.props ?? {};
                    const nextItems = pickArray<ActivityItem>(responseProps, 'items');
                    const nextPageMeta = pickObject<ActivityPageMeta>(
                        responseProps,
                        'page',
                        { has_more: false, next_cursor: null },
                    );

                    setLocalItems((prev) => mergeItemsById(prev, nextItems, sortMode));
                    setLocalPage(nextPageMeta);
                    keepCleanUrl();
                },
                onFinish: () => setLoadingMore(false),
            },
        );
    }, [activeTab, loadingMore, localPage?.next_cursor, perPage, searchQuery, sortMode]);

    const onSaveNote = useCallback(async (row: ActivityItem, note: string): Promise<boolean> => {
        try {
            setSavingNoteId(row.id);
            await axios.post('/versehub/id/reader-actions', {
                book: row.book,
                chapter: row.chapter,
                verse: row.verse,
                note,
            });

            const nowIso = new Date().toISOString();
            setLocalItems((prev) =>
                sortItems(
                    prev.map((item) =>
                        item.id === row.id
                            ? {
                                ...item,
                                note: note.trim(),
                                updated_at: nowIso,
                            }
                            : item,
                    ),
                    sortMode,
                ),
            );

            return true;
        } catch {
            window.alert('Gagal menyimpan catatan. Coba lagi.');
            return false;
        } finally {
            setSavingNoteId(null);
        }
    }, [sortMode]);

    const onPublishQuote = useCallback(async (row: ActivityItem): Promise<boolean> => {
        try {
            setPublishingQuoteId(row.id);
            const response = await axios.post('/versehub/id/my-spiritual-journey/quote-post', {
                action_id: row.id,
                source_tab: activeTab,
            });

            const quote = String(response?.data?.text ?? row.note ?? '').trim();
            const reference = String(response?.data?.reference ?? `${row.book_label} ${row.chapter}:${row.verse}`);

            if (quote !== '') {
                setLocalStats((prev) => ({
                    ...prev,
                    quote_of_week: quote.length > 180 ? `${quote.slice(0, 180)}...` : quote,
                    quote_ref: reference,
                }));
            }

            window.alert('Quote berhasil diposting ke Today. Otomatis masuk Archive Community setelah 24 jam.');
            return true;
        } catch (err) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                ?? 'Gagal memposting quote. Coba lagi.';
            window.alert(message);
            return false;
        } finally {
            setPublishingQuoteId(null);
        }
    }, []);

    const resetFilters = () => {
        setSortMode('recent');
        setPerPage(20);
        setShowFilterPanel(false);
        submitFilters({ sort: 'recent', per_page: 20 });
    };

    const keepCleanUrl = useCallback(() => {
        if (typeof window === 'undefined') return;
        const cleanUrl = ACTIVITY_URL;
        const current = `${window.location.pathname}${window.location.search}`;
        if (current !== cleanUrl) {
            window.history.replaceState({}, '', cleanUrl);
        }
    }, []);

    useEffect(() => {
        keepCleanUrl();
    }, [keepCleanUrl]);

    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
            </Head>
            <MobileAppLayout
                title={isId ? "Jurnal Perjalanan" : "Spiritual Journey"}
                activeNavId="bible"
                backHref="/versehub/id"
                className="max-w-4xl md:max-w-none"
            >
                <div className="relative px-4 pb-32 pt-6 md:px-6">
                    {/* Phase 1: Large iOS Title */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {isId ? 'Perjalanan' : 'Your Journey'}
                        </h1>
                        <p className="mt-1 text-sm font-medium text-slate-500/80 dark:text-slate-400">
                            {isId ? 'Catatan pertumbuhan iman harian Anda.' : 'Your daily faith growth records.'}
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Phase 2: Premium Stats Grid */}
                        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
                            <motion.div
                                id="vh-streak-card-react"
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    'relative overflow-hidden rounded-[32px] p-6 transition-all duration-500',
                                    'bg-white/40 dark:bg-white/5 backdrop-blur-xl',
                                    'ring-1 ring-black/[0.04] dark:ring-white/[0.08]',
                                    'shadow-[0_8px_32px_rgba(0,0,0,0.04)]',
                                    Number(localStats?.streak ?? 0) > 0
                                        ? 'bg-gradient-to-br from-amber-50/50 via-white/40 to-white/40'
                                        : 'bg-gradient-to-br from-emerald-50/50 via-white/40 to-white/40'
                                )}
                            >
                                <div className="relative z-10">
                                    {Number(localStats?.streak ?? 0) <= 0 ? (
                                        <div className="flex flex-col items-start gap-4">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-emerald-100 text-3xl shadow-sm ring-4 ring-emerald-50 animate-bounce">
                                                🌱
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                                    Mulai Perjalanan Hari Ini
                                                </h2>
                                                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                                    Baca dan refleksikan 1 ayat untuk memulai ritme rohani Anda.
                                                </p>
                                            </div>
                                            <a
                                                href="/today"
                                                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-slate-800 active:scale-95 dark:bg-white dark:text-slate-900"
                                            >
                                                Baca Daily Verse
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-start gap-4">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-amber-100 text-3xl shadow-sm ring-4 ring-amber-50">
                                                🔥
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                                    {Number(localStats?.streak ?? 0)} Hari Berturut-turut
                                                </h2>
                                                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                                    Anda konsisten menjaga ritme refleksi harian. Luar biasa!
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* Subtle Background Aura */}
                                <div className={cn(
                                    "absolute -right-4 -top-8 h-32 w-32 rounded-full blur-3xl opacity-20",
                                    Number(localStats?.streak ?? 0) > 0 ? "bg-amber-400" : "bg-emerald-400"
                                )} />
                            </motion.div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                                <div className="group relative overflow-hidden rounded-[28px] bg-white/40 p-4 backdrop-blur-xl ring-1 ring-black/[0.04] transition-all hover:bg-white/60 dark:bg-white/5 dark:ring-white/[0.08]">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Aktivitas</p>
                                    <p className={cn(
                                        'mt-2 text-[11px] font-bold leading-tight transition-colors',
                                        Number(localStats?.growth_percent ?? 0) >= 0 ? 'text-emerald-600' : 'text-amber-600'
                                    )}>
                                        {Number(localStats?.growth_percent ?? 0) >= 0
                                            ? 'Naik dibanding minggu lalu'
                                            : 'Ritme melambat'}
                                    </p>
                                    <div className="absolute -bottom-2 -right-2 opacity-[0.05] grayscale group-hover:grayscale-0 group-hover:opacity-10 transition-all duration-500">
                                        <Globe className="h-12 w-12" />
                                    </div>
                                </div>

                                <div className="group relative overflow-hidden rounded-[28px] bg-white/40 p-4 backdrop-blur-xl ring-1 ring-black/[0.04] transition-all hover:bg-white/60 dark:bg-white/5 dark:ring-white/[0.08]">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Simpan</p>
                                    <p className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white">
                                        {Number(localStats?.total_saved ?? 0)} <span className="text-[10px] font-bold text-slate-400">Ayat</span>
                                    </p>
                                    <div className="absolute -bottom-2 -right-2 opacity-[0.05] transition-all duration-500 group-hover:opacity-10">
                                        <BookOpen className="h-12 w-12" />
                                    </div>
                                </div>

                                <div className="col-span-2 relative overflow-hidden rounded-[28px] bg-white/40 p-4 backdrop-blur-xl ring-1 ring-black/[0.04] dark:bg-white/5 dark:ring-white/[0.08]">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Target Minggu Ini</p>
                                        <span className="text-[10px] font-bold text-slate-900 dark:text-white">{Number(localStats?.this_week ?? 0)} / 7</span>
                                    </div>
                                    <div className="mt-3 overflow-hidden rounded-full bg-slate-100/50 h-2.5 dark:bg-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${weeklyProgress}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {localStats?.quote_of_week && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative overflow-hidden rounded-[32px] bg-white/40 p-6 backdrop-blur-xl ring-1 ring-black/[0.04] dark:bg-white/5 dark:ring-white/[0.08] shadow-sm"
                            >
                                <span className="absolute -left-1 -top-2 text-6xl text-slate-200/50 font-serif leading-none dark:text-white/5">“</span>
                                <div className="relative z-10">
                                    <p className="font-serif italic text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                                        {localStats.quote_of_week}
                                    </p>
                                    {localStats?.quote_ref && (
                                        <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            — {localStats.quote_ref}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {latestReadItem && (
                            <div className="flex items-center justify-between gap-4 rounded-[28px] bg-slate-900/5 p-4 backdrop-blur-md ring-1 ring-slate-900/5 dark:bg-white/5 dark:ring-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-slate-800">
                                        <BookOpen className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Terakhir</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{latestReadItem.book_label} {latestReadItem.chapter}:{latestReadItem.verse}</p>
                                    </div>
                                </div>
                                <a
                                    href={latestReadItem.chapter_href}
                                    className="inline-flex h-9 items-center rounded-full bg-white px-4 text-[11px] font-bold text-slate-900 shadow-sm ring-1 ring-black/5 active:scale-95 transition-all dark:bg-slate-800 dark:text-white dark:ring-white/10"
                                >
                                    Lanjut
                                </a>
                            </div>
                        )}

                        {/* Spiritual Insight Glass Pill */}
                        {spiritualInsight && (
                            <div className="rounded-[28px] bg-indigo-50/50 p-4 backdrop-blur-xl ring-1 ring-indigo-100/30 dark:bg-indigo-500/10 dark:ring-indigo-400/20">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 p-0.5">Insight</p>
                                <p className="mt-1 text-sm font-medium leading-relaxed text-slate-700 dark:text-indigo-200">{spiritualInsight}</p>
                            </div>
                        )}

                        <div
                            className={`${isDesktop ? '' : 'sticky z-20'} -mx-1 rounded-[32px] bg-white/40 p-1.5 backdrop-blur-2xl ring-1 ring-black/[0.04] dark:bg-white/5 dark:ring-white/[0.08] shadow-sm`}
                            style={{ top: isDesktop ? undefined : '12px' }}
                        >
                            <div className="flex p-1 gap-1">
                                {TABS.map((t) => {
                                    const isActive = activeTab === t.key;
                                    const total = localTotals[t.key as keyof typeof localTotals] ?? 0;
                                    return (
                                        <button
                                            key={t.key}
                                            type="button"
                                            onClick={() => {
                                                const v = t.key as ActivityProps['tab'];
                                                setActiveTab(v);
                                                submitFilters({ tab: v });
                                            }}
                                            className={cn(
                                                "relative flex flex-1 h-9 items-center justify-center rounded-2xl text-[11px] font-bold transition-all duration-300",
                                                isActive ? "text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                                            )}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute inset-0 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] rounded-2xl dark:bg-white/10"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            <span className="relative z-10">{t.label} <span className="opacity-50 font-medium">({total})</span></span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-1.5 flex items-center gap-2 p-1">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={isId ? "Cari kitab, pasal..." : "Search..."}
                                        className="h-10 w-full rounded-2xl border-none bg-slate-900/[0.04] pl-10 pr-4 text-[13px] font-medium placeholder:text-slate-400 outline-none ring-0 focus:ring-2 focus:ring-slate-900/5 dark:bg-white/5 dark:focus:ring-white/5"
                                    />
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowFilterPanel(true)}
                                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900/[0.04] dark:bg-white/5 text-slate-400 active:scale-95 transition-all"
                                >
                                    <Settings2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <ActivityListCard
                            loadingFilter={loadingFilter}
                            totalRows={totalRows}
                            localGroups={localGroups}
                            expanded={expanded}
                            setExpanded={setExpanded}
                            localPage={localPage}
                            loadingMore={loadingMore}
                            onLoadMore={onLoadMore}
                            onSaveNote={onSaveNote}
                            savingNoteId={savingNoteId}
                            onPublishQuote={onPublishQuote}
                            publishingQuoteId={publishingQuoteId}
                            activeTab={activeTab}
                            isId={isId}
                        />

                        {showFilterPanel ? (
                            <div className="fixed inset-0 z-50 flex items-end bg-black/35">
                                <button
                                    type="button"
                                    aria-label="Close filter panel"
                                    className="absolute inset-0"
                                    onClick={() => setShowFilterPanel(false)}
                                />
                                <div className="relative w-full rounded-t-3xl bg-surface p-4 shadow-soft ring-1 ring-black/10">
                                    <div className="mx-auto mb-3 h-1 w-14 rounded-full bg-surface-muted" />
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">Filter Activity</p>
                                        <button
                                            type="button"
                                            onClick={() => setShowFilterPanel(false)}
                                            className="rounded-full px-2 py-1 text-xs font-medium text-muted-foreground"
                                        >
                                            Tutup
                                        </button>
                                    </div>

                                    <div className="mt-3 space-y-3">
                                        <div>
                                            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Sort</p>
                                            <select
                                                value={sortMode}
                                                onChange={(e) => {
                                                    const v = e.target.value as ActivityProps['sort'];
                                                    setSortMode(v);
                                                    submitFilters({ sort: v });
                                                }}
                                                className="h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm outline-none focus:border-black/30"
                                            >
                                                <option value="recent">Recent</option>
                                                <option value="oldest">Oldest</option>
                                            </select>
                                        </div>
                                        <div>
                                            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Per Page</p>
                                            <select
                                                value={perPage}
                                                onChange={(e) => {
                                                    const v = Number(e.target.value) as ActivityProps['per_page'];
                                                    setPerPage(v);
                                                    submitFilters({ per_page: v });
                                                }}
                                                className="h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm outline-none focus:border-black/30"
                                            >
                                                <option value={20}>20/page</option>
                                                <option value={50}>50/page</option>
                                                <option value={100}>100/page</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between gap-2">
                                        <button
                                            type="button"
                                            onClick={resetFilters}
                                            className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-border/60 bg-background text-sm font-medium"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowFilterPanel(false)}
                                            className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-[#111111] text-sm font-semibold text-white"
                                        >
                                            Tutup
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </MobileAppLayout>
        </>
    );
}
