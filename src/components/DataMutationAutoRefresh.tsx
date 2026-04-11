"use client";

import { startTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { notifyDataMutation, resolveMutationCandidate, subscribeDataMutation } from "@/lib/mutation-sync";

declare global {
  interface Window {
    __tctFetchMutationPatchInstalled?: boolean;
  }
}

export function DataMutationAutoRefresh() {
  const router = useRouter();
  const lastRefreshAtRef = useRef(0);
  const refreshTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const refreshNow = () => {
      lastRefreshAtRef.current = Date.now();
      startTransition(() => {
        router.refresh();
      });
    };

    const scheduleRefresh = () => {
      const now = Date.now();
      const elapsed = now - lastRefreshAtRef.current;
      const minGapMs = 600;

      if (elapsed >= minGapMs) {
        refreshNow();
        return;
      }

      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }

      refreshTimerRef.current = window.setTimeout(() => {
        refreshTimerRef.current = null;
        refreshNow();
      }, minGapMs - elapsed);
    };

    const unsubscribe = subscribeDataMutation(() => {
      scheduleRefresh();
    });

    return () => {
      unsubscribe();
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.__tctFetchMutationPatchInstalled) return;

    const originalFetch = window.fetch.bind(window);
    const patchedFetch: typeof window.fetch = async (input, init) => {
      const candidate = resolveMutationCandidate(input, init);
      const response = await originalFetch(input, init);

      if (candidate && response.ok) {
        notifyDataMutation(candidate);
      }

      return response;
    };

    window.fetch = patchedFetch;
    window.__tctFetchMutationPatchInstalled = true;
  }, []);

  return null;
}
