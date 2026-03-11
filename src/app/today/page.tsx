'use client';

import MobileAppLayout from '@/layouts/MobileAppLayout';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

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

const slugifyRef = (ref: string) =>
    ref.toLowerCase().trim()
        .replace(/[:\.\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

type FeedItem = {
    id: number;
    type: string;
    payload: any;
    interactions?: any;
    can_moderate?: boolean;
};

type PinnedLesson = {
    quarter: { id: number; title: string; date_range_human?: string; cover_image_url?: string };
    lesson: { id: number; title: string; excerpt?: string; estimated_minutes: number; day_number: number };
    progress: { state: 'start' | 'continue' | 'completed' };
} | null;

export default function TodayPage() {
    // Mocking data for now as we don't have the API integration yet
    // This maintains pure visual parity
    const pinnedLesson: PinnedLesson = null;
    const hybridFeed: FeedItem[] = [
        {
            id: 1,
            type: 'system_reflection',
            payload: {
                title: 'Kekuatan dalam Kelemahan',
                text: 'Tuhan menunjukkan kuasa-Nya paling nyata saat kita mengakui kelemahan kita.',
                verseRef: '2 Korintus 12:9'
            }
        },
        {
            id: 2,
            type: 'prayer_request',
            payload: {
                author: { name: 'Sarah' },
                text: 'Mohon doa untuk kesehatan ibu saya yang sedang dalam masa pemulihan.',
                title: 'Doa untuk Kesembuhan'
            }
        }
    ];
    const feed: FeedItem[] = [];
    const rituals = {
        reflection_prompt: {
            question: "Apa satu hal yang ingin kau serahkan pada Tuhan hari ini?",
            response_count: 54
        },
        quote_of_day: {
            text: "Berhenti mencoba menjadi sempurna, mulailah mencoba menjadi murni hati.",
            reference: "Inspiratif"
        }
    };
    const dailyVerse: DailyVerse = {
        ref: 'mzm-23-1',
        reference: 'Mazmur 23:1',
        quote: 'TUHAN adalah gembalaku, takkan kekurangan aku.'
    };
    const welcomeVerse = undefined;

    const items = hybridFeed;
    const firstItems = items.slice(0, 2);
    const restItems = items.slice(2);
    const ritualVerse = (rituals as any)?.today_verse ?? null;
    const ritualRef = String(
        ritualVerse?.ref ??
        dailyVerse?.ref ??
        '',
    ).trim();
    
    const normalizedRitualVerse = ritualRef
        ? {
            ref: slugifyRef(ritualRef || 'mzm-23-1'),
            book_code: String(ritualVerse?.book_code ?? dailyVerse?.book_code ?? ''),
            chapter: Number(ritualVerse?.chapter ?? dailyVerse?.chapter ?? 0),
            verse: Number(ritualVerse?.verse ?? dailyVerse?.verse ?? 0),
            quote: String(
                ritualVerse?.quote ??
                ritualVerse?.text ??
                dailyVerse?.quote ??
                '',
            ) || null,
            cta_label: String(
                ritualVerse?.cta_label ??
                dailyVerse?.cta_label ??
                'Baca Alkitab',
            ),
            cta_href: String(
                ritualVerse?.cta_href ??
                (ritualVerse?.ref ? `/versehub/id/${ritualVerse?.ref}` : dailyVerse?.cta_href) ??
                '/versehub/id',
            ),
            source_post_id: Number(ritualVerse?.source_post_id ?? dailyVerse?.source_post_id ?? 0) || undefined,
            reference: String(ritualVerse?.reference ?? dailyVerse?.reference ?? '') || undefined,
            title: String(ritualVerse?.title ?? dailyVerse?.title ?? '') || undefined,
        }
        : null;

    const normalizedLegacyFeed = useMemo(() => {
        if (Array.isArray(feed)) return feed;
        const maybeData = (feed as any)?.data;
        return Array.isArray(maybeData) ? maybeData : [];
    }, [feed]);

    const legacyByType = useMemo(() => {
        const map = new Map<string, any>();
        for (const item of normalizedLegacyFeed) {
            if (!item?.type || map.has(item.type)) continue;
            map.set(item.type, item.payload ?? {});
        }
        return map;
    }, [normalizedLegacyFeed]);

    const legacyReflection = legacyByType.get('reflection');
    const legacyPrayer = legacyByType.get('prayer');
    const legacyCommunity = legacyByType.get('community');
    const legacyTalk = legacyByType.get('talk');
    const legacyQuestion = legacyByType.get('question');

    return (
        <MobileAppLayout
            title="Today"
            activeNavId="home"
            backHref="/"
            className="md:max-w-none bg-slate-50/30 dark:bg-slate-950/30"
            header={<GreetingHeader />}
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mx-auto w-full max-w-[720px] space-y-5 pb-28 pt-2 px-4 md:px-0"
            >
                <div className="space-y-5">
                    {/* Entry Points */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, margin: "-10%" }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <ActionShortcutBar />
                    </motion.div>

                    {/* Sacred Anchor (Verse) */}
                    <ThrowingCard index={0}>
                        <DailyVerseHeroCard
                            welcomeVerse={normalizedRitualVerse ?? (welcomeVerse as any)}
                            fallbackVerse={dailyVerse ?? (normalizedRitualVerse as any)}
                        />
                    </ThrowingCard>

                    {/* Active Ritual (Reflection) */}
                    <ThrowingCard index={1}>
                        <ReflectionPrompt payload={rituals?.reflection_prompt} />
                    </ThrowingCard>

                    {/* Legacy feed cards kept alive for backwards compatibility */}
                    {legacyReflection ? (
                        <ThrowingCard index={2}>
                            <ReflectionCard payload={legacyReflection} />
                        </ThrowingCard>
                    ) : null}
                    {legacyPrayer ? (
                        <ThrowingCard index={3}>
                            <DailyPrayerCard payload={legacyPrayer} />
                        </ThrowingCard>
                    ) : null}
                    {legacyCommunity ? (
                        <ThrowingCard index={4}>
                            <CommunityCard payload={legacyCommunity} />
                        </ThrowingCard>
                    ) : null}
                    {legacyQuestion ? (
                        <ThrowingCard index={5}>
                            <QuestionOfTheDay payload={legacyQuestion} />
                        </ThrowingCard>
                    ) : null}
                    {legacyTalk ? (
                        <ThrowingCard index={6}>
                            <TalkCard payload={legacyTalk} />
                        </ThrowingCard>
                    ) : null}

                    {/* Feed Part 1 (Direct Engagement) */}
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.98 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: false, margin: "-5%" }}
                        transition={{ duration: 0.8 }}
                    >
                        <FeedList items={firstItems} />
                    </motion.div>

                    {/* Learning Path (If available) */}
                    {pinnedLesson && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                            <PinnedLessonCard pinned={pinnedLesson} />
                        </motion.div>
                    )}

                    {/* Wisdom Pearl (Quote) */}
                    <ThrowingCard index={10}>
                        <QuoteCard payload={rituals?.quote_of_day} />
                    </ThrowingCard>

                    {/* Feed Part 2 (Wider Community) */}
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.98 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: false, margin: "-5%" }}
                        transition={{ duration: 0.8 }}
                    >
                        <FeedList items={restItems} startIndex={2} />
                    </motion.div>
                </div>
            </motion.div>
        </MobileAppLayout>
    );
}
