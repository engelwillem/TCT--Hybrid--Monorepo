'use client';

import MobileAppLayout from '@/layouts/MobileAppLayout';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

// Atomic Sections
import GreetingHeader from './components/sections/GreetingHeader';
import ActionShortcutBar from './components/sections/ActionShortcutBar';

// Dashboard Cards
import DailyVerseHeroCard from '@/components/versehub/DailyVerseHeroCard';
import ReflectionPrompt from './components/cards/ReflectionPrompt';
import QuoteCard from './components/cards/QuoteCard';
import PinnedLessonCard from './components/cards/PinnedLessonCard';
import DailyPrayerCard from './components/cards/DailyPrayerCard';
import CommunityCard from './components/cards/CommunityCard';
import QuestionOfTheDay from './components/cards/QuestionOfTheDay';
import TalkCard from './components/cards/TalkCard';
import ReflectionCard from './components/cards/ReflectionCard';

// Feed Components
import FeedList from './components/feed/FeedList';
import ThrowingCard from './components/ThrowingCard';

// Types
import type { DailyVerse } from '@/types/versehub-daily';
import { getAppAccessToken } from '@/services/app-auth-token';

const slugifyRef = (ref: string) =>
    ref.toLowerCase().trim()
        .replace(/[:\.\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

type FeedItem = {
    id: number | string;
    type: string;
    payload: Record<string, any>;
    interactions?: Record<string, any>;
    can_moderate?: boolean;
};

type PinnedLesson = {
    quarter: { id: number; title: string; date_range_human?: string; cover_image_url?: string };
    lesson: { id: number; title: string; excerpt?: string; estimated_minutes: number; day_number: number };
    progress: { state: 'start' | 'continue' | 'completed' };
} | null;

type TodayApiResponse = {
    data?: {
        dailyVerse?: DailyVerse | null;
        highlights?: any[];
        rituals?: any;
        pinnedLesson?: PinnedLesson;
        welcomeVerse?: DailyVerse | null;
    };
};

const fallbackDailyVerse: DailyVerse = {
    ref: 'mzm-23-1',
    reference: 'Mazmur 23:1',
    quote: 'TUHAN adalah gembalaku, takkan kekurangan aku.'
};

export default function TodayPage() {
    const [apiPinnedLesson, setApiPinnedLesson] = useState<PinnedLesson>(null);
    const [apiDailyVerse, setApiDailyVerse] = useState<DailyVerse | null>(null);
    const [apiHighlights, setApiHighlights] = useState<FeedItem[]>([]);
    const [apiRituals, setApiRituals] = useState<any>(null);
    const [apiWelcomeVerse, setApiWelcomeVerse] = useState<DailyVerse | null>(null);
    const [loading, setLoading] = useState(true);

    const dailyVerse = apiDailyVerse ?? fallbackDailyVerse;
    const welcomeVerse = apiWelcomeVerse ?? undefined;
    const rituals = apiRituals ?? {};

    useEffect(() => {
        let isActive = true;
        const loadTodayData = async () => {
            try {
                const token = getAppAccessToken();
                const response = await fetch('/api/today', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    cache: 'no-store',
                });

                if (!response.ok) return;

                const payload = (await response.json()) as TodayApiResponse;
                if (!isActive) return;

                setApiDailyVerse(payload?.data?.dailyVerse ?? null);
                setApiHighlights(Array.isArray(payload?.data?.highlights) ? payload.data.highlights : []);
                setApiPinnedLesson(payload?.data?.pinnedLesson ?? null);
                setApiRituals(payload?.data?.rituals ?? null);
                setApiWelcomeVerse(payload?.data?.welcomeVerse ?? null);
            } catch {
                // Keep visual fallbacks
            } finally {
                if (isActive) setLoading(false);
            }
        };

        loadTodayData();
        return () => { isActive = false; };
    }, []);

    const firstItems = apiHighlights.slice(0, 2);
    const restItems = apiHighlights.slice(2);
    
    const ritualVerse = rituals?.today_verse ?? null;
    const ritualRef = String(ritualVerse?.ref ?? dailyVerse?.ref ?? '').trim();
    
    const normalizedRitualVerse = useMemo(() => {
        if (!ritualRef) return null;
        return {
            ref: slugifyRef(ritualRef || 'mzm-23-1'),
            book_code: String(ritualVerse?.book_code ?? dailyVerse?.book_code ?? ''),
            chapter: Number(ritualVerse?.chapter ?? dailyVerse?.chapter ?? 0),
            verse: Number(ritualVerse?.verse ?? dailyVerse?.verse ?? 0),
            quote: String(ritualVerse?.quote ?? ritualVerse?.text ?? dailyVerse?.quote ?? ''),
            cta_label: String(ritualVerse?.cta_label ?? dailyVerse?.cta_label ?? 'Baca Alkitab'),
            cta_href: String(ritualVerse?.cta_href ?? (ritualVerse?.ref ? `/versehub/id/${ritualVerse?.ref}` : dailyVerse?.cta_href) ?? '/versehub/id'),
            source_post_id: Number(ritualVerse?.source_post_id ?? dailyVerse?.source_post_id ?? 0) || undefined,
            reference: String(ritualVerse?.reference ?? dailyVerse?.reference ?? ''),
            title: String(ritualVerse?.title ?? dailyVerse?.title ?? ''),
        };
    }, [ritualRef, ritualVerse, dailyVerse]);

    return (
        <MobileAppLayout
            title="Today"
            activeNavId="home"
            backHref="/"
            className="md:max-w-none bg-surface-muted/40"
            header={<GreetingHeader />}
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mx-auto w-full max-w-[720px] space-y-5 pb-28 pt-2"
            >
                <div className="space-y-5">
                    {/* Entry Points */}
                    <ThrowingCard index={-1}>
                        <ActionShortcutBar />
                    </ThrowingCard>

                    {/* Sacred Anchor (Verse) */}
                    <ThrowingCard index={0}>
                        <DailyVerseHeroCard
                            welcomeVerse={normalizedRitualVerse ?? welcomeVerse}
                            fallbackVerse={dailyVerse}
                        />
                    </ThrowingCard>

                    {/* Active Ritual (Reflection) */}
                    {rituals?.reflection_prompt && (
                        <ThrowingCard index={1}>
                            <ReflectionPrompt payload={rituals.reflection_prompt} />
                        </ThrowingCard>
                    )}

                    {/* Feed Part 1 (Direct Engagement) */}
                    <FeedList items={firstItems} />

                    {/* Learning Path */}
                    {apiPinnedLesson && (
                        <ThrowingCard index={5}>
                            <PinnedLessonCard pinned={apiPinnedLesson} />
                        </ThrowingCard>
                    )}

                    {/* Wisdom Pearl (Quote) */}
                    {rituals?.quote_of_day && (
                        <ThrowingCard index={10}>
                            <QuoteCard payload={rituals.quote_of_day} />
                        </ThrowingCard>
                    )}

                    {/* Feed Part 2 (Wider Community) */}
                    <FeedList items={restItems} startIndex={2} />
                </div>
            </motion.div>
        </MobileAppLayout>
    );
}
