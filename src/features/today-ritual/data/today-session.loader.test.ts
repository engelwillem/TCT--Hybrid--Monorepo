import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __resetTodaySessionCacheForTests } from "./today-session.cache";
import type { TodaySessionApiPayloadV1 } from "./today-session.contract";
import { FetchBoundaryError } from "./fetch-json";

vi.mock("./today-session.source", () => ({
  fetchTodaySessionRaw: vi.fn(),
  isTodaySessionUsingExpectedLocalFallback: vi.fn(() => false),
}));

describe("loadTodaySessionContentWithDiagnostics", () => {
  beforeEach(() => {
    process.env.TODAY_SESSION_CACHE_ADAPTER = "memory";
    process.env.TODAY_SESSION_CACHE_ALLOW_MEMORY_FALLBACK = "true";
  });

  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    __resetTodaySessionCacheForTests();
    delete process.env.TODAY_SESSION_CACHE_ADAPTER;
    delete process.env.TODAY_SESSION_CACHE_ALLOW_MEMORY_FALLBACK;
  });

  const basePayload: TodaySessionApiPayloadV1 = {
    contractVersion: "today.session.v1",
    openingLine: "Mari datang dengan hati terbuka.",
    verse: {
      text: "Tuhan adalah gembalaku, takkan kekurangan aku.",
      reference: "Mazmur 23:1",
    },
    reflection: {
      prompt: "Apa satu hal yang Tuhan teguhkan hari ini?",
    },
    prayer: {
      text: "Tuhan, tuntun aku dalam ketenangan-Mu.",
    },
    completion: {
      title: "Selesai hari ini",
      body: "Tuhan menyertaimu dalam langkah sederhana.",
      tomorrowCueText: "Besok kita lanjutkan lagi.",
    },
  };

  it("returns fallback content in non-strict mode when the source fails", async () => {
    const source = await import("./today-session.source");
    vi.mocked(source.fetchTodaySessionRaw).mockRejectedValue(
      new FetchBoundaryError("NETWORK_ERROR", "Network request failed")
    );

    const { loadTodaySessionContentWithDiagnostics } = await import("./today-session.loader");
    const loaded = await loadTodaySessionContentWithDiagnostics({ strictIntegration: false });

    expect(loaded.diagnostics.sourceStatus).toBe("fallback_only");
    expect(loaded.content.verseReference.length).toBeGreaterThan(0);
  });

  it("throws in strict mode when the source fails and fallback would be used", async () => {
    const source = await import("./today-session.source");
    vi.mocked(source.fetchTodaySessionRaw).mockRejectedValue(
      new FetchBoundaryError("NETWORK_ERROR", "Network request failed")
    );

    const { loadTodaySessionContentWithDiagnostics } = await import("./today-session.loader");

    await expect(
      loadTodaySessionContentWithDiagnostics({ strictIntegration: true })
    ).rejects.toThrow(/strict integration check failed/i);
  });

  it("serves cache-first payload when today cache is already warmed", async () => {
    const source = await import("./today-session.source");
    vi.mocked(source.fetchTodaySessionRaw).mockResolvedValue(basePayload);

    const { loadTodaySessionContentWithDiagnostics, warmTodaySessionCache } = await import("./today-session.loader");

    await warmTodaySessionCache({ previewDate: "2026-03-21" });

    vi.mocked(source.fetchTodaySessionRaw).mockRejectedValue(
      new FetchBoundaryError("NETWORK_ERROR", "Network request failed")
    );

    const loaded = await loadTodaySessionContentWithDiagnostics({ previewDate: "2026-03-21" });

    expect(loaded.diagnostics.sourceStatus).toBe("cache_fresh");
    expect(loaded.content.verseReference).toBe("Mazmur 23:1");
  });

  it("serves last-known-good cached payload when fresh fetch fails", async () => {
    const source = await import("./today-session.source");
    vi.mocked(source.fetchTodaySessionRaw).mockResolvedValue(basePayload);

    const { loadTodaySessionContentWithDiagnostics, warmTodaySessionCache } = await import("./today-session.loader");

    await warmTodaySessionCache({ previewDate: "2026-03-20" });

    vi.mocked(source.fetchTodaySessionRaw).mockRejectedValue(
      new FetchBoundaryError("NETWORK_ERROR", "Network request failed")
    );

    const loaded = await loadTodaySessionContentWithDiagnostics({ previewDate: "2026-03-21" });

    expect(loaded.diagnostics.sourceStatus).toBe("cache_stale");
    expect(loaded.content.openingLine).toBe(basePayload.openingLine);
  });
});
