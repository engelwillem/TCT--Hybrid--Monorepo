'use client';

import MobileAppLayout from '@/layouts/MobileAppLayout';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

// Atomic Sections
import GreetingHeader from './components/sections/GreetingHeader';
import ActionShortcutBar from './components/sections/ActionShortcutBar';
import StateChips, { SpiritualState } from './components/sections/StateChips';

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
import HookCard from '@/components/cards/HookCard';

// Types
import type { DailyVerse } from '@/types/versehub-daily';
import { getAppAccessToken } from '@/services/app-auth-token';
import { submitSpiritualState } from '@/services/today.service';

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
        spiritual_state?: SpiritualState;
    };
};

const fallbackDailyVerse: DailyVerse = {
    ref: 'mzm-23-1',
    reference: 'Mazmur 23:1',
    quote: 'TUHAN adalah gembalaku, takkan kekurangan aku.'
};

const stateMoodCopy: Record<SpiritualState, { kicker: string; title: string; body: string }> = {
    fresh: {
        kicker: 'Ritme Hari Ini',
        title: 'Mulai dari jangkar yang tenang, lalu biarkan arah harimu terbentuk.',
        body: 'Ayat, refleksi, dan percakapan komunitas disusun untuk membantumu memulai dengan fokus yang jernih.',
    },
    anxious: {
        kicker: 'Ruang Bernapas',
        title: 'Kita perlambat ritmenya dulu, lalu pilih satu langkah yang paling menenangkan.',
        body: 'Kami mendorong doa, ayat penguat, dan pintu ke komunitas agar kamu tidak memikul semuanya sendirian.',
    },
    grateful: {
        kicker: 'Syukur yang Mengalir',
        title: 'Saat hati sedang lapang, biarkan rasa syukur berubah menjadi kesaksian dan dorongan.',
        body: 'Feed akan memberi ruang lebih besar untuk quote, refleksi, dan momen yang layak dibagikan kembali.',
    },
    weary: {
        kicker: 'Tempat Singgah',
        title: 'Hari yang berat tidak perlu dijalani sendirian.',
        body: 'Kami menaruh dukungan doa dan penghiburan lebih dekat supaya langkah berikutnya terasa lebih ringan.',
    },
    'on-fire': {
        kicker: 'Momentum Bertumbuh',
        title: 'Saat semangat sedang menyala, arahkan energinya ke langkah yang paling membangun.',
        body: 'Lesson dan ritme lanjutan dinaikkan agar dorongan hari ini tidak habis sebagai inspirasi sesaat.',
    },
};

export default function TodayPage() {
    const [apiPinnedLesson, setApiPinnedLesson] = useState<PinnedLesson>(null);
    const [apiDailyVerse, setApiDailyVerse] = useState<DailyVerse | null>(null);
    const [apiHighlights, setApiHighlights] = useState<FeedItem[]>([]);
    const [apiRituals, setApiRituals] = useState<any>(null);
    const [apiWelcomeVerse, setApiWelcomeVerse] = useState<DailyVerse | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeState, setActiveState] = useState<SpiritualState>('fresh');

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
                
                if (payload?.data?.spiritual_state) {
                    setActiveState(payload.data.spiritual_state);
                }
            } catch {
                // Keep visual fallbacks
            } finally {
                if (isActive) setLoading(false);
            }
        };

        loadTodayData();
        return () => { isActive = false; };
    }, []);

    // ---------------------------------------------------------
    // STATE-DRIVEN REORDERING (Architecture MVP)
    // ---------------------------------------------------------
    
    const relevantHighlights = useMemo(() => {
        if (activeState === 'fresh') return apiHighlights;
        
        // MVP: Client-side sorting/filtering based on state
        return [...apiHighlights].sort((a, b) => {
            // Priority for 'prayer_request' if weary or anxious
            if (activeState === 'weary' || activeState === 'anxious') {
                if (a.type === 'prayer_request') return -1;
                if (b.type === 'prayer_request') return 1;
            }
            // Priority for 'testimony' or 'quote' if grateful
            if (activeState === 'grateful' || activeState === 'on-fire') {
                if (['testimony', 'quote'].includes(a.type)) return -1;
                if (['testimony', 'quote'].includes(b.type)) return 1;
            }
            return 0; // maintain original order otherwise
        });
    }, [apiHighlights, activeState]);

    const firstItems = relevantHighlights.slice(0, 2);
    const restItems = relevantHighlights.slice(2);
    
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
            cta_href: String(
                ritualVerse?.cta_href ??
                (ritualVerse?.ref ? `/versehub/id?ref=${slugifyRef(String(ritualVerse?.ref))}` : dailyVerse?.cta_href) ??
                '/versehub/id'
            ),
            source_post_id: Number(ritualVerse?.source_post_id ?? dailyVerse?.source_post_id ?? 0) || undefined,
            reference: String(ritualVerse?.reference ?? dailyVerse?.reference ?? ''),
            title: String(ritualVerse?.title ?? dailyVerse?.title ?? ''),
        };
    }, [ritualRef, ritualVerse, dailyVerse]);

    const moodCopy = stateMoodCopy[activeState];

    const handleStateChange = (newState: SpiritualState) => {
        setActiveState(newState);
        submitSpiritualState(newState).catch(console.error);
    };

    return (
        <MobileAppLayout
            title="Today"
            activeNavId="home"
            backHref="/"
            className="md:max-w-[720px] md:mx-auto"
            header={<GreetingHeader />}
        >
            <motion.div
                key={activeState}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mx-auto w-full max-w-[720px] space-y-6 pb-28 pt-2"
            >
                <div className="relative space-y-6">
                    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[360px] rounded-[44px] bg-gradient-to-b from-brand/10 to-transparent blur-3xl opacity-50" />

                    <StateChips activeState={activeState} onChange={handleStateChange} />

                    <section className="relative overflow-hidden rounded-[32px] border border-border/50 bg-surface-elevated p-6 shadow-card md:rounded-[40px] md:p-8">
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-brand/5 to-transparent" />
                        <div className="relative max-w-[34rem] space-y-3">
                            <p className="tct-kicker text-brand">{moodCopy.kicker}</p>
                            <h2 className="tct-h2 text-balance text-foreground">{moodCopy.title}</h2>
                            <p className="tct-body text-muted-foreground">{moodCopy.body}</p>
                        </div>
                    </section>

                    {/* Entry Points: Only show ActionShortcutBar when 'fresh' */}
                    {activeState === 'fresh' && (
                        <ThrowingCard index={-1} className="rounded-[32px]">
                            <ActionShortcutBar />
                        </ThrowingCard>
                    )}

                    {/* If Anxious/Weary, push Prayer/Community Hooks higher */}
                    {(activeState === 'weary' || activeState === 'anxious') && (
                        <ThrowingCard index={0} className="rounded-[32px]">
                            <HookCard
                                variant="urgent"
                                hookText="Tuhan dekat kepada orang-orang yang patah hati, dan Ia menyelamatkan orang-orang yang remuk jiwanya."
                                verseReference="Mazmur 34:19"
                                relevanceText="Kami siap mendukungmu dalam doa. Ada beban yang ingin dilepaskan hari ini?"
                                primaryAction={{
                                    type: 'pray',
                                    href: '/community?intent=pray',
                                    label: 'Minta Dukungan Doa'
                                }}
                            />
                        </ThrowingCard>
                    )}

                    {/* Sacred Anchor (Verse) */}
                    {/* Move to bottom if user is 'on-fire' and wants to continue lesson instead */}
                    {activeState !== 'on-fire' && (
                        <ThrowingCard index={0} className="rounded-[32px]">
                            <DailyVerseHeroCard
                                welcomeVerse={normalizedRitualVerse ?? welcomeVerse}
                                fallbackVerse={dailyVerse}
                            />
                        </ThrowingCard>
                    )}

                    {/* Learning Path - Bring to top if On-Fire */}
                    {apiPinnedLesson && (
                        <ThrowingCard index={activeState === 'on-fire' ? -1 : 5} className="rounded-[32px]">
                            <PinnedLessonCard pinned={apiPinnedLesson} />
                        </ThrowingCard>
                    )}

                    {/* Active Ritual (Reflection) */}
                    {rituals?.reflection_prompt && (
                        <ThrowingCard index={1} className="rounded-[32px]">
                            <ReflectionPrompt payload={rituals.reflection_prompt} />
                        </ThrowingCard>
                    )}

                    {/* Feed Part 1 (Direct Engagement - Context Aware) */}
                    <FeedList items={firstItems} />

                    {/* If On-Fire, move Verse here */}
                    {activeState === 'on-fire' && (
                        <ThrowingCard index={5} className="rounded-[32px]">
                            <DailyVerseHeroCard
                                welcomeVerse={normalizedRitualVerse ?? welcomeVerse}
                                fallbackVerse={dailyVerse}
                            />
                        </ThrowingCard>
                    )}

                    {/* Wisdom Pearl (Quote) */}
                    {rituals?.quote_of_day && activeState === 'grateful' && (
                        <ThrowingCard index={10} className="rounded-[32px]">
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
