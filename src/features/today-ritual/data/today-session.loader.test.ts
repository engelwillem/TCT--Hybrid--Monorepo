import { afterEach, describe, expect, it, vi } from "vitest";
import { FetchBoundaryError } from "./fetch-json";

vi.mock("./today-session.source", () => ({
  fetchTodaySessionRaw: vi.fn(),
  isTodaySessionUsingExpectedLocalFallback: vi.fn(() => false),
}));

describe("loadTodaySessionContentWithDiagnostics", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

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
});
