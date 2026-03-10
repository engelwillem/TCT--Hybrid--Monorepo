import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

type Quarter = {
    id: number;
    year: number;
    quarter: number;
    title?: string | null;
    start_date: string;
    end_date: string;
    is_active: boolean;
};

type Lesson = {
    id: number;
    quarter_id: number;
    lesson_number: number;
    title?: string | null;
    start_date: string;
    end_date: string;
};

type QuarterWithLessons = Quarter & {
    lessons: Lesson[];
};

type TodayTarget = {
    year: number;
    quarter: number;
    lesson_number: number;
    day_key: string;
    date: string;
} | null;

const STORAGE_KEY = 'tct:ss:last_reading';
const LAST_LESSON_KEY = 'tct:ss:last_lesson';

function formatQuarterLabel(q: Quarter) {
    return q.title ?? `Q${q.quarter} ${q.year}`;
}

function formatDateRange(startIso: string, endIso: string) {
    try {
        const fmt = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
        return `${fmt.format(new Date(startIso))} – ${fmt.format(new Date(endIso))}`;
    } catch {
        return `${startIso} – ${endIso}`;
    }
}

function compareQuarterDesc(a: Quarter, b: Quarter) {
    if (a.year !== b.year) return b.year - a.year;
    return b.quarter - a.quarter;
}

function safeParseJson<T>(raw: string | null): T | null {
    if (!raw) return null;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

type LastLesson = {
    year: number;
    quarter: number;
    lesson_number: number;
    ts?: number;
};

function toYmd(input: string) {
    // Accepts: YYYY-MM-DD, ISO string, etc.
    // Output: YYYY-MM-DD (best-effort)
    const s = String(input || '').trim();
    if (!s) return '';
    const m = s.match(/^\d{4}-\d{2}-\d{2}/);
    if (m) return m[0];
    try {
        // Fallback: parse as date
        const d = new Date(s);
        if (Number.isNaN(d.getTime())) return s;
        const y = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${mm}-${dd}`;
    } catch {
        return s;
    }
}

export default function QuarterIndex({
    quarters,
    activeQuarterId,
    activeQuarter,
    quartersWithLessons,
    todayTarget,
    ui,
}: {
    quarters: Quarter[];
    activeQuarterId?: number | null;
    activeQuarter?: Quarter | null;
    quartersWithLessons?: QuarterWithLessons[];
    todayTarget?: TodayTarget;
    ui?: { assets?: { sabbathCoverFallback?: string | null } };
}) {
    const coverFallback =
        ui?.assets?.sabbathCoverFallback ||
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop';

    const mergedQuarters = (quartersWithLessons && quartersWithLessons.length)
        ? quartersWithLessons
        : (quarters as unknown as QuarterWithLessons[]);

    const now = useMemo(() => new Date(), []);

    const currentQuarter = useMemo(() => {
        return (
            activeQuarter ??
            mergedQuarters.find((q) => q.is_active) ??
            [...mergedQuarters].sort(compareQuarterDesc)[0]
        );
    }, [activeQuarter, mergedQuarters]);

    const defaultQuarter =
        mergedQuarters.find((q) => q.id === activeQuarterId) ??
        (activeQuarterId ? mergedQuarters[0] : null) ??
        mergedQuarters[0];

    const [selectedQuarterId, setSelectedQuarterId] = useState<number>(defaultQuarter?.id ?? 0);
    const selectedQuarter = useMemo(
        () => mergedQuarters.find((q) => q.id === selectedQuarterId) ?? defaultQuarter,
        [mergedQuarters, selectedQuarterId],
    );

    type SeriesTab = 'current' | 'past' | 'upcoming';
    const [seriesTab, setSeriesTab] = useState<SeriesTab>('current');

    // Continue reading: prefer last opened (local), fallback to today's published day.
    const [continueHref, setContinueHref] = useState<string | null>(null);
    const [continueMeta, setContinueMeta] = useState<string>('');

    useEffect(() => {
        type LastReading = {
            year: number;
            quarter: number;
            lesson_number: number;
            day_key: string;
            date?: string;
        };

        const last = safeParseJson<LastReading>(
            typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null,
        );

        const target = todayTarget ?? last ?? null;
        if (!target) {
            setContinueHref(null);
            setContinueMeta('');
            return;
        }

        setContinueHref(
            `/channels/sabbath-school/${target.year}/q${target.quarter}/lesson/${target.lesson_number}/${target.day_key}`,
        );
        if (target.date) setContinueMeta(toYmd(String(target.date)));
        else if ((todayTarget as any)?.date) setContinueMeta(toYmd(String((todayTarget as any).date)));
    }, [todayTarget]);

    useEffect(() => {
        // pick a meaningful default tab based on selected quarter position in time
        if (!selectedQuarter) return;
        if (selectedQuarter.is_active) {
            setSeriesTab('current');
            return;
        }
        try {
            const start = new Date(selectedQuarter.start_date);
            const end = new Date(selectedQuarter.end_date);
            if (start > new Date()) setSeriesTab('upcoming');
            else if (end < new Date()) setSeriesTab('past');
        } catch {
            // ignore
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedQuarterId]);

    const { currentSeries, pastSeries, upcomingSeries } = useMemo(() => {
        const sorted = [...mergedQuarters].sort(compareQuarterDesc);
        const current = sorted.filter((q) => q.is_active);
        const past: QuarterWithLessons[] = [];
        const upcoming: QuarterWithLessons[] = [];

        sorted.forEach((q) => {
            if (q.is_active) return;
            try {
                const start = new Date(q.start_date);
                const end = new Date(q.end_date);
                if (start > now) upcoming.push(q);
                else if (end < now) past.push(q);
                else past.push(q); // fallback: treat as past-ish
            } catch {
                past.push(q);
            }
        });

        return {
            currentSeries: current.length ? current : sorted.slice(0, 1),
            pastSeries: past,
            upcomingSeries: upcoming,
        };
    }, [mergedQuarters, now]);

    const seriesList = useMemo(() => {
        if (seriesTab === 'past') return pastSeries;
        if (seriesTab === 'upcoming') return upcomingSeries;
        return currentSeries;
    }, [seriesTab, currentSeries, pastSeries, upcomingSeries]);

    type LastReading = {
        year: number;
        quarter: number;
        lesson_number: number;
        day_key: string;
        date?: string;
    };

    const lastReading = useMemo(() => {
        return safeParseJson<LastReading>(
            typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null,
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const lastLesson = useMemo(() => {
        return safeParseJson<LastLesson>(
            typeof window !== 'undefined'
                ? window.localStorage.getItem(LAST_LESSON_KEY)
                : null,
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const effectiveContinueHref =
        continueHref ??
        (currentQuarter
            ? `/channels/sabbath-school/${currentQuarter.year}/q${currentQuarter.quarter}/lesson/${(currentQuarter as any)?.lessons?.[0]?.lesson_number ?? 1}`
            : null);

    const lessons = selectedQuarter?.lessons ?? [];
    const lessonStates = useMemo(() => {
        // Determine ONE current lesson number.
        // Priority: last clicked lesson (same quarter) -> last reading (same quarter) -> current by date.
        const lastLessonNumber =
            lastLesson && selectedQuarter
                ? (lastLesson.year === selectedQuarter.year &&
                      lastLesson.quarter === selectedQuarter.quarter
                      ? lastLesson.lesson_number
                      : null)
                : null;

        const lastReadingLessonNumber =
            lastReading && selectedQuarter
                ? (lastReading.year === selectedQuarter.year &&
                      lastReading.quarter === selectedQuarter.quarter
                      ? lastReading.lesson_number
                      : null)
                : null;

        let currentByDateLessonNumber: number | null = null;
        try {
            const candidates = lessons
                .map((l) => {
                    const start = new Date(l.start_date);
                    const end = new Date(l.end_date);
                    const isInRange = start <= now && now <= end;
                    return { l, isInRange, start };
                })
                .filter((x) => x.isInRange)
                .sort((a, b) => a.start.getTime() - b.start.getTime());
            currentByDateLessonNumber = candidates[0]?.l.lesson_number ?? null;
        } catch {
            currentByDateLessonNumber = null;
        }

        const todayTargetLessonNumber =
            todayTarget && selectedQuarter
                ? (todayTarget.year === selectedQuarter.year &&
                      todayTarget.quarter === selectedQuarter.quarter
                      ? todayTarget.lesson_number
                      : null)
                : null;

        const effectiveCurrentLessonNumber =
            todayTargetLessonNumber ?? lastLessonNumber ?? lastReadingLessonNumber ?? currentByDateLessonNumber;

        return lessons.map((l) => {
            let locked = false;
            let completedByDate = false;
            let completed = false;
            let isCurrent = false;

            try {
                const start = new Date(l.start_date);
                const end = new Date(l.end_date);
                locked = start > now;
                completedByDate = end < now;
                completed = completedByDate;
                isCurrent = effectiveCurrentLessonNumber
                    ? l.lesson_number === effectiveCurrentLessonNumber
                    : (!locked && !completedByDate);
            } catch {
                // ignore
            }

            // If user picked a current lesson, it should never look locked.
            if (isCurrent) locked = false;

            // Prevent badge overlap: if it's considered current, don't also show Completed.
            // But keep a signal so Current can show a small checklist indicator.
            const showCurrentCheck = Boolean(isCurrent && completedByDate);
            if (isCurrent) completed = false;

            return {
                lesson: l,
                locked,
                completed,
                isCurrent,
                showCurrentCheck,
            };
        });
    }, [lessons, lastLesson, lastReading, now, selectedQuarter, todayTarget]);

    const completedCount = useMemo(() => {
        return lessonStates.filter((x) => x.completed).length;
    }, [lessonStates]);
    const [lessonView, setLessonView] = useState<'active' | 'archived'>('active');

    const filteredLessonStates = useMemo(() => {
        if (lessonView === 'archived') return lessonStates.filter((x) => x.completed);
        return lessonStates.filter((x) => !x.completed);
    }, [lessonStates, lessonView]);

    const progressPct = useMemo(() => {
        const total = lessonStates.length || 1;
        return Math.round((completedCount / total) * 100);
    }, [completedCount, lessonStates.length]);

    const [mobileLessonIndex, setMobileLessonIndex] = useState(0);
    const mobileTouchX = useRef<number | null>(null);

    useEffect(() => {
        const currentIndex = filteredLessonStates.findIndex((x) => x.isCurrent);
        setMobileLessonIndex(currentIndex >= 0 ? currentIndex : 0);
    }, [selectedQuarterId, filteredLessonStates]);

    const cycleLesson = (dir: -1 | 1) => {
        const total = filteredLessonStates.length;
        if (!total) return;
        setMobileLessonIndex((prev) => (prev + dir + total) % total);
    };

    const openLesson = (lessonNumber: number, locked: boolean) => {
        if (locked || !selectedQuarter) return;
        try {
            window.localStorage.setItem(
                LAST_LESSON_KEY,
                JSON.stringify({
                    year: selectedQuarter.year,
                    quarter: selectedQuarter.quarter,
                    lesson_number: lessonNumber,
                    ts: Date.now(),
                } satisfies LastLesson),
            );
        } catch {
            // ignore
        }
        window.location.assign(
            `/channels/sabbath-school/${selectedQuarter.year}/q${selectedQuarter.quarter}/lesson/${lessonNumber}`,
        );
    };

    return (
        <MobileAppLayout
            title="SabbathSchool"
            activeNavId="channels"
            backHref="/channels"
        >
            <div className="space-y-6">
                {/* HERO SECTION */}
                <section className="overflow-hidden rounded-3xl bg-surface shadow-soft">
                    <div className="relative">
                        <div className="h-40 w-full overflow-hidden sm:h-44 md:h-52">
                            <img
                                src={coverFallback}
                                alt="Sabbath School"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    'linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0.12))',
                            }}
                            aria-hidden
                        />

                        <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                {effectiveContinueHref ? (
                                    <Link
                                        href={effectiveContinueHref}
                                        prefetch="hover"
                                        cacheFor="1m"
                                        className="tct-pressable inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground shadow-soft"
                                    >
                                        Continue Study <ArrowRight className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 ring-1 ring-white/10">
                                        Not ready
                                    </span>
                                )}

                                {continueMeta ? (
                                    <span className="text-[12px] text-white/70">
                                        Last opened: {continueMeta}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </section>

                {/* QUARTER SECTION */}
                <section className="space-y-3">
                    <div className="flex items-end justify-between gap-3">
                        <div>
                            <p className="text-[16px] font-semibold leading-none">
                                Quarter Series
                            </p>
                            <p className="mt-1 text-[12px] text-muted-foreground">
                                Pick a series to study.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => setSeriesTab('current')}
                            className={cn(
                                'tct-pressable rounded-3xl bg-surface p-4 text-left shadow-soft ring-1 ring-black/5 dark:ring-white/10',
                                seriesTab === 'current' ? 'ring-2 ring-brand' : '',
                            )}
                        >
                            <p className="text-[12px] font-semibold">📖 Current</p>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                {currentSeries.length} quarter
                            </p>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSeriesTab('past')}
                            className={cn(
                                'tct-pressable rounded-3xl bg-surface p-4 text-left shadow-soft ring-1 ring-black/5 dark:ring-white/10',
                                seriesTab === 'past' ? 'ring-2 ring-brand' : '',
                            )}
                        >
                            <p className="text-[12px] font-semibold">🗂 Past</p>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                {pastSeries.length} quarter
                            </p>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSeriesTab('upcoming')}
                            className={cn(
                                'tct-pressable rounded-3xl bg-surface p-4 text-left shadow-soft ring-1 ring-black/5 dark:ring-white/10',
                                seriesTab === 'upcoming' ? 'ring-2 ring-brand' : '',
                            )}
                        >
                            <p className="text-[12px] font-semibold">🔮 Upcoming</p>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                {upcomingSeries.length} quarter
                            </p>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {seriesList.map((q) => {
                            const isSelected = q.id === selectedQuarterId;
                            return (
                                <button
                                    key={q.id}
                                    type="button"
                                    onClick={() => setSelectedQuarterId(q.id)}
                                    className={cn(
                                        'tct-pressable flex overflow-hidden rounded-3xl bg-surface shadow-soft ring-1 ring-black/5 dark:ring-white/10',
                                        isSelected ? 'ring-2 ring-brand' : '',
                                    )}
                                >
                                    <div className="h-24 w-28 flex-none overflow-hidden sm:h-28 sm:w-32">
                                        <img
                                            src={coverFallback}
                                            alt={formatQuarterLabel(q)}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1 p-4">
                                        <p className="mt-1 line-clamp-1 text-[15px] font-semibold leading-tight">
                                            {q.title ?? `Quarter ${q.quarter}`}
                                        </p>
                                        <p className="mt-1 text-[12px] text-muted-foreground">
                                            {formatDateRange(q.start_date, q.end_date)}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* LESSON GRID */}
                <section className="space-y-3 rounded-3xl bg-surface p-4 shadow-soft">
                    <div className="flex items-end justify-between gap-3">
                        <div>
                            <p className="text-[16px] font-semibold leading-none">
                                Lessons
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                            <Sparkles className="h-4 w-4" />
                            <span className="tabular-nums">
                                {completedCount}/{lessonStates.length || 0} completed
                            </span>
                        </div>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted ring-1 ring-black/5 dark:ring-white/10">
                        <div
                            className="h-full rounded-full bg-brand transition-all"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>

                    <div className="inline-flex rounded-full bg-surface-muted p-1 ring-1 ring-black/5 dark:ring-white/10">
                        <button
                            type="button"
                            onClick={() => setLessonView('active')}
                            className={cn(
                                'rounded-full px-3 py-1.5 text-[11px] font-semibold transition',
                                lessonView === 'active'
                                    ? 'bg-foreground text-background'
                                    : 'text-muted-foreground',
                            )}
                        >
                            Active ({lessonStates.filter((x) => !x.completed).length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setLessonView('archived')}
                            className={cn(
                                'rounded-full px-3 py-1.5 text-[11px] font-semibold transition',
                                lessonView === 'archived'
                                    ? 'bg-foreground text-background'
                                    : 'text-muted-foreground',
                            )}
                        >
                            Archived ({completedCount})
                        </button>
                    </div>

                    <div className="space-y-3 md:hidden">
                        <div className="flex items-center justify-between gap-2">
                            <button
                                type="button"
                                onClick={() => cycleLesson(-1)}
                                className="tct-pressable inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted ring-1 ring-black/5 dark:ring-white/10"
                                aria-label="Previous lesson"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <p className="text-[12px] font-semibold text-muted-foreground">
                                Lesson {Math.min(mobileLessonIndex + 1, filteredLessonStates.length || 1)} / {filteredLessonStates.length || 0}
                            </p>
                            <button
                                type="button"
                                onClick={() => cycleLesson(1)}
                                className="tct-pressable inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted ring-1 ring-black/5 dark:ring-white/10"
                                aria-label="Next lesson"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                        {filteredLessonStates.length ? (
                            <>
                                <div
                                    className="overflow-hidden"
                                    onTouchStart={(e) => {
                                        mobileTouchX.current = e.touches?.[0]?.clientX ?? null;
                                    }}
                                    onTouchEnd={(e) => {
                                        const start = mobileTouchX.current;
                                        const end = e.changedTouches?.[0]?.clientX ?? null;
                                        if (start == null || end == null) return;
                                        const dx = end - start;
                                        if (Math.abs(dx) < 36) return;
                                        cycleLesson(dx < 0 ? 1 : -1);
                                    }}
                                >
                                    <div
                                        className="flex transition-transform duration-300 ease-out"
                                        style={{
                                            transform: `translateX(-${mobileLessonIndex * 100}%)`,
                                        }}
                                    >
                                        {filteredLessonStates.map(({ lesson, locked, completed, isCurrent, showCurrentCheck }) => (
                                            <div key={lesson.id} className="w-full shrink-0 px-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => openLesson(lesson.lesson_number, locked)}
                                                    className={cn(
                                                        'relative w-full overflow-hidden rounded-3xl bg-surface-muted p-4 text-left shadow-soft ring-1 ring-black/5 transition dark:ring-white/10',
                                                        isCurrent ? 'ring-2 ring-brand' : '',
                                                        locked ? 'opacity-60' : 'tct-pressable',
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <p className="flex items-center gap-1 text-[26px] font-semibold leading-none tabular-nums">
                                                                <span>{lesson.lesson_number}</span>
                                                                {completed || showCurrentCheck ? (
                                                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                                                ) : null}
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1">
                                                            {isCurrent ? (
                                                                <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-brand-foreground">
                                                                    Current
                                                                </span>
                                                            ) : null}
                                                            {locked ? (
                                                                <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold text-muted-foreground ring-1 ring-black/5 dark:ring-white/10">
                                                                    Locked
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                    <p className="mt-3 line-clamp-2 text-[15px] font-semibold leading-snug">
                                                        {lesson.title ?? 'Untitled'}
                                                    </p>
                                                    <p className="mt-1 line-clamp-1 text-[12px] text-muted-foreground">
                                                        {formatDateRange(lesson.start_date, lesson.end_date)}
                                                    </p>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-1.5">
                                    {filteredLessonStates.map((_, idx) => (
                                        <button
                                            key={`dot-${idx}`}
                                            type="button"
                                            onClick={() => setMobileLessonIndex(idx)}
                                            aria-label={`Go to lesson ${idx + 1}`}
                                            className={cn(
                                                'h-1.5 rounded-full transition-all',
                                                idx === mobileLessonIndex ? 'w-5 bg-brand' : 'w-1.5 bg-muted-foreground/40',
                                            )}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : null}
                    </div>

                    <div className="hidden gap-3 pb-1 md:grid md:grid-cols-3 md:gap-4 xl:grid-cols-4">
                        {filteredLessonStates.map(
                            ({ lesson, locked, completed, isCurrent, showCurrentCheck }) => {
                            const href = selectedQuarter
                                ? `/channels/sabbath-school/${selectedQuarter.year}/q${selectedQuarter.quarter}/lesson/${lesson.lesson_number}`
                                : '#';

                            const Card = locked ? 'div' : Link;
                            const cardProps = locked
                                ? {}
                                : ({ href, prefetch: 'hover', cacheFor: '1m' } as unknown as { href: string });

                            return (
                                <Card
                                    key={lesson.id}
                                    {...cardProps}
                                    className={cn(
                                        'relative min-w-[84%] snap-start overflow-hidden rounded-3xl bg-surface-muted p-4 shadow-soft ring-1 ring-black/5 transition hover:bg-surface sm:min-w-[52%] md:min-w-0 md:p-4 dark:ring-white/10',
                                        isCurrent ? 'ring-2 ring-brand' : '',
                                        locked ? 'opacity-60' : 'tct-pressable',
                                    )}
                                    aria-disabled={locked}
                                    onClick={() => {
                                        if (locked || !selectedQuarter) return;
                                        try {
                                            window.localStorage.setItem(
                                                LAST_LESSON_KEY,
                                                JSON.stringify({
                                                    year: selectedQuarter.year,
                                                    quarter: selectedQuarter.quarter,
                                                    lesson_number: lesson.lesson_number,
                                                    ts: Date.now(),
                                                } satisfies LastLesson),
                                            );
                                        } catch {
                                            // ignore
                                        }
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="flex items-center gap-1 text-[22px] font-semibold leading-none tabular-nums">
                                                <span>{lesson.lesson_number}</span>
                                                {/*
                                                    Completed indicator:
                                                    Use icon next to big number (no "Completed" text badge)
                                                    to avoid UI overlap with the Current badge.
                                                */}
                                                {completed || showCurrentCheck ? (
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                                ) : null}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">

                                            {isCurrent ? (
                                                <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-brand-foreground">
                                                    Current
                                                </span>
                                            ) : null}

                                            {locked ? (
                                                <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold text-muted-foreground ring-1 ring-black/5 dark:ring-white/10">
                                                    Locked
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                    <p className="mt-3 line-clamp-2 text-[14px] font-semibold leading-snug md:text-[13px]">
                                        {lesson.title ?? 'Untitled'}
                                    </p>
                                    <p className="mt-1 line-clamp-1 text-[12px] text-muted-foreground md:text-[11px]">
                                        {formatDateRange(lesson.start_date, lesson.end_date)}
                                    </p>
                                </Card>
                            );
                        },
                        )}
                    </div>
                </section>
            </div>
        </MobileAppLayout>
    );
}
