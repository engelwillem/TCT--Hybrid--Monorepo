import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const loadTodaySessionContentWithDiagnosticsMock = vi.fn();
const warmTodaySessionCacheMock = vi.fn();

vi.mock("@/features/today-ritual/data/today-session.loader", () => ({
  loadTodaySessionContentWithDiagnostics: loadTodaySessionContentWithDiagnosticsMock,
  warmTodaySessionCache: warmTodaySessionCacheMock,
}));

describe("GET /api/today/readiness", () => {
  it("returns readiness payload when fallback content is active", async () => {
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
    expect(body.ok).toBe(true);
    expect(body.hasOfflineFallback).toBe(false);
    expect(body.message).toContain("fallback");
  });

  it("returns readiness payload with fallback flags", async () => {
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
    expect(body.ok).toBe(true);
    expect(body.hasOfflineFallback).toBe(true);
  });

  it("returns 503 when loader fails", async () => {
    const { GET } = await import("./route");
    loadTodaySessionContentWithDiagnosticsMock.mockRejectedValue(new Error("network down"));

    const request = new NextRequest("http://localhost:9002/api/today/readiness?warm=1");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.ok).toBe(false);
    expect(body.message).toContain("network down");
  });

  it("returns 503 in strict mode when fallback is active", async () => {
    vi.stubEnv("NODE_ENV", "production");
    try {
      const { GET } = await import("./route");
      loadTodaySessionContentWithDiagnosticsMock.mockResolvedValue({
        content: {},
        diagnostics: {
          sourceStatus: "fallback_only",
          hasOfflineFallback: true,
        },
      });
      const request = new NextRequest("http://localhost:9002/api/today/readiness?strict=1");
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(503);
      expect(body.ok).toBe(false);
      expect(body.strict).toBe(true);
      expect(body.sourceStatus).toBe("fallback_only");
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
