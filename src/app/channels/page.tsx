"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, ChevronRight, Clock3, MoveRight, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getAppAccessToken } from '@/services/app-auth-token';

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

type Lesson = {
    id: number;
    lesson_number: number;
    title?: string | null;
    start_date: string;
    end_date: string;
};

type QuarterWithLessons = {
    id: number;
    year: number;
    quarter: number;
    title?: string | null;
    start_date: string;
    end_date: string;
    is_active: boolean;
    lessons: Lesson[];
};

type TodayTarget = {
    year: number;
    quarter: number;
    lesson_number: number;
    day_key: string;
    date: string;
} | null;

type SabbathPayload = {
    channel?: Channel | null;
    activeQuarterId?: number | null;
    quartersWithLessons?: QuarterWithLessons[];
    todayTarget?: TodayTarget;
};

const shortDate = (value?: string | null): string => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function ChannelsPage() {
    const router = useRouter();
    const [channels, setChannels] = useState<Channel[]>([]);
    const [sabbathSchool, setSabbathSchool] = useState<SabbathPayload | null>(null);
    const [selectedQuarterId, setSelectedQuarterId] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isActive = true;
        const load = async () => {
            try {
                const token = getAppAccessToken();
                const response = await fetch('/api/channels', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    cache: 'no-store',
                });
                if (!response.ok) return;

                const payload = await response.json();
                if (!isActive) return;

                setChannels(Array.isArray(payload.channels) ? payload.channels : []);
                setSabbathSchool(payload.sabbathSchool ?? null);
                setSelectedQuarterId(payload.sabbathSchool?.activeQuarterId ?? 0);
            } catch {
                // Keep UI stable when API is unreachable.
            } finally {
                if (isActive) setLoading(false);
            }
        };

        load();
        return () => {
            isActive = false;
        };
    }, []);

    const handleMembershipToggle = async (channelSlug: string) => {
        const token = getAppAccessToken();
        if (!token) return;

        try {
            const response = await fetch(`/api/channels/${channelSlug}/membership`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) return;

            const payload = await response.json();
            setChannels(prev => prev.map(channel => {
                if (channel.slug !== channelSlug) return channel;
                return {
                    ...channel,
                    is_joined: Boolean(payload.is_joined),
                    members_count: typeof payload.members_count === 'number' ? payload.members_count : channel.members_count,
                };
            }));
        } catch {
            // Keep UI responsive on transient network errors.
        }
    };

    const quarters = sabbathSchool?.quartersWithLessons ?? [];
    const selectedQuarter = useMemo(
        () => quarters.find(item => item.id === selectedQuarterId) ?? quarters[0] ?? null,
        [quarters, selectedQuarterId],
    );

    const lessonCount = selectedQuarter?.lessons?.length ?? 0;
    const currentLessonNumber = sabbathSchool?.todayTarget?.lesson_number ?? 0;
    const completedLessons = selectedQuarter?.lessons
        ?.filter(item => item.lesson_number < currentLessonNumber)
        ?.length ?? 0;
    const progressWidth = lessonCount > 0 ? `${Math.round((completedLessons / lessonCount) * 100)}%` : '0%';

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f8fa] px-4 py-10">
                <div className="mx-auto max-w-2xl space-y-4">
                    <div className="h-12 rounded-2xl bg-slate-200/70 animate-pulse" />
                    <div className="h-60 rounded-3xl bg-slate-200/70 animate-pulse" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-40 rounded-3xl bg-slate-200/70 animate-pulse" />
                        <div className="h-40 rounded-3xl bg-slate-200/70 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7f8fa] text-slate-900 pb-24">
            <header className="sticky top-0 z-40 bg-[#f7f8fa]/90 backdrop-blur-md border-b border-slate-200/70">
                <div className="mx-auto max-w-2xl px-4 py-4">
                    <h1 className="text-lg font-bold tracking-tight">Channels</h1>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">
                <section className="overflow-hidden rounded-[30px] bg-white ring-1 ring-black/[0.05] shadow-sm">
                    <div className="relative h-48">
                        <img
                            src={sabbathSchool?.channel?.cover_image_url ?? 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=800'}
                            alt="Sabbath School"
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-5">
                            <p className="inline-flex rounded-full bg-white/20 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                                Sabbath School
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-white">{selectedQuarter?.title ?? 'Quarter Study'}</h2>
                            <p className="mt-1 text-xs font-semibold text-white/80">
                                {shortDate(selectedQuarter?.start_date)} - {shortDate(selectedQuarter?.end_date)}
                            </p>
                        </div>
                    </div>

                    <div className="p-5 space-y-4">
                        <Button
                            className="h-12 w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
                            onClick={() => {
                                if (!sabbathSchool?.todayTarget) return;
                                const target = sabbathSchool.todayTarget;
                                router.push(`/channels/sabbath-school/${target.year}/q${target.quarter}/lesson/${target.lesson_number}/${target.day_key}`);
                            }}
                        >
                            Lanjutkan Pelajaran
                            <MoveRight className="ml-2 h-4 w-4" />
                        </Button>

                        {quarters.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {quarters.map(quarter => (
                                    <button
                                        key={quarter.id}
                                        type="button"
                                        onClick={() => setSelectedQuarterId(quarter.id)}
                                        className={cn(
                                            'shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold ring-1 transition-colors',
                                            selectedQuarterId === quarter.id
                                                ? 'bg-slate-900 text-white ring-slate-900'
                                                : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50',
                                        )}
                                    >
                                        Q{quarter.quarter} {quarter.year}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="rounded-2xl border border-slate-200 p-4 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-slate-700">Progress lesson quarter ini</span>
                                <span className="text-slate-500">{completedLessons}/{lessonCount}</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full bg-slate-900 transition-all" style={{ width: progressWidth }} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            {(selectedQuarter?.lessons ?? []).slice(0, 5).map(lesson => (
                                <button
                                    key={lesson.id}
                                    type="button"
                                    onClick={() => router.push(`/channels/sabbath-school/${selectedQuarter?.year}/q${selectedQuarter?.quarter}/lesson/${lesson.lesson_number}`)}
                                    className="flex items-start justify-between rounded-2xl bg-slate-50 px-4 py-3 text-left hover:bg-slate-100 transition-colors"
                                >
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lesson {lesson.lesson_number}</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-800">{lesson.title ?? 'Untitled lesson'}</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-400 mt-1" />
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Channel Lainnya</h3>
                        <span className="text-[11px] font-bold text-slate-500">{channels.length} channels</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {channels.map(channel => (
                            <article key={channel.slug} className="rounded-[26px] bg-white ring-1 ring-black/[0.05] overflow-hidden shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => router.push(`/channels/${channel.slug}`)}
                                    className="w-full text-left"
                                >
                                    <div className="h-28 w-full overflow-hidden">
                                        <img
                                            src={channel.cover_image_url ?? 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800'}
                                            alt={channel.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <p className="text-sm font-bold tracking-tight">{channel.title}</p>
                                        <p className="text-xs text-slate-500 line-clamp-2 min-h-8">{channel.description ?? 'Weekly devotion channel.'}</p>
                                    </div>
                                </button>
                                <div className="px-4 pb-4 flex items-center justify-between">
                                    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                                        <Users className="h-3.5 w-3.5" />
                                        <span>{channel.members_count ?? 0}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleMembershipToggle(channel.slug)}
                                        className={cn(
                                            'text-[11px] font-bold rounded-full px-3 py-1.5 transition-colors',
                                            channel.is_joined ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-900 text-white hover:bg-slate-800',
                                        )}
                                    >
                                        {channel.is_joined ? 'Joined' : 'Join'}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {channels.length === 0 && (
                    <section className="rounded-3xl bg-white ring-1 ring-slate-200 p-8 text-center">
                        <CalendarDays className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-600">Belum ada channel aktif.</p>
                        <p className="text-xs text-slate-400 mt-1">Silakan refresh beberapa saat lagi.</p>
                    </section>
                )}
            </main>
        </div>
    );
}
