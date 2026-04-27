'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpenText } from 'lucide-react';
import { useAuthSession } from '@/auth/use-auth-session';
import type { AsyncContractState } from "@/lib/async-state";
import { CommunityService } from '@/services/community.service';
import type { TodaySessionContent } from '../content/today-session.types';
import type { PersonalRenunganTelemetryEvent } from '../content/personal-renungan';
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
import { shouldPrimeDeepeningAfterCompletion, shouldShowDeepeningNotice } from "../utils/route-behavior";
import RitualSavePromptSheet from "@/components/ritual/RitualSavePromptSheet";
import { RitualParityBanner } from "./RitualParityBanner";
import { RitualReflectStage } from "./RitualReflectStage";
import { RitualCompletionSection } from "./RitualCompletionSection";
import { RitualGlassCard } from "./RitualGlassCard";
import {
  type EmotionalEntryState,
  type RenunganMode,
} from "@/features/ux-architecture/types";
import { useSanctuary } from "@/features/sanctuary/components/SanctuaryContext";
import { markRitualCompletedToday } from "@/features/sanctuary/ritual-streak";
import type { RenunganEntryIntent } from "../utils/entry-intent";

interface TodayDailyRitualScreenProps {
  sessionContent: TodaySessionContent;
  parityStatus?: "healthy" | "fallback" | "degraded";
  entryIntent?: RenunganEntryIntent;
}

const RENUNGAN_LOADING_LABEL = "Menyiapkan renungan...";

export default function TodayDailyRitualScreen({
  sessionContent,
  parityStatus = "healthy",
  entryIntent,
}: TodayDailyRitualScreenProps) {
  const m = useMotionConfig();
  const { identity, status: authStatus, isAuthenticated, profileId } = useAuthSession();
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
  const [entryState, setEntryState] = useState<EmotionalEntryState | null>(null);
  const {
    setReflectionText: syncReflectionToSanctuary,
    setEntryState: syncEntryToSanctuary,
    setInitialMentorContext: syncInitialMentorContext,
  } = useSanctuary();

  useEffect(() => {
    syncReflectionToSanctuary(reflectionText);
  }, [reflectionText, syncReflectionToSanctuary]);

  useEffect(() => {
    const normalized = reflectionText.replace(/\s+/g, " ").trim().slice(0, 1200);
    syncInitialMentorContext(normalized);
  }, [reflectionText, syncInitialMentorContext]);

  useEffect(() => {
    syncEntryToSanctuary(entryState);
  }, [entryState, syncEntryToSanctuary]);
  const [hasStarted, setHasStarted] = useState(false);
  const [syncedPostId, setSyncedPostId] = useState<string | null>(null);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);
  const [bookmarkSuccessNote, setBookmarkSuccessNote] = useState<string | null>(null);
  const [renunganRequestState, setRenunganRequestState] = useState<AsyncContractState>("idle");
  const [bookmarkState, setBookmarkState] = useState<AsyncContractState>("idle");
  const [sharePathState, setSharePathState] = useState<AsyncContractState>("idle");
  const [renunganMode, setRenunganMode] = useState<RenunganMode>("calm_heart");
  const [mentorFeedback, setMentorFeedback] = useState<'helpful' | 'not_helpful' | null>(null);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [snapshotSharePath, setSnapshotSharePath] = useState<string | null>(null);
  const [isSavePromptOpen, setIsSavePromptOpen] = useState(false);
  const isAuthRestoring = authStatus === 'restoring';
  const isGeneratingRenungan = renunganRequestState === "submitting";
  const isBookmarkSubmitting = bookmarkState === "submitting";
  const isSharePathLoading = sharePathState === "loading";
  const hasRenunganHardFailure =
    renunganRequestState === "fatal_error" || renunganRequestState === "retryable_error";
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
    setSharePathState("loading");
    try {
      const response = await fetch("/api/renungan/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          lang: "id",
          verse_reference: personalRenungan.verseReference,
          verse_text: personalRenungan.verseText,
          meditation_excerpt: personalRenungan.meditation.replace(/\s+/g, " ").trim().slice(0, 260),
          theme: personalRenungan.analysis?.primary_theme,
          ttl_hours: 72,
        }),
      });
      if (!response.ok) {
        setSharePathState("fallback");
        return personalSharePath;
      }
      const payload = (await response.json()) as {
        data?: { share_path?: string };
      };
      const nextPath = String(payload?.data?.share_path || "").trim();
      if (!nextPath) {
        setSharePathState("fallback");
        return personalSharePath;
      }

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
              setSharePathState("ready");
              return preparedPath;
            }
          } catch {
            // non-fatal
          }
        }

      setSnapshotSharePath(nextPath);
      setSharePathState("ready");
      return nextPath;
    } catch {
      setSharePathState("retryable_error");
      return personalSharePath;
    }
  };
  const meditationRef = useRef<HTMLDivElement>(null);
  const verseRevealRef = useRef<HTMLDivElement>(null);
  const deepeningRef = useRef<HTMLDivElement>(null);
  const doakanFlowStartedAtRef = useRef<number | null>(null);
  const pendingFinalRenderTelemetryRef = useRef(false);
  const hasAutoOpenedDeepeningRef = useRef(false);
  const hasTrackedDeepeningVisibleRef = useRef(false);
  const routeEntryTelemetryFiredRef = useRef(false);
  const hasAutoPromptedSaveRef = useRef(false);
  const [isDeepeningOpen, setIsDeepeningOpen] = useState(false);
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
    markRitualCompletedToday();
    const timerId = window.setTimeout(() => {
      verseRevealRef.current?.focus({ preventScroll: false });
    }, 720);
    return () => window.clearTimeout(timerId);
  }, [isHydrating, isPrayerCompleted]);

  useEffect(() => {
    void trackFunnelEvent("renungan_viewed", {
      surface: "renungan",
      meta: {
        parity_status: parityStatus,
      },
    });
  }, [parityStatus]);

  const openSavePrompt = useCallback(
    (source: "bookmark_click" | "post_amin") => {
      setIsSavePromptOpen(true);
      void trackFunnelEvent("renungan_bookmark_prompted", {
        surface: "renungan",
        meta: {
          source,
          verse_ref: personalRenungan.verseReference,
        },
      });
    },
    [personalRenungan.verseReference]
  );

  useEffect(() => {
    if (hasAutoPromptedSaveRef.current) return;
    if (!isPrayerCompleted || isAuthenticated || isAuthRestoring) return;
    hasAutoPromptedSaveRef.current = true;
    openSavePrompt("post_amin");
  }, [isAuthRestoring, isAuthenticated, isPrayerCompleted, openSavePrompt]);

  const handleBookmarkReflection = async () => {
    if (!isAuthenticated) {
      openSavePrompt("bookmark_click");
      return false;
    }

    setBookmarkError(null);
    setBookmarkSuccessNote(null);
    setBookmarkState("submitting");

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
                    ? `Tema: ${personalRenungan.analysis.primary_theme}`
                    : undefined,
              }
            )
          ).id;

      if (!syncedPostId) {
        setSyncedPostId(ensuredPostId);
      }

      const updatedPost = await CommunityService.toggleBookmark(ensuredPostId);
      if (updatedPost.isBookmarked) {
        setBookmarkSuccessNote("Renunganmu sudah tersimpan. Kamu bisa membacanya lagi di Bookmarks.");
        setBookmarkState("ready");
        void trackFunnelEvent("renungan_bookmark_saved", {
          surface: "renungan",
          meta: {
            source: "today_share_action_bar",
            post_id: ensuredPostId,
          },
        });
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
      setBookmarkError('Belum bisa menyimpan renunganmu ke Bookmarks sekarang.');
      setBookmarkState("retryable_error");
      return false;
    }
  };

  const handleContinueReflect = async (overrideReflectionText?: string, overrideMode?: RenunganMode) => {
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
    void trackFunnelEvent("renungan_reflection_submitted", {
      surface: "renungan",
      meta: {
        input_length_bucket: safeMeta.input_length_bucket,
      },
    });

    setRenunganRequestState("submitting");
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
      const usedFallback = generated.sourceType === "fallback" || generated.usedFallback === true;
      setRenunganRequestState(usedFallback ? "fallback" : "ready");
      void trackRenunganTelemetryEvent('renungan_request_succeeded', {
        ...safeMeta,
        total_request_ms: Math.round(performance.now() - startedAt),
        source: 'api',
        request_outcome: usedFallback ? "fallback_success" : "live_success",
        fallback_reason: generated.fallbackReason ?? null,
      });
      void trackFunnelEvent(usedFallback ? "renungan_result_fallback" : "renungan_result_live", {
        surface: "renungan",
        meta: {
          request_id: generated.requestId ?? null,
          fallback_reason: generated.fallbackReason ?? null,
          verse_ref: generated.verseReference,
        },
      });
      completeReflect();
    } catch {
      setRenunganRequestState("retryable_error");
      pendingFinalRenderTelemetryRef.current = false;
      void trackRenunganTelemetryEvent('renungan_request_failed', {
        ...safeMeta,
        total_request_ms: Math.round(performance.now() - startedAt),
        request_outcome: "hard_failure",
        api_outcome_class: 'api_error',
      });
      void trackFunnelEvent("renungan_result_failure", {
        surface: "renungan",
        meta: {
          input_length_bucket: safeMeta.input_length_bucket,
        },
      });
    } finally {
      // no-op: request state is finalized in success/error branches.
    }
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
    handleContinueToVersehub,
    handleReadFullChapter,
    handleOpenRelatedVerse,
    handleStartRenungan,
    handleCompletePrayer,
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
  const handleOpenDeepening = useCallback(() => {
    if (isDeepeningOpen) return;
    setIsDeepeningOpen(true);
    void trackFunnelEvent("renungan_deepen_versehub_clicked", {
      surface: "renungan",
      meta: {
        verse_ref: personalRenungan.verseReference,
      },
    });
    void handleContinueToVersehub();
  }, [handleContinueToVersehub, isDeepeningOpen, personalRenungan.verseReference]);

  const handleDismissDeepening = useCallback(() => {
    if (!isDeepeningOpen) return;
    setIsDeepeningOpen(false);
    void trackFunnelEvent("renungan_deepening_dismissed", {
      surface: "renungan",
      meta: {
        source: "completion_section",
        verse_ref: personalRenungan.verseReference,
      },
    });
  }, [isDeepeningOpen, personalRenungan.verseReference]);

  useEffect(() => {
    if (!isPrayerCompleted || !isDeepeningOpen) {
      hasTrackedDeepeningVisibleRef.current = false;
      return;
    }
    if (hasTrackedDeepeningVisibleRef.current) return;
    hasTrackedDeepeningVisibleRef.current = true;
    void trackFunnelEvent("renungan_deepening_visible", {
      surface: "renungan",
      meta: {
        source: "completion_section",
        verse_ref: personalRenungan.verseReference,
      },
    });
  }, [isDeepeningOpen, isPrayerCompleted, personalRenungan.verseReference]);

  useEffect(() => {
    if (!isPrayerCompleted || !isDeepeningOpen) return;
    const section = deepeningRef.current;
    if (!section) return;
    let focusTimer: number | null = null;

    const scrollTimer = window.setTimeout(() => {
      const offset = 92;
      const targetTop = Math.max(0, window.scrollY + section.getBoundingClientRect().top - offset);
      window.scrollTo({ top: targetTop, behavior: "smooth" });

      focusTimer = window.setTimeout(() => {
        section.focus({ preventScroll: true });
      }, 280);
    }, 80);

    return () => {
      window.clearTimeout(scrollTimer);
      if (focusTimer !== null) window.clearTimeout(focusTimer);
    };
  }, [isDeepeningOpen, isPrayerCompleted]);

  useEffect(() => {
    if (routeEntryTelemetryFiredRef.current) return;
    if (!entryIntent) return;
    const isAliasRedirectOutcome =
      entryIntent.source === "versehub" &&
      entryIntent.intent === "organic-entry" &&
      entryIntent.pane === "pendalaman-firman";
    if (!isAliasRedirectOutcome) return;
    routeEntryTelemetryFiredRef.current = true;
    void trackFunnelEvent("versehub_id_redirected_to_renungan", {
      surface: "renungan",
      meta: {
        source: entryIntent.source,
        intent: entryIntent.intent,
        pane: entryIntent.pane,
        entry_mode: "redirected-alias",
      },
    });
  }, [entryIntent]);

  useEffect(() => {
    if (hasAutoOpenedDeepeningRef.current) return;
    if (!shouldPrimeDeepeningAfterCompletion({ entryIntent, isPrayerCompleted })) return;
    hasAutoOpenedDeepeningRef.current = true;
    setIsDeepeningOpen(true);
    const intent = entryIntent?.intent ?? null;
    const pane = entryIntent?.pane ?? null;
    void trackFunnelEvent("renungan_deepening_opened", {
      surface: "renungan",
      meta: {
        source: "entry_intent",
        pane,
        intent,
        verse_ref: personalRenungan.verseReference,
      },
    });
  }, [entryIntent, isPrayerCompleted, personalRenungan.verseReference]);

  return (
    <div
      data-testid="today-screen"
      className="relative min-h-screen font-sans bg-[#FAFCFF] selection:bg-black/10"
      aria-busy={isHydrating || isGeneratingRenungan || isBookmarkSubmitting || isSharePathLoading}
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
          greeting="Selamat datang kembali,"
          dateLabel={sessionContent.dateLabel}
          memberName={memberName}
          memberId={profileId}
          avatarUrl={identity.avatarUrl}
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
                <RitualGlassCard
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
                    Mulai renungan
                  </span>
                </motion.button>
              ) : null}
            </AnimatePresence>
            <RitualReflectStage
              show={ritualStage === 'reflect'}
              isDone={isReflectDone}
              isSubmitting={isGeneratingRenungan}
              activeActionText={ritualStage === 'reflect' ? reflectionText : ''}
              submittingLabel={RENUNGAN_LOADING_LABEL}
              transitionCalm={m.tx.calm}
              transitionMicro={m.tx.micro}
              onTextChange={setReflectionText}
              onContinue={() => void handleContinueReflect()}
            />
            {hasRenunganHardFailure ? (
              <div
                role="status"
                aria-live="polite"
                className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-[13px] leading-6 text-amber-900/85"
              >
                Renunganmu belum siap saat ini. Tarik napas pelan, lalu coba lagi sebentar.
              </div>
            ) : null}
          </section>
          {renunganRequestState === "fallback" ? (
            <section className="mt-4 px-6">
              <div className="rounded-2xl border border-sky-100 bg-sky-50/65 px-4 py-3 text-[12px] leading-6 text-sky-900/78">
                Renunganmu tetap tersedia. Untuk saat ini, kami menemanimu dengan versi yang lebih sederhana.
              </div>
            </section>
          ) : null}
          {shouldShowDeepeningNotice({ entryIntent, isPrayerCompleted }) ? (
            <section className="mt-6 px-6">
              <div className="rounded-2xl border border-sky-100 bg-sky-50/55 px-4 py-4 text-sky-900/80">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-700">Pendalaman Firman</p>
                <p className="mt-2 text-[13px] leading-6">
                  Pendalaman dibuka setelah renungan hari ini selesai. Lanjutkan dulu dengan tenang.
                </p>
              </div>
            </section>
          ) : null}
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
            isDeepeningOpen={isDeepeningOpen}
            deepeningRef={deepeningRef}
            onOpenDeepening={handleOpenDeepening}
            onDismissDeepening={handleDismissDeepening}
            onReadFullChapter={handleReadFullChapter}
            onOpenRelatedVerse={handleOpenRelatedVerse}
            onResolveSharePath={resolvePersonalSharePath}
            onBookmark={handleBookmarkReflection}
            onRequireBookmarkAuth={() => openSavePrompt("bookmark_click")}
          />
        </main>
      </div>
      <RitualSavePromptSheet
        open={isSavePromptOpen}
        nextPath="/renungan"
        onOpenChange={setIsSavePromptOpen}
        onLoginClick={() => {
          void trackFunnelEvent("renungan_bookmark_login_redirect", {
            surface: "renungan",
            meta: {
              source: "save_prompt_login",
            },
          });
        }}
        onSignupClick={() => {
          void trackFunnelEvent("renungan_bookmark_login_redirect", {
            surface: "renungan",
            meta: {
              source: "save_prompt_signup",
            },
          });
        }}
        onDismissClick={() => {
          setIsSavePromptOpen(false);
        }}
      />
    </div>
  );
}

