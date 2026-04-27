"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { VersehubLandingView } from "@/features/versehub/components/VersehubLandingView";
import type { JourneyMapDay } from "@/features/versehub/components/JourneyMap";
import { VerseFocusCard } from "@/features/versehub/components/VerseFocusCard";
import { VerseFocusHeader } from "@/features/versehub/components/VerseFocusHeader";
import { VersehubLoadingScreen } from "@/features/versehub/components/VersehubLoadingScreen";
import { VersehubOverlayController } from "@/features/versehub/components/VersehubOverlayController";
import { VersehubReaderView } from "@/features/versehub/components/VersehubReaderView";
import { MoodGuidedFlow } from "@/features/versehub/components/MoodGuidedFlow";
import { useAuthSession } from "@/auth/use-auth-session";
import { useVersehubReaderActions } from "@/features/versehub/hooks/use-versehub-reader-actions";
import { useVersehubReaderChrome } from "@/features/versehub/hooks/use-versehub-reader-chrome";
import { useVersehubReaderData } from "@/features/versehub/hooks/use-versehub-reader-data";
import { landingContentPadding, readerContentPadding } from "@/features/versehub/constants";
import type { OverlayType, Verse } from "@/features/versehub/types";
import { parseVersehubBridgeContext } from "@/ai/versehub/resolve-versehub-request";
import { resolveVersehubUiHints } from "@/ai/versehub/resolve-versehub-ui";
import { useSanctuary } from "@/features/sanctuary/components/SanctuaryContext";
import { isRitualCompletedToday } from "@/features/sanctuary/ritual-streak";
import { trackFunnelEvent } from "@/lib/funnel-analytics";
import { isAllowedVersehubReaderIntent } from "@/features/versehub/utils/entry-guard";

interface VersehubReaderPageProps {
  lang: string;
  mode?: "landing" | "chapter" | "verse";
  initialChapterRef?: string | null;
  initialVerseRef?: string | null;
}

type GuidedMoodKey = "anxious" | "grateful" | "weary";
type VersehubSummaryRow = { updated_at?: string | null; ref?: string };

const JAKARTA_TIMEZONE = "Asia/Jakarta";

function toJakartaDateKey(raw: string | Date): string {
  const nextDate = typeof raw === "string" ? new Date(raw) : raw;
  if (Number.isNaN(nextDate.getTime())) return "";
  return nextDate.toLocaleDateString("en-CA", {
    timeZone: JAKARTA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function toJourneyDays(
  rows: VersehubSummaryRow[],
  todayHasRitualStreak: boolean,
): { days: JourneyMapDay[]; streak: number } {
  const countsByDate = new Map<string, number>();

  rows.forEach((row) => {
    const key = toJakartaDateKey(String(row.updated_at || ""));
    if (!key) return;
    countsByDate.set(key, (countsByDate.get(key) ?? 0) + 1);
  });

  const todayKey = toJakartaDateKey(new Date());
  if (todayHasRitualStreak && todayKey && !countsByDate.has(todayKey)) {
    countsByDate.set(todayKey, 1);
  }

  const generatedDays: JourneyMapDay[] = [];
  for (let index = 6; index >= 0; index -= 1) {
    const cursor = new Date();
    cursor.setDate(cursor.getDate() - index);
    const key = toJakartaDateKey(cursor);
    generatedDays.push({
      key,
      shortLabel: cursor.toLocaleDateString("id-ID", { timeZone: JAKARTA_TIMEZONE, weekday: "short" }),
      fullLabel: cursor.toLocaleDateString("id-ID", {
        timeZone: JAKARTA_TIMEZONE,
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      activityCount: countsByDate.get(key) ?? 0,
      isToday: key === todayKey,
    });
  }

  let streak = 0;
  const dayKeys = generatedDays.map((item) => item.key).reverse();
  for (const key of dayKeys) {
    if ((countsByDate.get(key) ?? 0) <= 0) break;
    streak += 1;
  }

  return {
    days: generatedDays,
    streak,
  };
}

export function VersehubReaderPage({
  lang: initialLang,
  mode = "landing",
  initialChapterRef = null,
  initialVerseRef = null,
}: VersehubReaderPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { identity, status: authStatus, isAuthenticated } = useAuthSession();
  const {
    reflectionText: ritualReflection,
    initialMentorContext: sanctuaryMentorContext,
    setInitialMentorContext,
    setAmbientPlaybackStateHandler,
  } = useSanctuary();
  const bridgeAutoResolvedRef = useRef(false);
  const snippetSeededRef = useRef(false);
  const routeEntryTelemetrySignatureRef = useRef<string | null>(null);
  const lang = initialLang || "id";
  const [overlay, setOverlay] = useState<OverlayType>(null);
  const [ogOpen, setOgOpen] = useState(false);
  const [reflectionDrafts, setReflectionDrafts] = useState<Record<string, string>>({});
  const [completedReflections, setCompletedReflections] = useState<Record<string, boolean>>({});
  const [chapterCompletionReflection, setChapterCompletionReflection] = useState("");
  const [hasReachedChapterEnd, setHasReachedChapterEnd] = useState(false);
  const [isSavingChapterReflection, setIsSavingChapterReflection] = useState(false);
  const [isSharingInsight, setIsSharingInsight] = useState(false);
  const [guidedMood, setGuidedMood] = useState<GuidedMoodKey | null>(null);
  const [journeyMapDays, setJourneyMapDays] = useState<JourneyMapDay[]>([]);
  const [journeyStreakCount, setJourneyStreakCount] = useState(0);
  const [insightSnippet, setInsightSnippet] = useState<string | null>(null);
  const [isInsightPinned, setIsInsightPinned] = useState(false);
  const [effectiveInitialMentorContext, setEffectiveInitialMentorContext] = useState<string | null>(null);
  const bridgeContext = useMemo(
    () => parseVersehubBridgeContext(new URLSearchParams(searchParams?.toString() ?? "")),
    [searchParams]
  );
  const bridgeUiHints = useMemo(() => resolveVersehubUiHints(bridgeContext), [bridgeContext]);
  const bridgeFromRenungan = bridgeContext.source === "renungan" && bridgeContext.intent === "clarify";
  const readerEntrySource = useMemo(
    () => String(searchParams?.get("source") || "").trim().toLowerCase() || null,
    [searchParams],
  );
  const readerEntryIntent = useMemo(
    () => String(searchParams?.get("intent") || "").trim().toLowerCase() || null,
    [searchParams],
  );
  const isAllowedReaderEntry =
    mode === "landing" &&
    readerEntrySource === "renungan" &&
    isAllowedVersehubReaderIntent(readerEntryIntent);

  useEffect(() => {
    if (!isAllowedReaderEntry) return;
    const signature = `${readerEntrySource}:${readerEntryIntent}:${mode}`;
    if (routeEntryTelemetrySignatureRef.current === signature) return;
    routeEntryTelemetrySignatureRef.current = signature;
    void trackFunnelEvent("versehub_reader_entry_allowed", {
      surface: "versehub",
      meta: {
        source: readerEntrySource,
        intent: readerEntryIntent,
        entry_mode: "allowed-reader-entry",
      },
    });
  }, [isAllowedReaderEntry, mode, readerEntryIntent, readerEntrySource]);

  useEffect(() => {
    const fromBridge = String(bridgeContext.initialMentorContext || "").replace(/\s+/g, " ").trim();
    const fromSanctuary = String(sanctuaryMentorContext || "").replace(/\s+/g, " ").trim();
    const fromReflection = String(ritualReflection || "").replace(/\s+/g, " ").trim();
    const next = (fromBridge || fromSanctuary || fromReflection).slice(0, 1200);
    if (!next) return;
    setEffectiveInitialMentorContext(next);
    setInitialMentorContext(next);
  }, [
    bridgeContext.initialMentorContext,
    ritualReflection,
    sanctuaryMentorContext,
    setInitialMentorContext,
  ]);

  useEffect(() => {
    if (snippetSeededRef.current) return;
    if (!bridgeFromRenungan) return;
    const normalized = (effectiveInitialMentorContext || ritualReflection).replace(/\s+/g, " ").trim().slice(0, 260);
    if (!normalized) return;
    setInsightSnippet(normalized);
    setIsInsightPinned(true);
    snippetSeededRef.current = true;
  }, [bridgeFromRenungan, effectiveInitialMentorContext, ritualReflection]);

  useEffect(() => {
    let cancelled = false;

    const loadJourneyMap = async () => {
      const fallback = toJourneyDays([], isRitualCompletedToday());
      if (!isAuthenticated) {
        if (!cancelled) {
          setJourneyMapDays(fallback.days);
          setJourneyStreakCount(fallback.streak);
        }
        return;
      }

      try {
        const response = await fetch(`/api/versehub/${lang}/actions/summary?limit=200&sort=recent`, {
          method: "GET",
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          if (!cancelled) {
            setJourneyMapDays(fallback.days);
            setJourneyStreakCount(fallback.streak);
          }
          return;
        }

        const payload = (await response.json()) as {
          favorites?: VersehubSummaryRow[];
          bookmarks?: VersehubSummaryRow[];
          notes?: VersehubSummaryRow[];
        };

        const merged = [
          ...(Array.isArray(payload?.favorites) ? payload.favorites : []),
          ...(Array.isArray(payload?.bookmarks) ? payload.bookmarks : []),
          ...(Array.isArray(payload?.notes) ? payload.notes : []),
        ];
        const summary = toJourneyDays(merged, isRitualCompletedToday());
        if (!cancelled) {
          setJourneyMapDays(summary.days);
          setJourneyStreakCount(summary.streak);
        }
      } catch {
        if (!cancelled) {
          setJourneyMapDays(fallback.days);
          setJourneyStreakCount(fallback.streak);
        }
      }
    };

    void loadJourneyMap();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, lang]);

  useEffect(() => {
    if (mode !== "landing") return;
    if (bridgeAutoResolvedRef.current) return;
    if (!bridgeFromRenungan) return;

    const rawRef = String(bridgeContext.verseRef || "").trim();
    if (!rawRef) return;

    let cancelled = false;
    bridgeAutoResolvedRef.current = true;

    const isLikelySlug = /^[a-z]{2,8}-\d{1,3}(?:-\d{1,3})?$/i.test(rawRef);
    if (isLikelySlug) {
      router.replace(`/versehub/${lang}/${rawRef}`);
      return;
    }

    const findSlugFromPayload = (payload: unknown): string | null => {
      const data = payload as {
        suggestions?: Array<Record<string, unknown>>;
        results?: Array<Record<string, unknown>>;
        items?: Array<Record<string, unknown>>;
        data?: Array<Record<string, unknown>> | Record<string, unknown>;
      };
      const groups: unknown[] = [data?.suggestions, data?.results, data?.items, data?.data];

      for (const group of groups) {
        const rows = Array.isArray(group) ? group : group && typeof group === "object" ? [group] : [];
        for (const row of rows) {
          if (!row || typeof row !== "object") continue;
          const candidate = row as Record<string, unknown>;
          const direct = [candidate.verse_ref, candidate.slug, candidate.ref]
            .map((v) => String(v || "").trim())
            .find((v) => /^[a-z]{2,8}-\d{1,3}(?:-\d{1,3})?$/i.test(v));
          if (direct) return direct;

          const href = String(candidate.href || candidate.path || candidate.url || "").trim();
          const match = href.match(/\/versehub\/[a-z]{2}\/([a-z0-9-]+)/i);
          if (match?.[1]) return match[1];
        }
      }

      return null;
    };

    const resolveBridgeVerse = async () => {
      const attempts = [
        `/api/versehub/${lang}/suggest?query=${encodeURIComponent(rawRef)}&limit=1`,
        `/api/versehub/${lang}/suggest?q=${encodeURIComponent(rawRef)}&limit=1`,
      ];

      for (const input of attempts) {
        try {
          const response = await fetch(input, { cache: "no-store", headers: { Accept: "application/json" } });
          if (!response.ok) continue;
          const json = (await response.json()) as unknown;
          const slug = findSlugFromPayload(json);
          if (slug) return slug;
        } catch {
          // Try the next query variant.
        }
      }

      return null;
    };

    void resolveBridgeVerse().then((slug) => {
      if (cancelled || !slug) return;
      router.replace(`/versehub/${lang}/${slug}`);
    });

    return () => {
      cancelled = true;
    };
  }, [bridgeContext.verseRef, bridgeFromRenungan, lang, mode, router]);

  const {
    activeBook,
    activeBookLabel,
    activeMood,
    activeScene,
    bookmarked,
    bookmarkCount,
    books,
    chapterLabel,
    chapterReflectionError,
    chapterReflectionQuestion,
    chapterReflectionSaved,
    chapterRouteFromVerse,
    chapters,
    error,
    firstBookLabel,
    firstChapterHref,
    isChapterMode,
    isLandingMode,
    isVerseMode,
    lastVisitedChapterHref,
    lastVisitedChapterLabel,
    liked,
    likeCount,
    liveDateLabel,
    loadBookChapters,
    loading,
    memberName,
    mentorMood,
    mentorPreviewLabel,
    mentorPreviewVerse,
    sanctuaryTitle,
    selectedVerseReflection,
    setActiveMood,
    setBookmarked,
    setBookmarkCount,
    setChapterReflectionError,
    setChapterReflectionSaved,
    setLiked,
    setLikeCount,
    setSelectedVerse,
    setSelectedVerseReflection,
    setShareInsightError,
    setTab,
    shareInsightError,
    tab,
    verseBookCode,
    verseChapterNumber,
    verseData,
    verseSegments,
    verses,
  } = useVersehubReaderData({
    authStatus,
    identity,
    initialChapterRef,
    initialVerseRef,
    isAuthenticated,
    lang,
    mode,
    overlay,
    setOverlay,
  });

  useEffect(() => {
    if (!bridgeFromRenungan) return;
    if (!effectiveInitialMentorContext) return;
    if (!mentorPreviewVerse?.key) return;

    const params = new URLSearchParams({
      user_reflection: effectiveInitialMentorContext.slice(0, 1200),
      source: "renungan",
      intent: "clarify",
    });

    void fetch(
      `/api/versehub/${encodeURIComponent(lang)}/${encodeURIComponent(mentorPreviewVerse.key)}/mentor?${params.toString()}`,
      {
        cache: "no-store",
        headers: { Accept: "application/json" },
      }
    ).catch(() => undefined);
  }, [bridgeFromRenungan, effectiveInitialMentorContext, lang, mentorPreviewVerse?.key]);

  const {
    handlePlaybackStateChange,
    scrollViewportRef,
    shouldShowChrome,
  } = useVersehubReaderChrome({
    activeMood,
    isLandingMode,
    lang,
    ogOpen,
    overlay,
    setOverlay,
  });

  useEffect(() => {
    setAmbientPlaybackStateHandler(() => handlePlaybackStateChange);
    return () => {
      setAmbientPlaybackStateHandler(null);
    };
  }, [handlePlaybackStateChange, setAmbientPlaybackStateHandler]);

  const {
    handleBookmark,
    handleLike,
    handleMoodQuickStart,
    handleReflectionChange,
    handleReflectionComplete,
    handleSaveChapterReflection,
    handleShare,
    handleShareWhatsApp,
    handleShareInsight,
    isSharing,
  } = useVersehubReaderActions({
    bookmarked,
    chapterCompletionReflection,
    chapterLabel,
    chapterReflectionQuestion,
    completedReflections,
    initialChapterRef,
    initialVerseRef,
    isAuthenticated,
    isVerseMode,
    lang,
    liked,
    mode,
    reflectionDrafts,
    setActiveMood,
    setBookmarked,
    setBookmarkCount,
    setChapterCompletionReflection,
    setChapterReflectionError,
    setChapterReflectionSaved,
    setCompletedReflections,
    setHasReachedChapterEnd,
    setIsSavingChapterReflection,
    setIsSharingInsight,
    setLiked,
    setLikeCount,
    setReflectionDrafts,
    setShareInsightError,
    verseBookCode,
    verseChapterNumber,
    verseData,
    verseSegments,
  });



  const openMentorForVerse = (verse: Verse | null, userReflection?: string | null) => {
    if (!verse) return;
    setSelectedVerse(verse);
    const seededFromRenungan = bridgeFromRenungan ? ritualReflection.trim() || null : null;
    setSelectedVerseReflection(userReflection ?? seededFromRenungan ?? null);
    setOverlay("mentor");
  };

  if (loading) {
    return <VersehubLoadingScreen label="Menyiapkan ruang doa VerseHub..." />;
  }

  if (error && isChapterMode) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#FAFCFF] px-6 py-16 text-center text-slate-800">
        <div className="mx-auto max-w-md rounded-[32px] bg-white px-6 py-8 shadow-sm ring-1 ring-slate-100">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Pasal tidak ditemukan</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Data pasal belum berhasil dimuat. Kembali ke landing VerseHub untuk memilih kitab lain.
          </p>
          <button
            type="button"
            onClick={() => router.push(`/versehub/${lang}`)}
            className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-[14px] font-semibold text-white shadow-soft transition-all duration-300 hover:bg-slate-800 active:scale-[0.98]"
          >
            Kembali ke VerseHub
          </button>
        </div>
      </div>
    );
  }

  if (error && isVerseMode) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#FAFCFF] px-6 py-16 text-center text-slate-800">
        <div className="mx-auto max-w-md rounded-[32px] bg-white px-6 py-8 shadow-sm ring-1 ring-slate-100">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Ayat tidak ditemukan</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Ayat yang Anda cari belum berhasil dimuat. Anda masih bisa kembali ke chapter reader tanpa kehilangan suasana VerseHub.
          </p>
          <button
            type="button"
            onClick={() => router.push(chapterRouteFromVerse)}
            className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-[14px] font-semibold text-white shadow-soft transition-all duration-300 hover:bg-slate-800 active:scale-[0.98]"
          >
            Kembali ke Reader
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative flex min-h-[100dvh] flex-col text-slate-800 selection:bg-sky-100",
      isLandingMode ? "overflow-visible bg-transparent" : "h-[100dvh] overflow-hidden bg-[#FAFCFF]",
    )}>
      {!isLandingMode ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-full bg-[#FAFCFF]" />
          <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-sky-50 blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[-10%] h-[400px] w-[400px] rounded-full bg-white blur-[100px]" />
          <div className="absolute left-[12%] top-[28%] h-56 w-56 rounded-full bg-sky-50/50 blur-3xl" />
        </div>
      ) : null}

      {isLandingMode && (
        <>
          {guidedMood ? (
            <MoodGuidedFlow
              lang={lang}
              mood={guidedMood}
              onBack={() => setGuidedMood(null)}
              onOpenVerse={(ref) => router.push(`/versehub/${lang}/${ref}`)}
            />
          ) : (
            <VersehubLandingView
              activeScene={activeScene}
              landingContentPadding={landingContentPadding}
              firstChapterHref={firstChapterHref}
              firstBookLabel={firstBookLabel}
              continueReadingHref={lastVisitedChapterHref}
              continueReadingLabel={lastVisitedChapterLabel}
              onContinueReading={() => {
                if (lastVisitedChapterHref) {
                  router.push(lastVisitedChapterHref);
                }
              }}
              onBackToday={() => router.push("/renungan")}
              onOpenPicker={() => setOverlay("picker")}
              onOpenExplore={() => setOverlay("explore")}
              onQuickStartMood={(moodKey) => {
                if (moodKey === "anxious" || moodKey === "grateful" || moodKey === "weary") {
                  setGuidedMood(moodKey);
                }
                void handleMoodQuickStart(moodKey);
              }}
              onStartFirstChapter={() => {
                setOverlay(null);
                if (firstChapterHref) router.push(firstChapterHref);
              }}
              liveDateLabel={liveDateLabel}
              memberName={memberName}
              activeMood={activeMood}
              bridgeContext={{
                source: bridgeContext.source ?? null,
                intent: bridgeContext.intent ?? null,
                verseRef: bridgeContext.verseRef ?? null,
              }}
              bridgeUiHints={bridgeUiHints}
              onBridgeReturnToRenungan={() => router.push("/renungan?source=versehub&intent=regulate")}
              journeyMapDays={journeyMapDays}
              journeyStreakCount={journeyStreakCount}
              onOpenJourney={() => router.push(`/versehub/${lang}/my-spiritual-journey`)}
            />
          )}
        </>
      )}

      {isChapterMode && (
        <VersehubReaderView
          chapterLabel={chapterLabel}
          sanctuaryTitle={sanctuaryTitle}
          memberName={memberName}
          liveDateLabel={liveDateLabel}
          verses={verses}
          shouldShowChrome={shouldShowChrome}
          readerContentPadding={readerContentPadding}
          chapterReflectionQuestion={chapterReflectionQuestion}
          chapterCompletionReflection={chapterCompletionReflection}
          chapterCompletionSaved={chapterReflectionSaved}
          isSavingChapterReflection={isSavingChapterReflection}
          isSharingInsight={isSharingInsight}
          reflectionError={chapterReflectionError}
          shareInsightError={shareInsightError}
          hasReachedChapterEnd={hasReachedChapterEnd}
          scrollViewportRef={scrollViewportRef}
          reflectionDrafts={reflectionDrafts}
          completedReflections={completedReflections}
          onBack={() => router.push(`/versehub/${lang}`)}
          onOpenPicker={() => setOverlay("picker")}
          onOpenExplore={() => setOverlay("explore")}
          onOpenReflectionsJournal={() => router.push(`/versehub/${lang}/reflections`)}
          onOpenVerseMentor={(verse, userReflection) => openMentorForVerse(verse, userReflection)}
          onReflectionChange={handleReflectionChange}
          onReflectionComplete={handleReflectionComplete}
          onCompletionReflectionChange={setChapterCompletionReflection}
          onSaveChapterReflection={() => handleSaveChapterReflection((href) => router.push(href))}
          onShareInsight={() => handleShareInsight((href) => router.push(href))}
          onReachedChapterEnd={() => setHasReachedChapterEnd(true)}
          insightSnippet={insightSnippet}
          isInsightPinned={isInsightPinned}
          onToggleInsightPin={() => setIsInsightPinned((current) => !current)}
        />
      )}

      {isVerseMode && verseData && (
        <>
          <VerseFocusHeader
            chapterRouteFromVerse={chapterRouteFromVerse}
            liveDateLabel={liveDateLabel}
            memberName={memberName}
            onBack={() => router.push(chapterRouteFromVerse)}
            sanctuaryTitle={sanctuaryTitle}
            shouldShowChrome={shouldShowChrome}
          />

          <main ref={(node) => { scrollViewportRef.current = node; }} className="relative z-10 flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8">
            <div className="mx-auto max-w-3xl pb-[calc(180px+env(safe-area-inset-bottom,24px))]">
              <VerseFocusCard
                bookmarked={bookmarked}
                bookmarkCount={bookmarkCount}
                chapterRouteFromVerse={chapterRouteFromVerse}
                lang={lang}
                liked={liked}
                likeCount={likeCount}
                onBackToReader={() => router.push(chapterRouteFromVerse)}
                onBookmark={() => void handleBookmark((href) => router.push(href))}
                onLike={() => void handleLike((href) => router.push(href))}
                onOpenImage={() => setOgOpen(true)}
                onShare={() => void handleShare()}
                onShareWhatsApp={() => void handleShareWhatsApp()}
                isSharing={isSharing}
                verseData={verseData}
                insightSnippet={isInsightPinned ? insightSnippet : null}
                isInsightPinned={isInsightPinned}
                onToggleInsightPin={() => setIsInsightPinned((current) => !current)}
              />
            </div>
          </main>
        </>
      )}

      <VersehubOverlayController
        activeBook={activeBook}
        activeBookLabel={activeBookLabel}
        activeMood={activeMood}
        activeScene={activeScene}
        books={books}
        chapters={chapters}
        error={error}
        firstBookLabel={firstBookLabel}
        firstChapterHref={firstChapterHref}
        isLandingMode={isLandingMode}
        lang={lang}
        loadBookChapters={loadBookChapters}
        mentorMood={mentorMood}
        mentorPreviewLabel={mentorPreviewLabel}
        mentorPreviewVerse={mentorPreviewVerse}
        ogOpen={ogOpen}
        onNavigate={(href) => router.push(href)}
        overlay={overlay}
        selectedVerseReflection={selectedVerseReflection}
        initialMentorContext={effectiveInitialMentorContext}
        setActiveMood={setActiveMood}
        setOgOpen={setOgOpen}
        setOverlay={setOverlay}
        setTab={setTab}
        tab={tab}
        verseData={verseData}
      />
    </div>
  );
}
