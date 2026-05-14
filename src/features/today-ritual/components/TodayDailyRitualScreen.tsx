'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpenText } from 'lucide-react';
import { useAuthSession } from '@/auth/use-auth-session';
import { CommunityService } from '@/services/community.service';
import type { TodaySessionContent } from '../content/today-session.types';
import type { PersonalRenunganTelemetryEvent, RenunganMatch } from '../content/personal-renungan';
import {
  buildPersonalRenungan,
  generatePersonalRenungan,
} from '../content/personal-renungan';
import {
  buildSafeRenunganTelemetryMeta,
  trackRenunganTelemetryEvent,
} from '../analytics';
import { useTodayRitualProgress } from '../hooks/useTodayRitualProgress';
import { useMotionConfig } from '../hooks/useMotionConfig';
import { useRitualActions } from '../hooks/useRitualActions';
import TodayHeader from './TodayHeader';
import ReceiveVerse from './ReceiveVerse';
import { trackFunnelEvent } from '@/lib/funnel-analytics';
import { createRenunganShareToken } from '@/lib/renungan-share';
import { prepareRenunganShareAsset } from '@/lib/share-assets';
import { resolveRenunganBehavior } from "@/ai/renungan/resolve-renungan-request";
import { resolveRenunganFollowUps } from "@/ai/renungan/resolve-renungan-ui";
import { buildArchiveText } from "../utils/build-archive-text";
import { RitualParityBanner } from "./RitualParityBanner";
import { RitualReflectStage } from "./RitualReflectStage";
import { RitualCompletionSection } from "./RitualCompletionSection";
import { RitualMeditationCard } from "./RitualMeditationCard";
import {
  type EmotionalEntryState,
  type RenunganMode,
  EMOTIONAL_STATE_PROMPT_SEEDS,
} from "@/features/ux-architecture/types";

interface TodayDailyRitualScreenProps {
  sessionContent: TodaySessionContent;
  parityStatus?: "healthy" | "fallback" | "degraded";
}

const RENUNGAN_LOADING_LABEL = "Preparing your reflection...";

export default function TodayDailyRitualScreen({
  sessionContent,
  parityStatus = "healthy",
}: TodayDailyRitualScreenProps) {
  const m = useMotionConfig();
  const { identity, status: authStatus, isAuthenticated } = useAuthSession();
  const ritualSessionScope =
    authStatus === 'authenticated'
      ? `member:${String(identity.email || identity.name || 'member').trim().toLowerCase()}`
      : 'guest';
  const {
    isHydrating,
    hydrationMode,
    reflectionText,
    setReflectionText,
    isReflectDone,
    isPrayerCompleted,
    completeReflect,
    completePrayer,
  } = useTodayRitualProgress(ritualSessionScope);
  const [hasStarted, setHasStarted] = useState(false);
  const [syncedPostId, setSyncedPostId] = useState<string | null>(null);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);
  const [bookmarkSuccessNote, setBookmarkSuccessNote] = useState<string | null>(null);
  const [isGeneratingRenungan, setIsGeneratingRenungan] = useState(false);
  const [entryState, setEntryState] = useState<EmotionalEntryState | null>(null);
  const [renunganMode, setRenunganMode] = useState<RenunganMode>("calm_heart");
  const [mentorFeedback, setMentorFeedback] = useState<'helpful' | 'not_helpful' | null>(null);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [snapshotSharePath, setSnapshotSharePath] = useState<string | null>(null);
  const isAuthRestoring = authStatus === 'restoring';
  const memberName = authStatus === 'authenticated' && !identity.isGuest ? identity.name : null;
  const [personalRenungan, setPersonalRenungan] = useState(() =>
    buildPersonalRenungan('', sessionContent)
  );
  useEffect(() => {
    setPersonalRenungan((current) => {
      if (current?.meditation?.trim()) return current;
      return buildPersonalRenungan('', sessionContent);
    });
  }, [sessionContent]);
  const personalShareText = useMemo(
    () => `${personalRenungan.meditation} - ${personalRenungan.verseReference}`,
    [personalRenungan]
  );
  const personalSharePath = useMemo(() => {
    const meditationExcerpt = personalRenungan.meditation.replace(/\s+/g, " ").trim().slice(0, 220);
    const token = createRenunganShareToken({
      verseReference: personalRenungan.verseReference,
      verseText: personalRenungan.verseText,
      meditationExcerpt,
      theme: personalRenungan.analysis?.primary_theme,
    });
    return `/renungan/share/${token}`;
  }, [personalRenungan]);
  useEffect(() => {
    setSnapshotSharePath(null);
  }, [personalSharePath]);
  const resolvePersonalSharePath = async (): Promise<string | null> => {
    if (snapshotSharePath) return snapshotSharePath;
    try {
      const response = await fetch("/api/renungan/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          lang: "en",
          verse_reference: personalRenungan.verseReference,
          verse_text: personalRenungan.verseText,
          meditation_excerpt: personalRenungan.meditation.replace(/\s+/g, " ").trim().slice(0, 260),
          theme: personalRenungan.analysis?.primary_theme,
          ttl_hours: 72,
        }),
      });
      if (!response.ok) return personalSharePath;
      const payload = (await response.json()) as {
        data?: { share_path?: string };
      };
      const nextPath = String(payload?.data?.share_path || "").trim();
      if (!nextPath) return personalSharePath;

      // Enforce share-asset prepare so returned URL is versioned with ?v=<revision>.
      const token = nextPath.split("/").filter(Boolean).pop();
      if (token) {
        try {
          const preparePromise = prepareRenunganShareAsset(token);
          const timeoutPromise = new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 1500));
          const prepared = await Promise.race([preparePromise, timeoutPromise]);
          if (prepared?.shareUrl) {
            const preparedUrl = new URL(prepared.shareUrl, window.location.origin);
            const preparedPath = `${preparedUrl.pathname}${preparedUrl.search}`;
            setSnapshotSharePath(preparedPath);
            return preparedPath;
          }
        } catch {
          // non-fatal
        }
      }

      setSnapshotSharePath(nextPath);
      return nextPath;
    } catch {
      return personalSharePath;
    }
  };
  const meditationRef = useRef<HTMLDivElement>(null);
  const verseRevealRef = useRef<HTMLDivElement>(null);
  const doakanFlowStartedAtRef = useRef<number | null>(null);
  const pendingFinalRenderTelemetryRef = useRef(false);
  const ritualStage = useMemo(() => {
    if (isPrayerCompleted) return 'complete';
    if (isReflectDone) return 'meditation';
    if (hasStarted) return 'reflect';
    return 'intro';
  }, [hasStarted, isPrayerCompleted, isReflectDone]);

  useEffect(() => {
    if (reflectionText.trim().length > 0 || isReflectDone || isPrayerCompleted) {
      setHasStarted(true);
    }
  }, [reflectionText, isReflectDone, isPrayerCompleted]);

  const renunganBehavior = useMemo(
    () =>
      resolveRenunganBehavior({
        entryState,
        selectedMode: renunganMode,
        reflectionText,
      }),
    [entryState, reflectionText, renunganMode]
  );
  const renunganFollowUps = useMemo(() => {
    const items = resolveRenunganFollowUps(entryState);
    return items.slice(0, renunganBehavior.maxVisibleFollowUps);
  }, [entryState, renunganBehavior.maxVisibleFollowUps]);

  useEffect(() => {
    setRenunganMode(resolveRenunganBehavior({ entryState, selectedMode: null }).mode);
  }, [entryState]);

  useEffect(() => {
    if (isHydrating || !isReflectDone || isPrayerCompleted) return;
    const timerId = window.setTimeout(() => {
      meditationRef.current?.focus({ preventScroll: false });
    }, 520);
    return () => window.clearTimeout(timerId);
  }, [isHydrating, isPrayerCompleted, isReflectDone]);

  useEffect(() => {
    if (!pendingFinalRenderTelemetryRef.current || !isReflectDone) return;
    const startedAt = doakanFlowStartedAtRef.current;
    const totalRenderMs = startedAt !== null ? Math.round(performance.now() - startedAt) : null;
    void trackRenunganTelemetryEvent('renungan_final_render_complete', {
      total_render_ms: totalRenderMs,
      stage_count: 1,
    });
    pendingFinalRenderTelemetryRef.current = false;
  }, [isReflectDone]);

  useEffect(() => {
    if (isHydrating || !isPrayerCompleted) return;
    const timerId = window.setTimeout(() => {
      verseRevealRef.current?.focus({ preventScroll: false });
    }, 720);
    return () => window.clearTimeout(timerId);
  }, [isHydrating, isPrayerCompleted]);

  const handleBookmarkReflection = async () => {
    if (!isAuthenticated) {
      setBookmarkError('Please sign in to save this reflection to your Community bookmarks.');
      return false;
    }

    setBookmarkError(null);
    setBookmarkSuccessNote(null);

    try {
      const ensuredPostId = syncedPostId
        ? syncedPostId
        : (
            await CommunityService.createPost(
              buildArchiveText(
                reflectionText,
                personalRenungan.meditation,
                personalRenungan.verseText,
                personalRenungan.verseReference
              ),
              'reflection',
              [],
              {
                bookmark_origin: 'renungan',
                visibility: 'private_renungan_archive',
                ritual_user_reflection: reflectionText.trim(),
                ritual_generated_meditation: personalRenungan.meditation,
                ritual_verse_text: personalRenungan.verseText,
                ritual_verse_reference: personalRenungan.verseReference,
                related_verses: personalRenungan.relatedVerses ?? [],
                interpretation_summary:
                  personalRenungan.analysis?.primary_theme
                    ? `Theme: ${personalRenungan.analysis.primary_theme}`
                    : undefined,
              }
            )
          ).id;

      if (!syncedPostId) {
        setSyncedPostId(ensuredPostId);
      }

      const updatedPost = await CommunityService.toggleBookmark(ensuredPostId);
      if (updatedPost.isBookmarked) {
        setBookmarkSuccessNote("Your spiritual note has been saved. You can revisit it in Community > Bookmarks.");
        void trackFunnelEvent('reflection_bookmark', {
          surface: 'renungan',
          meta: {
            post_id: ensuredPostId,
            source: 'today_share_action_bar',
          },
        });
      }
      return updatedPost.isBookmarked;
    } catch {
      setBookmarkError('Your reflection could not be bookmarked right now. Please try again.');
      return false;
    }
  };

  const handleContinueReflect = async (overrideReflectionText?: string, overrideMode?: RenunganMode) => {
    if (!ensureAuthenticatedRitual()) return;

    const reflection = (overrideReflectionText ?? reflectionText).trim();
    if (!reflection || isGeneratingRenungan) return;
    if (overrideReflectionText && !reflectionText.trim()) {
      setReflectionText(reflection);
    }
    setMentorFeedback(null);
    setIsFollowUpOpen(false);
    const safeMeta = buildSafeRenunganTelemetryMeta(reflection);
    const startedAt = performance.now();
    doakanFlowStartedAtRef.current = startedAt;
    pendingFinalRenderTelemetryRef.current = true;

    void trackRenunganTelemetryEvent('renungan_doakan_clicked', {
      ...safeMeta,
    });

    setIsGeneratingRenungan(true);
    void trackRenunganTelemetryEvent('renungan_request_started', {
      ...safeMeta,
      source: 'api',
    });
    void trackRenunganTelemetryEvent('renungan_first_loading_stage_shown', {
      ...safeMeta,
      stage: RENUNGAN_LOADING_LABEL,
      stage_index: 1,
      time_to_first_feedback_ms: Math.round(performance.now() - startedAt),
    });
    void trackRenunganTelemetryEvent('renungan_loading_stage_shown', {
      ...safeMeta,
      stage: RENUNGAN_LOADING_LABEL,
      stage_index: 1,
      elapsed_ms: Math.round(performance.now() - startedAt),
    });

    try {
      const handleGenerationTelemetry = (event: PersonalRenunganTelemetryEvent) => {
        if (event.type !== 'fallback_triggered') return;
        void trackRenunganTelemetryEvent('renungan_frontend_coherence_fallback_triggered', {
          ...safeMeta,
          fallback_reason: event.reason,
          request_id: event.requestId ?? null,
          pipeline_version: event.pipelineVersion ?? null,
          status_code: event.statusCode ?? null,
        });
      };

      const generated = await generatePersonalRenungan(reflection, sessionContent, {
        onTelemetry: handleGenerationTelemetry,
        mode: overrideMode ?? renunganBehavior.mode,
        entryState,
      });
      setPersonalRenungan(generated);
      void trackRenunganTelemetryEvent('renungan_request_succeeded', {
        ...safeMeta,
        total_request_ms: Math.round(performance.now() - startedAt),
        source: 'api',
      });
      completeReflect();
    } catch {
      pendingFinalRenderTelemetryRef.current = false;
      void trackRenunganTelemetryEvent('renungan_request_failed', {
        ...safeMeta,
        total_request_ms: Math.round(performance.now() - startedAt),
        api_outcome_class: 'api_error',
      });
    } finally {
      setIsGeneratingRenungan(false);
    }
  };

  const handleSkipTextSubmit = () => {
    const seed = EMOTIONAL_STATE_PROMPT_SEEDS[entryState ?? "neutral"];
    void handleContinueReflect(seed);
  };

  const handleRegenerateByMode = (nextMode: RenunganMode) => {
    setRenunganMode(nextMode);
    if (!reflectionText.trim()) return;
    void handleContinueReflect(reflectionText, nextMode);
  };
  const ritualActionsContext = useMemo(
    () => ({
      auth: {
        isAuthenticated,
        isAuthRestoring,
      },
      reflection: {
        reflectionText,
        entryState,
      },
      mentor: {
        personalRenungan,
        mentorFeedback,
        isFollowUpOpen,
      },
    }),
    [
      entryState,
      isAuthenticated,
      isAuthRestoring,
      isFollowUpOpen,
      mentorFeedback,
      personalRenungan,
      reflectionText,
    ]
  );
  const {
    ensureAuthenticatedRitual,
    handleStartRenungan,
    handleCompletePrayer,
    handleContinueToVersehub,
    handleMentorHelpful,
    handleMentorNotHelpful,
    handleOpenFollowUp,
  } = useRitualActions({
    context: ritualActionsContext,
    handlers: {
      completePrayer,
      setHasStarted,
      setMentorFeedback,
      setIsFollowUpOpen,
    },
  });

  return (
    <div
      data-testid="today-screen"
      className="relative min-h-screen font-sans bg-[#FAFCFF] selection:bg-black/10"
      aria-busy={isHydrating}
    >
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.04] mix-blend-multiply"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(15,23,42,0.12) 1px, transparent 0)',
          backgroundSize: '18px 18px',
        }}
      />
      <motion.div
        className="pointer-events-none fixed inset-0 z-20 bg-gradient-to-b from-[#FAFCFF]/85 via-[#FAFCFF]/55 to-[#FAFCFF]/35 backdrop-blur-[2px]"
        initial={{ opacity: 0.88 }}
        animate={{ opacity: isHydrating ? 0.88 : 0 }}
        transition={hydrationMode === 'restored' ? m.tx.slow : m.tx.calm}
      />

      <div
        className={`relative z-10 w-full max-w-[480px] md:max-w-[620px] mx-auto md:mx-0 min-h-screen bg-transparent ${isHydrating ? 'pointer-events-none' : ''}`}
      >
        <TodayHeader
          greeting="Welcome back,"
          dateLabel={sessionContent.dateLabel}
          memberName={memberName}
          isAuthenticated={isAuthenticated}
          isAuthRestoring={isAuthRestoring}
        />

        <RitualParityBanner parityStatus={parityStatus} />

        <main className="pb-[env(safe-area-inset-bottom,32px)] pt-8 flex flex-col">
          <AnimatePresence mode="wait">
            {!isReflectDone ? (
              <motion.div
                key="default-verse"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12, transition: m.tx.micro }}
                transition={m.tx.calm}
              >
                <ReceiveVerse
                  verseLabel={sessionContent.verseLabel}
                  openingLine={sessionContent.openingLine}
                  verseText={sessionContent.verseText}
                  verseReference={sessionContent.verseReference}
                />
              </motion.div>
            ) : (
              <motion.section
                key="personal-meditation"
                ref={meditationRef}
                tabIndex={-1}
                initial={{ opacity: 0, y: 22, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16 }}
                transition={m.reduce ? m.tx.calm : { ...m.tx.calm, duration: 0.82 }}
                className="mt-6 px-6 focus:outline-none"
              >
                <RitualMeditationCard
                  personalRenungan={personalRenungan}
                  renunganFollowUps={renunganFollowUps}
                  isGeneratingRenungan={isGeneratingRenungan}
                  mentorFeedback={mentorFeedback}
                  isFollowUpOpen={isFollowUpOpen}
                  entryState={entryState}
                  isPrayerCompleted={isPrayerCompleted}
                  reduceMotion={m.reduce}
                  transitionCalm={m.tx.calm}
                  transitionSlow={m.tx.slow}
                  transitionBase={m.tx.base}
                  onRegenerateByMode={handleRegenerateByMode}
                  onMentorHelpful={handleMentorHelpful}
                  onMentorNotHelpful={handleMentorNotHelpful}
                  onOpenFollowUp={handleOpenFollowUp}
                  onCompletePrayer={handleCompletePrayer}
                />
              </motion.section>
            )}
          </AnimatePresence>

          <section className="mt-16 sm:mt-24 px-6">
            <AnimatePresence mode="wait" initial={false}>
              {ritualStage === 'intro' ? (
                <motion.button
                  key="ritual-intro"
                  type="button"
                  onClick={handleStartRenungan}
                  disabled={isAuthRestoring}
                  className="group inline-flex items-center gap-3 rounded-full border border-white/80 bg-white/92 px-6 py-4 text-[15px] font-semibold text-[#0f172a] shadow-[0_22px_60px_-34px_rgba(15,23,42,0.32)] backdrop-blur-xl transition-all duration-400 ease-out hover:-translate-y-[1px] hover:border-sky-300/45 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(239,246,255,0.84))] hover:shadow-[0_26px_68px_-36px_rgba(14,165,233,0.28)] focus-visible:border-sky-300/45 focus-visible:bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(239,246,255,0.84))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/45 active:scale-[0.985]"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8, transition: m.tx.micro }}
                  transition={m.tx.calm}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eff6ff] text-[#0284c7] transition-all duration-400 ease-out group-hover:translate-x-[1px] group-hover:bg-[#e0f2fe] group-hover:shadow-[0_10px_24px_-18px_rgba(14,165,233,0.45)]">
                    <BookOpenText className="h-4 w-4" />
                  </span>
                  <span className="transition-transform duration-400 ease-out group-hover:translate-x-[1.5px]">
                    Start Reflection
                  </span>
                </motion.button>
              ) : null}
            </AnimatePresence>
            <RitualReflectStage
              show={ritualStage === 'reflect'}
              isDone={isReflectDone}
              isSubmitting={isGeneratingRenungan}
              activeActionText={ritualStage === 'reflect' ? reflectionText : ''}
              entryState={entryState}
              renunganMode={renunganMode}
              submittingLabel={RENUNGAN_LOADING_LABEL}
              transitionCalm={m.tx.calm}
              transitionMicro={m.tx.micro}
              onEntryStateChange={setEntryState}
              onModeChange={setRenunganMode}
              onTextChange={setReflectionText}
              onContinue={() => void handleContinueReflect()}
              onSkip={handleSkipTextSubmit}
            />
          </section>
          <RitualCompletionSection
            isVisible={isPrayerCompleted}
            sectionRef={verseRevealRef}
            reduceMotion={m.reduce}
            transitionCalm={m.tx.calm}
            transitionSlow={m.tx.slow}
            personalRenungan={personalRenungan}
            personalShareText={personalShareText}
            personalSharePath={personalSharePath}
            isAuthenticated={isAuthenticated}
            isAuthRestoring={isAuthRestoring}
            bookmarkError={bookmarkError}
            bookmarkSuccessNote={bookmarkSuccessNote}
            entryState={entryState}
            onContinueToVersehub={handleContinueToVersehub}
            onResolveSharePath={resolvePersonalSharePath}
            onBookmark={handleBookmarkReflection}
          />
        </main>
      </div>
    </div>
  );
}
