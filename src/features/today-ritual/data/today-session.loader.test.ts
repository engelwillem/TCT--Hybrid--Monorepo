import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FetchBoundaryError } from './fetch-json';
import { loadTodaySessionContent } from './today-session.loader';
import { fetchTodaySessionRaw } from './today-session.source';

vi.mock('./today-session.source', () => ({
  fetchTodaySessionRaw: vi.fn(),
}));

describe('today-session.loader', () => {
  const mockedFetchTodaySessionRaw = vi.mocked(fetchTodaySessionRaw);

  beforeEach(() => {
    mockedFetchTodaySessionRaw.mockReset();
  });

  it('falls back safely on source error and emits warning diagnostics', async () => {
    mockedFetchTodaySessionRaw.mockRejectedValueOnce(
      new FetchBoundaryError('TIMEOUT', 'Request timed out after 4500ms')
    );

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    const content = await loadTodaySessionContent();

    expect(content.openingLine.length).toBeGreaterThan(0);
    expect(warnSpy).toHaveBeenCalledWith(
      '[today] content diagnostics',
      expect.objectContaining({
        sourceStatus: 'fallback_only',
      })
    );
    expect(infoSpy).not.toHaveBeenCalled();
    expect(mockedFetchTodaySessionRaw).toHaveBeenCalledWith({ previewDate: undefined });
  });

  it('emits lightweight info diagnostics when running in fallback-only mode', async () => {
    mockedFetchTodaySessionRaw.mockResolvedValueOnce(null);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    await loadTodaySessionContent();

    expect(warnSpy).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledWith(
      '[today] content diagnostics',
      expect.objectContaining({
        sourceStatus: 'fallback_only',
      })
    );
  });

  it('passes previewDate option through to source boundary', async () => {
    mockedFetchTodaySessionRaw.mockResolvedValueOnce(null);

    await loadTodaySessionContent({ previewDate: '2026-03-22' });

    expect(mockedFetchTodaySessionRaw).toHaveBeenCalledWith({ previewDate: '2026-03-22' });
  });
});
