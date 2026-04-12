import { useCallback, useRef } from "react";
import type { PostType } from "../components/post-composer/types";

export type ComposerAnalyticsEventName =
  | "composer_open"
  | "composer_typing_start"
  | "composer_attach_media"
  | "composer_crop_applied"
  | "composer_submit_success"
  | "composer_submit_failure"
  | "composer_draft_restored";

export type ComposerAnalyticsPayload = {
  postType?: PostType;
  hasMedia?: boolean;
  mediaCount?: number;
  mediaAspectRatio?: string;
  textLength?: number;
  reason?: string;
  restoredDraftAgeMinutes?: number;
  experiments?: Record<string, string>;
};

export type ComposerAnalyticsEvent = {
  name: ComposerAnalyticsEventName;
  payload: ComposerAnalyticsPayload;
  ts: number;
};

type Tracker = (event: ComposerAnalyticsEvent) => void;

type UseComposerAnalyticsParams = {
  tracker?: Tracker;
  experiments?: Record<string, string>;
};

function defaultTracker(event: ComposerAnalyticsEvent) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("tct:analytics", { detail: event }));
}

export function useComposerAnalytics({ tracker = defaultTracker, experiments }: UseComposerAnalyticsParams = {}) {
  const didTrackOpenRef = useRef(false);
  const didTrackTypingStartRef = useRef(false);
  const didTrackDraftRestoreRef = useRef(false);

  const track = useCallback(
    (name: ComposerAnalyticsEventName, payload: ComposerAnalyticsPayload) => {
      tracker({
        name,
        payload: experiments ? { ...payload, experiments } : payload,
        ts: Date.now(),
      });
    },
    [tracker, experiments]
  );

  const trackComposerOpen = useCallback(
    (payload: ComposerAnalyticsPayload) => {
      if (didTrackOpenRef.current) return;
      didTrackOpenRef.current = true;
      track("composer_open", payload);
    },
    [track]
  );

  const trackTypingStart = useCallback(
    (payload: ComposerAnalyticsPayload) => {
      if (didTrackTypingStartRef.current) return;
      didTrackTypingStartRef.current = true;
      track("composer_typing_start", payload);
    },
    [track]
  );

  const trackDraftRestored = useCallback(
    (payload: ComposerAnalyticsPayload) => {
      if (didTrackDraftRestoreRef.current) return;
      didTrackDraftRestoreRef.current = true;
      track("composer_draft_restored", payload);
    },
    [track]
  );

  const trackAttachMedia = useCallback(
    (payload: ComposerAnalyticsPayload) => {
      track("composer_attach_media", payload);
    },
    [track]
  );

  const trackCropApplied = useCallback(
    (payload: ComposerAnalyticsPayload) => {
      track("composer_crop_applied", payload);
    },
    [track]
  );

  const trackSubmitSuccess = useCallback(
    (payload: ComposerAnalyticsPayload) => {
      track("composer_submit_success", payload);
    },
    [track]
  );

  const trackSubmitFailure = useCallback(
    (payload: ComposerAnalyticsPayload) => {
      track("composer_submit_failure", payload);
    },
    [track]
  );

  const resetSessionDedupe = useCallback(() => {
    didTrackOpenRef.current = false;
    didTrackTypingStartRef.current = false;
    didTrackDraftRestoreRef.current = false;
  }, []);

  return {
    trackComposerOpen,
    trackTypingStart,
    trackAttachMedia,
    trackCropApplied,
    trackSubmitSuccess,
    trackSubmitFailure,
    trackDraftRestored,
    resetSessionDedupe,
  };
}
