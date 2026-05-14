import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { Button } from '@/Components/ui/button';
import { Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, CircleCheckBig, LayoutGrid, MoveRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Channel = {
    id: number;
    slug: string;
    title: string;
    description?: string | null;
    cover_image_url?: string | null;
    type: string;
    members_count?: number;
    is_joined?: boolean;
};

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
    lesson_number: number;
    title?: string | null;
    start_date: string;
    end_date: string;
};

type QuarterWithLessons = Quarter & { lessons: Lesson[] };
type TodayTarget = { year: number; quarter: number; lesson_number: number; day_key: string; date: string } | null;

type SabbathPayload = {
    channel?: Channel | null;
    activeQuarterId?: number | null;
    activeQuarter?: Quarter | null;
    quartersWithLessons?: QuarterWithLessons[];
    todayTarget?: TodayTarget;
};

const STORAGE_KEY = 'tct:ss:last_reading';
const LAST_LESSON_KEY = 'tct:ss:last_lesson';
const GUEST_CHANNEL_PREF_KEY = 'tct:guest:channel-membership';

function normalizeDescription(description?: string | null) {
    if (!description) return null;
    const trimmed = description.trim();
    const hidden = new Set([
        'Bacaan Persembahan',
        'Berita Misi',
        'Pelajaran RumahTangga',
        'Daily Verse post channel.',
        'Daily Verse post channel',
        '(admin post).',
        'Pelajaran 1-13',
    ]);
    if (hidden.has(trimmed)) return null;
    return trimmed;
}

function formatDateRange(startIso?: string | null, endIso?: string | null) {
    if (!startIso || !endIso) return null;
    try {
        const fmt = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        return `${fmt.format(new Date(startIso))} - ${fmt.format(new Date(endIso))}`;
    } catch {
        return `${startIso} - ${endIso}`;
    }
}

function safeParseJson<T>(raw: string | null): T | null {
    if (!raw) return null;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

function byQuarterDesc(a: Quarter, b: Quarter) {
    if (a.year !== b.year) return b.year - a.year;
    return b.quarter - a.quarter;
}

export default function ChannelsIndex({
    channels,
    sabbathSchool,
    ui,
}: {
    channels: Channel[];
    sabbathSchool?: SabbathPayload;
    ui?: { assets?: { channelsCoverFallback?: string | null } };
}) {
    const page = usePage();
    const isAuthenticated = Boolean((page.props as any)?.auth?.user);
    const coverFallback = ui?.assets?.channelsCoverFallback || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop';
    const sabbathCover = sabbathSchool?.channel?.cover_image_url ?? coverFallback;
    const todayTarget = sabbathSchool?.todayTarget ?? null;
    const quarters = Array.isArray(sabbathSchool?.quartersWithLessons) ? sabbathSchool!.quartersWithLessons! : [];

    const [seriesTab, setSeriesTab] = useState<'current' | 'past' | 'upcoming'>('current');
    const [lessonView, setLessonView] = useState<'active' | 'archived'>('active');
    const [selectedQuarterId, setSelectedQuarterId] = useState<number>(sabbathSchool?.activeQuarterId ?? (quarters[0]?.id ?? 0));
    const [continueHref, setContinueHref] = useState<string | null>(null);
    const [heroLoaded, setHeroLoaded] = useState(false);
    const [heroOverlayAlpha, setHeroOverlayAlpha] = useState(0.52);
    const [loadedBySlug, setLoadedBySlug] = useState<Record<string, boolean>>({});
    const [overlayBySlug, setOverlayBySlug] = useState<Record<string, number>>({});
    const [joinedBySlug, setJoinedBySlug] = useState<Record<string, boolean>>(
        Object.fromEntries(channels.map((c) => [c.slug, Boolean(c.is_joined)])),
    );
    const [memberCountBySlug, setMemberCountBySlug] = useState<Record<string, number>>(
        Object.fromEntries(channels.map((c) => [c.slug, Number(c.members_count ?? 0)])),
    );

    useEffect(() => {
        if (isAuthenticated || typeof window === 'undefined') return;
        try {
            const raw = window.localStorage.getItem(GUEST_CHANNEL_PREF_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw) as Record<string, boolean>;
            if (!parsed || typeof parsed !== 'object') return;
            setJoinedBySlug((prev) => ({ ...prev, ...parsed }));
        } catch {
            // ignore
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated || typeof window === 'undefined') return;
        try {
            window.localStorage.setItem(GUEST_CHANNEL_PREF_KEY, JSON.stringify(joinedBySlug));
        } catch {
            // ignore
        }
    }, [isAuthenticated, joinedBySlug]);

    const selectedQuarter = useMemo<QuarterWithLessons | null>(() => {
        const fromList = quarters.find((q) => q.id === selectedQuarterId) ?? quarters[0] ?? null;
        if (fromList) return fromList;
        if (sabbathSchool?.activeQuarter) {
            return {
                ...sabbathSchool.activeQuarter,
                lessons: [],
            };
        }
        return null;
    }, [quarters, sabbathSchool?.activeQuarter, selectedQuarterId]);
    const now = useMemo(() => new Date(), []);
    const prefersReducedMotion = useMemo(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }, []);

    const triggerHaptic = useCallback(() => {
        if (prefersReducedMotion) return;
        if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
        if (!/android/i.test(navigator.userAgent || '')) return;
        try {
            navigator.vibrate(8);
        } catch {
            // ignore
        }
    }, [prefersReducedMotion]);

    const toggleMembership = useCallback((channel: Channel) => {
        const wasJoined = Boolean(joinedBySlug[channel.slug]);
        const previousCount = Number(memberCountBySlug[channel.slug] ?? 0);
        setJoinedBySlug((prev) => ({ ...prev, [channel.slug]: !wasJoined }));
        setMemberCountBySlug((prev) => ({
            ...prev,
            [channel.slug]: Math.max(0, Number(prev[channel.slug] ?? 0) + (wasJoined ? -1 : 1)),
        }));

        if (!isAuthenticated) return;

        router.post(`/channels/${channel.id}/membership`, {}, {
            preserveScroll: true,
            preserveState: true,
            onError: () => {
                setJoinedBySlug((prev) => ({ ...prev, [channel.slug]: wasJoined }));
                setMemberCountBySlug((prev) => ({
                    ...prev,
                    [channel.slug]: previousCount,
                }));
            },
        });
    }, [isAuthenticated, joinedBySlug, memberCountBySlug]);

    const inferOverlayAlpha = useCallback((img: HTMLImageElement): number => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 28;
            canvas.height = 28;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return 0.52;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let luminanceSum = 0;
            let pixels = 0;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];
                if (a < 10) continue;
                luminanceSum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
                pixels += 1;
            }
            if (pixels < 1) return 0.52;
            const avg = luminanceSum / pixels;
            if (avg > 175) return 0.66;
            if (avg > 145) return 0.58;
            if (avg > 115) return 0.5;
            if (avg > 90) return 0.42;
            return 0.36;
        } catch {
            return 0.52;
        }
    }, []);

    useEffect(() => {
        const last = safeParseJson<{ year: number; quarter: number; lesson_number: number; day_key: string }>(
            typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null,
        );
        const target = todayTarget ?? last ?? null;
        if (!target) return;
        setContinueHref(`/channels/sabbath-school/${target.year}/q${target.quarter}/lesson/${target.lesson_number}/${target.day_key}`);
    }, [todayTarget]);

    const { currentSeries, pastSeries, upcomingSeries } = useMemo(() => {
        const sorted = [...quarters].sort(byQuarterDesc);
        const current = sorted.filter((q) => q.is_active);
        const past: QuarterWithLessons[] = [];
        const upcoming: QuarterWithLessons[] = [];
        sorted.forEach((q) => {
            if (q.is_active) return;
            const start = new Date(q.start_date);
            const end = new Date(q.end_date);
            if (start > now) upcoming.push(q);
            else if (end < now) past.push(q);
            else past.push(q);
        });
        return { currentSeries: current.length ? current : sorted.slice(0, 1), pastSeries: past, upcomingSeries: upcoming };
    }, [now, quarters]);

    const seriesList = seriesTab === 'past' ? pastSeries : seriesTab === 'upcoming' ? upcomingSeries : currentSeries;
    const lessons = selectedQuarter?.lessons ?? [];

    const lastLesson = useMemo(
        () => safeParseJson<{ year: number; quarter: number; lesson_number: number }>(
            typeof window !== 'undefined' ? window.localStorage.getItem(LAST_LESSON_KEY) : null,
        ),
        [],
    );

    const lessonStates = useMemo(() => {
        const currentNo = todayTarget && selectedQuarter && todayTarget.year === selectedQuarter.year && todayTarget.quarter === selectedQuarter.quarter
            ? todayTarget.lesson_number
            : (
                lastLesson && selectedQuarter && lastLesson.year === selectedQuarter.year && lastLesson.quarter === selectedQuarter.quarter
                    ? lastLesson.lesson_number
                    : null
            );
        return lessons.map((lesson: Lesson) => {
            const start = new Date(lesson.start_date);
            const end = new Date(lesson.end_date);
            const locked = start > now;
            const completed = end < now && lesson.lesson_number !== currentNo;
            const isCurrent = currentNo ? lesson.lesson_number === currentNo : !locked && !completed;
            return { lesson, locked, completed, isCurrent };
        });
    }, [lastLesson, lessons, now, selectedQuarter, todayTarget]);

    const completedCount = lessonStates.filter((x: { completed: boolean }) => x.completed).length;
    const progressPct = Math.round((completedCount / Math.max(lessonStates.length, 1)) * 100);
    const filteredLessons = lessonView === 'archived'
        ? lessonStates.filter((x: { completed: boolean }) => x.completed)
        : lessonStates.filter((x: { completed: boolean }) => !x.completed);

    const effectiveContinueHref =
        continueHref ??
        (selectedQuarter && selectedQuarter.lessons.length
            ? `/channels/sabbath-school/${selectedQuarter.year}/q${selectedQuarter.quarter}/lesson/${selectedQuarter.lessons[0].lesson_number}`
            : '/channels');

    return (
        <MobileAppLayout title="Channels" activeNavId="channels" backHref={isAuthenticated ? '/today' : '/'}>
            <div className="space-y-6">
                <motion.section id="sabbath-school" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }} className="overflow-hidden rounded-[28px] bg-surface shadow-soft ring-1 ring-black/5 dark:ring-white/10">
                    <div className="relative h-44 md:h-52">
                        {!heroLoaded ? (
                            <div className="absolute inset-0 tct-shimmer bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />
                        ) : null}
                        <img
                            src={sabbathCover}
                            alt="SabbathSchool"
                            className={`h-full w-full object-cover transition-opacity duration-300 ${heroLoaded ? 'opacity-100' : 'opacity-0'}`}
                            onLoad={(e) => {
                                setHeroLoaded(true);
                                setHeroOverlayAlpha(inferOverlayAlpha(e.currentTarget));
                            }}
                        />
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `linear-gradient(to top, rgba(0,0,0,${heroOverlayAlpha}), rgba(0,0,0,${Math.max(0.16, heroOverlayAlpha - 0.18)}), rgba(0,0,0,0.12))`,
                            }}
                        />
                        <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90 ring-1 ring-white/15 backdrop-blur">
                                SabbathSchool
                            </div>
                            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white md:text-2xl">{selectedQuarter?.title ?? 'Quarter Study'}</h2>
                            {selectedQuarter ? <p className="mt-1 text-xs text-white/85">{formatDateRange(selectedQuarter.start_date, selectedQuarter.end_date)}</p> : null}
                        </div>
                    </div>

                    <div className="space-y-4 p-4 md:p-5">
                        <Button asChild className="h-12 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 active:scale-[0.98] transition-all">
                            <Link href={effectiveContinueHref} onClick={triggerHaptic}>
                                <span className="inline-flex items-center gap-2">Lanjutkan Pelajaran <MoveRight className="h-4 w-4" strokeWidth={2.5} /></span>
                            </Link>
                        </Button>
                        {/* Series tab bar */}
                        <div className="inline-flex w-full overflow-hidden rounded-2xl bg-surface-muted p-1 ring-1 ring-black/5 dark:ring-white/8">
                            {(['current', 'past', 'upcoming'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setSeriesTab(tab)}
                                    className={`flex-1 rounded-xl py-2 text-xs font-semibold capitalize transition-all ${seriesTab === tab
                                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {tab === 'current' ? 'Aktif' : tab === 'past' ? 'Lalu' : 'Mendatang'}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            {seriesList.map((q) => (
                                <button key={q.id} type="button" onClick={() => setSelectedQuarterId(q.id)} className={`rounded-2xl bg-surface-muted px-3 py-3 text-left ring-1 ring-black/5 dark:ring-white/10 ${selectedQuarter?.id === q.id ? 'ring-2 ring-brand' : ''}`}>
                                    <p className="text-sm font-semibold">{q.title ?? `Q${q.quarter} ${q.year}`}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{formatDateRange(q.start_date, q.end_date)}</p>
                                </button>
                            ))}
                        </div>
                        <section className="space-y-3 rounded-2xl bg-surface-muted p-3 ring-1 ring-black/5 dark:ring-white/10">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">Lessons</p>
                                <p className="text-xs text-muted-foreground">{completedCount}/{lessonStates.length || 0} completed</p>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-white/60 dark:bg-black/20"><div className="h-full rounded-full bg-brand" style={{ width: `${progressPct}%` }} /></div>
                            <div className="inline-flex rounded-full bg-white/70 p-1 dark:bg-black/20">
                                <button type="button" onClick={() => setLessonView('active')} className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${lessonView === 'active' ? 'bg-slate-900 text-white' : 'text-muted-foreground'}`}>Active ({lessonStates.filter((x: { completed: boolean }) => !x.completed).length})</button>
                                <button type="button" onClick={() => setLessonView('archived')} className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${lessonView === 'archived' ? 'bg-slate-900 text-white' : 'text-muted-foreground'}`}>Archived ({completedCount})</button>
                            </div>
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                {filteredLessons.map(({ lesson, locked, completed, isCurrent }: { lesson: Lesson; locked: boolean; completed: boolean; isCurrent: boolean }) => (
                                    <button
                                        key={lesson.id}
                                        type="button"
                                        onClick={() => {
                                            if (locked || !selectedQuarter) return;
                                            triggerHaptic();
                                            try {
                                                window.localStorage.setItem(LAST_LESSON_KEY, JSON.stringify({ year: selectedQuarter.year, quarter: selectedQuarter.quarter, lesson_number: lesson.lesson_number, ts: Date.now() }));
                                            } catch {
                                                // ignore
                                            }
                                            window.location.assign(`/channels/sabbath-school/${selectedQuarter.year}/q${selectedQuarter.quarter}/lesson/${lesson.lesson_number}`);
                                        }}
                                        className={`rounded-2xl bg-white px-3 py-3 text-left ring-1 ring-black/5 transition-shadow dark:bg-slate-900 dark:ring-white/10 ${locked ? 'opacity-55' : 'hover:ring-brand/40'} ${isCurrent ? 'ring-2 ring-brand shadow-sm shadow-brand/10' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            {/* Lesson number + status badge */}
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Lesson {lesson.lesson_number}</span>
                                                {completed && <CircleCheckBig className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2.5} />}
                                            </div>
                                            {isCurrent ? (
                                                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">Aktif</span>
                                            ) : locked ? (
                                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400 dark:bg-white/8">🔒 Terkunci</span>
                                            ) : null}
                                        </div>
                                        {/* Title is now the primary text */}
                                        <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug">{lesson.title ?? 'Untitled'}</p>
                                        <p className="mt-1 text-[11px] text-muted-foreground">{formatDateRange(lesson.start_date, lesson.end_date)}</p>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>
                </motion.section>

                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42, delay: 0.06, ease: 'easeOut' }} className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-base font-bold tracking-tight">Channel Lainnya</h3>
                            <p className="mt-0.5 text-xs text-muted-foreground">Bergabung dan ikuti kanal yang sesuai perjalananmu</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-bold text-cyan-600 ring-1 ring-cyan-200/60 dark:bg-cyan-950/30 dark:text-cyan-400 dark:ring-cyan-500/20">
                            <LayoutGrid className="h-3 w-3" strokeWidth={2.5} />{channels.length} kanal
                        </span>
                    </div>
                    <div className="grid h-[calc(100svh-340px)] grid-cols-2 auto-rows-fr gap-3 sm:h-auto sm:grid-cols-2 sm:gap-4 md:[grid-template-columns:repeat(auto-fit,minmax(260px,1fr))] md:auto-rows-[320px] md:gap-6">
                        {channels.map((channel) => (
                            <div key={channel.slug} className="group flex h-full flex-col overflow-hidden rounded-[26px] bg-surface shadow-soft ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-card dark:ring-white/10">
                                <Link href={`/channels/${channel.slug}`} prefetch="hover" cacheFor="1m" onClick={triggerHaptic} className="contents">
                                    <div className="relative h-[55%] w-full flex-none overflow-hidden md:h-[62%]">
                                        {!loadedBySlug[channel.slug] ? (
                                            <div className="absolute inset-0 tct-shimmer bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />
                                        ) : null}
                                        <img
                                            src={channel.cover_image_url ?? coverFallback}
                                            alt={channel.title}
                                            className={`h-full w-full object-cover transition-[transform,opacity] duration-300 ease-out group-hover:scale-[1.03] ${loadedBySlug[channel.slug] ? 'opacity-100' : 'opacity-0'}`}
                                            onLoad={(e) => {
                                                setLoadedBySlug((prev) => ({ ...prev, [channel.slug]: true }));
                                                setOverlayBySlug((prev) => ({ ...prev, [channel.slug]: inferOverlayAlpha(e.currentTarget) }));
                                            }}
                                        />
                                        <div
                                            className="pointer-events-none absolute inset-0"
                                            style={{
                                                backgroundImage: `linear-gradient(to top, rgba(0,0,0,${Math.max(0.18, (overlayBySlug[channel.slug] ?? 0.44) - 0.18)}), rgba(0,0,0,0.03))`,
                                            }}
                                        />
                                    </div>
                                    <div className="min-h-0 flex-1 p-3 md:p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="line-clamp-1 text-sm font-bold leading-tight tracking-tight md:text-base">{channel.title}</p>
                                            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-cyan-500" strokeWidth={2.5} />
                                        </div>
                                        {normalizeDescription(channel.description) ? (
                                            <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground md:text-sm">{normalizeDescription(channel.description)}</p>
                                        ) : null}
                                        {/* Only show member count if > 0 */}
                                        {(memberCountBySlug[channel.slug] ?? 0) > 0 && (
                                            <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                                {memberCountBySlug[channel.slug]} anggota
                                            </div>
                                        )}
                                    </div>
                                </Link>
                                <div className="hidden px-3 pb-3 md:px-4 md:pb-4">
                                    <button
                                        type="button"
                                        onClick={() => toggleMembership(channel)}
                                        className={`w-full rounded-xl px-3 py-2.5 text-xs font-bold transition-all active:scale-[0.97] ${joinedBySlug[channel.slug]
                                            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                                            : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-sm shadow-cyan-500/20 hover:opacity-90'
                                            }`}
                                    >
                                        {joinedBySlug[channel.slug] ? '✓ Bergabung' : 'Ikuti Kanal'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.section>
            </div>
        </MobileAppLayout>
    );
}
