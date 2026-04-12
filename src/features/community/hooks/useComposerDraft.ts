import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ComposerMode, MediaAspectRatio, PostType } from "../components/post-composer/types";

const DRAFT_STORAGE_KEY = "tct:community:composer:draft:v1";
const DRAFT_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type DraftPayload = {
  version: 1;
  savedAt: number;
  text: string;
  type: PostType;
  composerMode: ComposerMode;
  mediaAspectRatio: MediaAspectRatio;
};

type DraftSeed = {
  text: string;
  type: PostType;
  composerMode: ComposerMode;
  mediaAspectRatio: MediaAspectRatio;
  savedAt: number;
};

type UseComposerDraftParams = {
  text: string;
  type: PostType;
  composerMode: ComposerMode;
  mediaAspectRatio: MediaAspectRatio;
  canRestore: boolean;
};

function parseDraft(raw: string | null): DraftPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DraftPayload;
    if (!parsed || parsed.version !== 1) return null;
    if (typeof parsed.savedAt !== "number") return null;
    if (Date.now() - parsed.savedAt > DRAFT_TTL_MS) return null;
    if (typeof parsed.text !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function readComposerDraftSeed(): DraftSeed | null {
  if (typeof window === "undefined") return null;
  const payload = parseDraft(window.localStorage.getItem(DRAFT_STORAGE_KEY));
  if (!payload) return null;
  return {
    text: payload.text,
    type: payload.type,
    composerMode: payload.composerMode,
    mediaAspectRatio: payload.mediaAspectRatio,
    savedAt: payload.savedAt,
  };
}

export function useComposerDraft({ text, type, composerMode, mediaAspectRatio, canRestore }: UseComposerDraftParams) {
  const [restoredDraftAt, setRestoredDraftAt] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const saveTimerRef = useRef<number | null>(null);

  const markDraftRestored = useCallback((savedAt: number | null) => {
    setRestoredDraftAt(savedAt);
    setLastSavedAt(savedAt);
  }, []);

  const clearDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    setRestoredDraftAt(null);
    setLastSavedAt(null);
    setIsSaving(false);
  }, []);

  const shouldPersist = useMemo(() => {
    if (!canRestore) return false;
    return Boolean(text.trim());
  }, [canRestore, text]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!canRestore) return;

    if (!shouldPersist) {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      setLastSavedAt(null);
      setIsSaving(false);
      return;
    }

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    setIsSaving(true);
    saveTimerRef.current = window.setTimeout(() => {
      const now = Date.now();
      const payload: DraftPayload = {
        version: 1,
        savedAt: now,
        text,
        type,
        composerMode,
        mediaAspectRatio,
      };
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
      setLastSavedAt(now);
      setIsSaving(false);
      saveTimerRef.current = null;
    }, 1500); // Slightly longer debounce for a "calm" status feel

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [canRestore, shouldPersist, text, type, composerMode, mediaAspectRatio]);

  return {
    restoredDraftAt,
    isSaving,
    lastSavedAt,
    markDraftRestored,
    clearDraft,
  };
}

