import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTodayRitualProgress } from './useTodayRitualProgress';

const STORAGE_KEY = 'tct.today.ritual-progress.v1';

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

describe('useTodayRitualProgress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('restores same-day progress from localStorage', async () => {
    vi.setSystemTime(new Date('2026-03-21T03:00:00.000Z'));
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        dayKey: getJakartaDayKey(new Date('2026-03-21T03:00:00.000Z')),
        reflectionText: 'Hari ini aku menyerahkan kekuatiranku',
        isReflectDone: true,
        isPrayerCompleted: true,
      })
    );

    const { result } = renderHook(() => useTodayRitualProgress());

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(result.current.isHydrating).toBe(false);
    expect(result.current.hydrationMode).toBe('restored');
    expect(result.current.reflectionText).toContain('menyerahkan');
    expect(result.current.isReflectDone).toBe(true);
    expect(result.current.isPrayerCompleted).toBe(true);
  });

  it('resets progress when day key changes', async () => {
    const dayOne = new Date('2026-03-21T03:00:00.000Z');
    vi.setSystemTime(dayOne);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        dayKey: getJakartaDayKey(dayOne),
        reflectionText: 'Refleksi hari ini',
        isReflectDone: true,
        isPrayerCompleted: true,
      })
    );

    const { result } = renderHook(() => useTodayRitualProgress());

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(result.current.isHydrating).toBe(false);
    expect(result.current.isPrayerCompleted).toBe(true);

    vi.setSystemTime(new Date('2026-03-22T03:00:00.000Z'));

    await act(async () => {
      result.current.setReflectionText('trigger state update');
      await Promise.resolve();
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.reflectionText).toBe('');
    expect(result.current.isReflectDone).toBe(false);
    expect(result.current.isPrayerCompleted).toBe(false);
  });

  it('sanitizes invalid persisted state and starts fresh', async () => {
    localStorage.setItem(STORAGE_KEY, '{ invalid-json');

    const { result } = renderHook(() => useTodayRitualProgress());

    await act(async () => {
      vi.advanceTimersByTime(200);
      await Promise.resolve();
    });

    expect(result.current.isHydrating).toBe(false);
    expect(result.current.hydrationMode).toBe('fresh');
    expect(result.current.reflectionText).toBe('');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
