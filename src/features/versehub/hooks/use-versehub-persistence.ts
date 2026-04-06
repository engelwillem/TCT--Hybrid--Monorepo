"use client";

import { useEffect, type Dispatch, type SetStateAction } from "react";
import type { OverlayType } from "@/features/versehub/types";

const LAST_ACTIVE_MOOD_KEY = "tct:versehub:last-active-mood";
const LAST_VISITED_BOOK_KEY = "tct:versehub:last-visited-book";
const LAST_VISITED_BOOK_LABEL_KEY = "tct:versehub:last-visited-book-label";
const AUTO_OPEN_KEY = "tct:versehub:auto-open";

export function usePersistedVersehubMood(
  activeMood: string,
  setActiveMood: Dispatch<SetStateAction<string>>,
  setLastVisitedChapterHref: Dispatch<SetStateAction<string | null>>,
  setLastVisitedChapterLabel: Dispatch<SetStateAction<string | null>>,
) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedMood = window.localStorage.getItem(LAST_ACTIVE_MOOD_KEY);
    const storedChapterHref = window.localStorage.getItem(LAST_VISITED_BOOK_KEY);
    const storedChapterLabel = window.localStorage.getItem(LAST_VISITED_BOOK_LABEL_KEY);

    if (storedMood) {
      setActiveMood(storedMood);
    }
    if (storedChapterHref) {
      setLastVisitedChapterHref(storedChapterHref);
    }
    if (storedChapterLabel) {
      setLastVisitedChapterLabel(storedChapterLabel);
    }
  }, [setActiveMood, setLastVisitedChapterHref, setLastVisitedChapterLabel]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LAST_ACTIVE_MOOD_KEY, activeMood);
  }, [activeMood]);
}

interface UseLastVisitedChapterArgs {
  activeBook: string | null;
  chapterLabel: string;
  chapterRouteFromVerse: string;
  initialChapterRef: string | null;
  isChapterMode: boolean;
  isVerseMode: boolean;
  lang: string;
  setLastVisitedChapterHref: Dispatch<SetStateAction<string | null>>;
  setLastVisitedChapterLabel: Dispatch<SetStateAction<string | null>>;
}

export function useLastVisitedVersehubChapter({
  activeBook,
  chapterLabel,
  chapterRouteFromVerse,
  initialChapterRef,
  isChapterMode,
  isVerseMode,
  lang,
  setLastVisitedChapterHref,
  setLastVisitedChapterLabel,
}: UseLastVisitedChapterArgs) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((!isChapterMode && !isVerseMode) || !chapterLabel) return;

    const href = isChapterMode
      ? (initialChapterRef ? `/versehub/${lang}/${initialChapterRef}` : activeBook ? `/versehub/${lang}/${activeBook}` : null)
      : chapterRouteFromVerse;

    if (!href) return;

    window.localStorage.setItem(LAST_VISITED_BOOK_KEY, href);
    window.localStorage.setItem(LAST_VISITED_BOOK_LABEL_KEY, chapterLabel);
    setLastVisitedChapterHref(href);
    setLastVisitedChapterLabel(chapterLabel);
  }, [
    activeBook,
    chapterLabel,
    chapterRouteFromVerse,
    initialChapterRef,
    isChapterMode,
    isVerseMode,
    lang,
    setLastVisitedChapterHref,
    setLastVisitedChapterLabel,
  ]);
}

export function useVersehubAutoOpenExplore(
  isLandingMode: boolean,
  setOverlay: Dispatch<SetStateAction<OverlayType>>,
) {
  useEffect(() => {
    if (!isLandingMode || typeof window === "undefined") return;

    const autoOpen = window.sessionStorage.getItem(AUTO_OPEN_KEY);
    if (autoOpen !== "explore") return;

    window.sessionStorage.removeItem(AUTO_OPEN_KEY);
    const timerId = window.setTimeout(() => {
      setOverlay("explore");
    }, 240);

    return () => window.clearTimeout(timerId);
  }, [isLandingMode, setOverlay]);
}
