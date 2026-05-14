import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { todaySessionMock } from '../content/today-session.mock';
import { TODAY_SESSION_CONTRACT_VERSION, TODAY_SESSION_TEXT_LIMITS } from './today-session.contract';
import { mapRawToTodaySessionContentWithDiagnostics } from './today-session.mapper';

describe('today-session.mapper', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('applies per-field fallback and reports missing required fields for external partial payload', () => {
    const rawPayload = {
      contractVersion: TODAY_SESSION_CONTRACT_VERSION,
      verse: {
        text: 'Ayat pendek',
        reference: 'Matius 11:28',
      },
    };

    const { content, diagnostics } = mapRawToTodaySessionContentWithDiagnostics(rawPayload, todaySessionMock);

    expect(content.openingLine).toBe(todaySessionMock.openingLine);
    expect(content.prayerText).toBe(todaySessionMock.prayerText);
    expect(diagnostics.missingRequiredFields).toContain('openingLine');
    expect(diagnostics.issues.some((issue) => issue.category === 'required_content')).toBe(true);
  });

  it('truncates editorial critical fields and records editorial quality warning', () => {
    const rawPayload = {
      contractVersion: TODAY_SESSION_CONTRACT_VERSION,
      openingLine: todaySessionMock.openingLine,
      verse: {
        text: `${'A'.repeat(500)}`,
        reference: 'Matius 11:28',
      },
      reflection: {
        prompt: 'Prompt refleksi',
      },
      prayer: {
        text: `${'B'.repeat(420)}`,
      },
      completion: {
        title: 'Title',
        body: 'Body',
        tomorrowCueText: 'Cue',
      },
    };

    const { content, diagnostics } = mapRawToTodaySessionContentWithDiagnostics(rawPayload, todaySessionMock);

    expect(content.verseText.length).toBeLessThanOrEqual(TODAY_SESSION_TEXT_LIMITS.verseText);
    expect(content.prayerText.length).toBeLessThanOrEqual(TODAY_SESSION_TEXT_LIMITS.prayerText);
    expect(content.verseText.endsWith('...')).toBe(true);
    expect(
      diagnostics.issues.some(
        (issue) => issue.category === 'editorial_quality' && issue.field === 'verse.text' && issue.severity === 'warn'
      )
    ).toBe(true);
  });

  it('derives local greeting, dateLabel, and avatarInitial when missing', () => {
    vi.setSystemTime(new Date('2026-03-21T02:00:00.000Z')); // 09:00 Asia/Jakarta

    const rawPayload = {
      contractVersion: TODAY_SESSION_CONTRACT_VERSION,
      user: { name: 'andi' },
      openingLine: 'Pembuka',
      verse: {
        text: 'Ayat',
        reference: 'Ref',
      },
      reflection: {
        prompt: 'Prompt',
      },
      prayer: {
        text: 'Doa',
      },
      completion: {
        title: 'Judul',
        body: 'Isi',
        tomorrowCueText: 'Besok',
      },
    };

    const { content, diagnostics } = mapRawToTodaySessionContentWithDiagnostics(rawPayload, todaySessionMock);

    expect(content.greeting).toBe('Good morning');
    expect(content.avatarInitial).toBe('A');
    expect(content.dateLabel.length).toBeGreaterThan(0);
    expect(diagnostics.metrics.derivedCount).toBeGreaterThanOrEqual(3);
  });

  it('flags contract version mismatch', () => {
    const rawPayload = {
      contractVersion: 'today.session.v0',
      openingLine: 'Pembuka',
      verse: {
        text: 'Ayat',
        reference: 'Ref',
      },
      reflection: {
        prompt: 'Prompt',
      },
      prayer: {
        text: 'Doa',
      },
      completion: {
        title: 'Judul',
        body: 'Isi',
        tomorrowCueText: 'Besok',
      },
    };

    const { diagnostics } = mapRawToTodaySessionContentWithDiagnostics(rawPayload, todaySessionMock);

    expect(
      diagnostics.issues.some(
        (issue) => issue.category === 'contract' && issue.field === 'contractVersion' && issue.severity === 'warn'
      )
    ).toBe(true);
  });
});
