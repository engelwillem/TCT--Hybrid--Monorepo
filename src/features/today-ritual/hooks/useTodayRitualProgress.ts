'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'tct.today.ritual-progress.v1';

interface PersistedTodayRitualProgress {
  dayKey: string;
  reflectionText: string;
  isReflectDone: boolean;
  isPrayerCompleted: boolean;
}

interface TodayRitualProgressState {
  dayKey: string;
  reflectionText: string;
  isReflectDone: boolean;
  isPrayerCompleted: boolean;
}

interface UseTodayRitualProgressResult {
  isHydrating: boolean;
  hydrationMode: 'fresh' | 'restored';
  reflectionText: string;
  isReflectDone: boolean;
  isPrayerCompleted: boolean;
  setReflectionText: (value: string) => void;
  completeReflect: () => void;
  completePrayer: () => void;
}

function getJakartaDayKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value ?? '0000';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';

  return `${year}-${month}-${day}`;
}

function getInitialState(dayKey: string): TodayRitualProgressState {
  return {
    dayKey,
    reflectionText: '',
    isReflectDone: false,
    isPrayerCompleted: false,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeProgress(
  raw: PersistedTodayRitualProgress,
  todayKey: string
): TodayRitualProgressState | null {
  if (raw.dayKey !== todayKey) {
    return null;
  }

  const reflectionText = typeof raw.reflectionText === 'string' ? raw.reflectionText : '';
  const hasReflectionText = reflectionText.trim().length > 0;
  const isReflectDone = Boolean(raw.isReflectDone) && hasReflectionText;
  const isPrayerCompleted = Boolean(raw.isPrayerCompleted) && isReflectDone;

  return {
    dayKey: todayKey,
    reflectionText,
    isReflectDone,
    isPrayerCompleted,
  };
}

function readPersistedProgress(todayKey: string): TodayRitualProgressState | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed: unknown = JSON.parse(stored);
    if (!isRecord(parsed)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    const payload: PersistedTodayRitualProgress = {
      dayKey: typeof parsed.dayKey === 'string' ? parsed.dayKey : '',
      reflectionText: typeof parsed.reflectionText === 'string' ? parsed.reflectionText : '',
      isReflectDone: Boolean(parsed.isReflectDone),
      isPrayerCompleted: Boolean(parsed.isPrayerCompleted),
    };

    const sanitized = sanitizeProgress(payload, todayKey);
    if (!sanitized) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return sanitized;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function savePersistedProgress(state: TodayRitualProgressState): void {
  const hasMeaningfulProgress =
    state.reflectionText.trim().length > 0 || state.isReflectDone || state.isPrayerCompleted;

  if (!hasMeaningfulProgress) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  const payload: PersistedTodayRitualProgress = {
    dayKey: state.dayKey,
    reflectionText: state.reflectionText,
    isReflectDone: state.isReflectDone,
    isPrayerCompleted: state.isPrayerCompleted,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function useTodayRitualProgress(): UseTodayRitualProgressResult {
  const [isHydrating, setIsHydrating] = useState(true);
  const [hydrationMode, setHydrationMode] = useState<'fresh' | 'restored'>('fresh');
  const [state, setState] = useState<TodayRitualProgressState>(() => getInitialState(getJakartaDayKey()));

  useEffect(() => {
    const todayKey = getJakartaDayKey();
    const persisted = readPersistedProgress(todayKey);
    const readyDelayMs = persisted ? 260 : 140;

    if (persisted) {
      setState(persisted);
      setHydrationMode('restored');
    } else {
      setState(getInitialState(todayKey));
      setHydrationMode('fresh');
    }

    const timerId = window.setTimeout(() => {
      setIsHydrating(false);
    }, readyDelayMs);

    return () => {
      window.clearTimeout(timerId);
    };
  }, []);

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    const todayKey = getJakartaDayKey();
    if (state.dayKey !== todayKey) {
      const resetState = getInitialState(todayKey);
      setState(resetState);
      savePersistedProgress(resetState);
      return;
    }

    savePersistedProgress(state);
  }, [isHydrating, state]);

  const actions = useMemo(
    () => ({
      setReflectionText: (value: string) => {
        setState((prev) => ({
          ...prev,
          reflectionText: value,
        }));
      },
      completeReflect: () => {
        setState((prev) => ({
          ...prev,
          isReflectDone: prev.reflectionText.trim().length > 0,
        }));
      },
      completePrayer: () => {
        setState((prev) => ({
          ...prev,
          isPrayerCompleted: prev.isReflectDone && prev.reflectionText.trim().length > 0,
        }));
      },
    }),
    []
  );

  return {
    isHydrating,
    hydrationMode,
    reflectionText: state.reflectionText,
    isReflectDone: state.isReflectDone,
    isPrayerCompleted: state.isPrayerCompleted,
    setReflectionText: actions.setReflectionText,
    completeReflect: actions.completeReflect,
    completePrayer: actions.completePrayer,
  };
}
