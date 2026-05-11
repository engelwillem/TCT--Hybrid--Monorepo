"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { trackVersehubEvent } from "@/features/versehub/analytics";
import type { OverlayType } from "@/features/versehub/types";

interface UseVersehubReaderChromeArgs {
  activeMood: string;
  isLandingMode: boolean;
  lang: string;
  ogOpen: boolean;
  overlay: OverlayType;
  setOverlay: Dispatch<SetStateAction<OverlayType>>;
}

export function useVersehubReaderChrome({
  activeMood,
  isLandingMode,
  lang,
  ogOpen,
  overlay,
  setOverlay,
}: UseVersehubReaderChromeArgs) {
  const [audioMenuOpen, setAudioMenuOpen] = useState(false);
  const [controlCenterOpen, setControlCenterOpen] = useState(false);
  const [isChromeVisible, setIsChromeVisible] = useState(true);
  const scrollViewportRef = useRef<HTMLElement | null>(null);
  const lastScrollTopRef = useRef(0);
  const scrollIdleTimerRef = useRef<number | null>(null);
  const audioPlaybackStartedAtRef = useRef<number | null>(null);
  const latestMoodRef = useRef(activeMood);

  useEffect(() => {
    latestMoodRef.current = activeMood;
  }, [activeMood]);

  useEffect(() => {
    if (isLandingMode) return;

    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    const handleScroll = () => {
      const nextScrollTop = viewport.scrollTop;
      const delta = nextScrollTop - lastScrollTopRef.current;
      lastScrollTopRef.current = nextScrollTop;

      if (scrollIdleTimerRef.current) {
        window.clearTimeout(scrollIdleTimerRef.current);
      }

      if (Math.abs(delta) > 6) {
        setIsChromeVisible(delta < 0 || nextScrollTop < 24);
      }

      scrollIdleTimerRef.current = window.setTimeout(() => {
        setIsChromeVisible(true);
      }, 220);
    };

    viewport.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      viewport.removeEventListener("scroll", handleScroll);
      if (scrollIdleTimerRef.current) {
        window.clearTimeout(scrollIdleTimerRef.current);
      }
    };
  }, [isLandingMode]);

  useEffect(() => {
    if (overlay !== null || audioMenuOpen) {
      setControlCenterOpen(false);
    }
  }, [overlay, audioMenuOpen]);

  useEffect(() => {
    const isAnyOverlayActive = overlay !== null || ogOpen;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("tct:overlay-activity", {
        detail: { source: "versehub", active: isAnyOverlayActive },
      }));
    }

    return () => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("tct:overlay-activity", {
          detail: { source: "versehub", active: false },
        }));
      }
    };
  }, [overlay, ogOpen]);

  useEffect(() => {
    return () => {
      if (audioPlaybackStartedAtRef.current === null) return;
      const durationSeconds = Math.max(1, Math.round((Date.now() - audioPlaybackStartedAtRef.current) / 1000));
      void trackVersehubEvent(lang, "versehub_audio_toggle", {
        persona: "reader",
        meta: {
          action: "stop",
          mood: latestMoodRef.current,
          duration_seconds: durationSeconds,
          source: "cleanup",
        },
      });
    };
  }, [lang]);

  const handleAmbienceMenuOpen = (isOpen: boolean) => {
    if (isOpen) {
      setAudioMenuOpen(true);
      setOverlay("audio");
      return;
    }

    setAudioMenuOpen(false);
    if (overlay === "audio") {
      setOverlay(null);
    }
  };

  const handlePlaybackStateChange = ({
    isPlaying,
    moodKey,
    trackTitle,
  }: {
    isPlaying: boolean;
    moodKey: string;
    trackTitle?: string;
  }) => {
    if (isPlaying) {
      audioPlaybackStartedAtRef.current = Date.now();
      void trackVersehubEvent(lang, "versehub_audio_toggle", {
        persona: "reader",
        meta: {
          action: "play",
          mood: moodKey,
          track_title: trackTitle,
        },
      });
      return;
    }

    if (audioPlaybackStartedAtRef.current === null) {
      return;
    }

    const durationSeconds = Math.max(1, Math.round((Date.now() - audioPlaybackStartedAtRef.current) / 1000));
    audioPlaybackStartedAtRef.current = null;
    void trackVersehubEvent(lang, "versehub_audio_toggle", {
      persona: "reader",
      meta: {
        action: "stop",
        mood: moodKey,
        track_title: trackTitle,
        duration_seconds: durationSeconds,
      },
    });
  };

  return {
    audioMenuOpen,
    controlCenterOpen,
    handleAmbienceMenuOpen,
    handlePlaybackStateChange,
    scrollViewportRef,
    setControlCenterOpen,
    shouldShowChrome: isLandingMode || isChromeVisible || overlay !== null || controlCenterOpen || audioMenuOpen,
  };
}
