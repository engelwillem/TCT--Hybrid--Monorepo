import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const loadTodaySessionContentWithDiagnosticsMock = vi.fn();
const warmTodaySessionCacheMock = vi.fn();

vi.mock("@/features/today-ritual/data/today-session.loader", () => ({
  loadTodaySessionContentWithDiagnostics: loadTodaySessionContentWithDiagnosticsMock,
  warmTodaySessionCache: warmTodaySessionCacheMock,
}));

describe("GET /api/today/readiness", () => {
  it("reports stale-but-safe as infra stale with no UX risk", async () => {
    const { GET } = await import("./route");
    loadTodaySessionContentWithDiagnosticsMock.mockResolvedValue({
      content: {},
      diagnostics: {
        sourceStatus: "cache_stale",
        experienceState: "healthy",
        hasOfflineFallback: false,
        missingRequiredFieldsCount: 0,
        fallbackNotableCount: 0,
        warnCount: 1,
        recommendedActions: [],
      },
    });

    const request = new NextRequest("http://localhost:9002/api/today/readiness");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.sourceStatus).toBe("cache_stale");
    expect(body.experienceState).toBe("healthy");
    expect(body.experienceAtRisk).toBe(false);
  });

  it("reports fallback_only as user-facing risk", async () => {
    const { GET } = await import("./route");
    loadTodaySessionContentWithDiagnosticsMock.mockResolvedValue({
      content: {},
      diagnostics: {
        sourceStatus: "fallback_only",
        experienceState: "fallback",
        hasOfflineFallback: true,
        missingRequiredFieldsCount: 0,
        fallbackNotableCount: 0,
        warnCount: 0,
        recommendedActions: [],
      },
    });

    const request = new NextRequest("http://localhost:9002/api/today/readiness");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.experienceAtRisk).toBe(true);
    expect(body.hasOfflineFallback).toBe(true);
  });

  it("rejects anonymous warm requests in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    try {
      const { GET } = await import("./route");
      const request = new NextRequest("http://localhost:9002/api/today/readiness?warm=1");
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.warmRequested).toBe(true);
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
