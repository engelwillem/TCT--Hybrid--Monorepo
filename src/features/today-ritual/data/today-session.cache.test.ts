import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DailySessionCacheArtifact } from "./today-session.cache";

const callLaravelApiMock = vi.fn();

vi.mock("@/lib/laravel-api", () => ({
  callLaravelApi: callLaravelApiMock,
}));

function createArtifact(date: string, lang = "id"): DailySessionCacheArtifact {
  const nowMs = Date.now();
  return {
    key: `today-session:${date}:${lang}`,
    date,
    lang,
    raw: {
      contractVersion: "today.session.v1",
      openingLine: "Pembuka",
      verse: { text: "Ayat", reference: "Mazmur 23:1" },
      reflection: { prompt: "Prompt" },
      prayer: { text: "Doa" },
      completion: { title: "Judul", body: "Isi", tomorrowCueText: "Besok" },
    },
    fetchedAtMs: nowMs,
    expiresAtMs: nowMs + 900_000,
  };
}

describe("today-session cache adapter", () => {
  beforeEach(() => {
    process.env.TODAY_SESSION_CACHE_ADAPTER = "laravel";
    process.env.TODAY_SESSION_CACHE_ALLOW_MEMORY_FALLBACK = "false";
    process.env.TODAY_SESSION_ARTIFACT_TOKEN = "internal-token";
    callLaravelApiMock.mockReset();
  });

  afterEach(async () => {
    const cache = await import("./today-session.cache");
    cache.__resetTodaySessionCacheForTests();
    vi.resetModules();
    delete process.env.TODAY_SESSION_CACHE_ADAPTER;
    delete process.env.TODAY_SESSION_CACHE_ALLOW_MEMORY_FALLBACK;
    delete process.env.TODAY_SESSION_ARTIFACT_TOKEN;
  });

  it("reads and writes through durable Laravel artifact endpoint", async () => {
    const store = new Map<string, DailySessionCacheArtifact>();
    const latestByLang = new Map<string, DailySessionCacheArtifact>();

    callLaravelApiMock.mockImplementation(async (path: string, init?: RequestInit) => {
      const method = (init?.method ?? "GET").toUpperCase();
      if (method === "PUT" && path === "/api/v1/today/session-artifact") {
        const body = JSON.parse(String(init?.body ?? "{}")) as {
          key?: string;
          artifact?: DailySessionCacheArtifact;
        };
        if (body.key && body.artifact) {
          store.set(body.key, body.artifact);
          latestByLang.set(body.artifact.lang, body.artifact);
        }
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      if (method === "GET" && path.startsWith("/api/v1/today/session-artifact/latest?")) {
        const query = new URLSearchParams(path.split("?")[1] ?? "");
        const lang = query.get("lang") ?? "id";
        const artifact = latestByLang.get(lang);
        if (!artifact) return new Response(JSON.stringify({ ok: false }), { status: 404 });
        return new Response(JSON.stringify({ ok: true, artifact }), { status: 200 });
      }

      if (method === "GET" && path.startsWith("/api/v1/today/session-artifact?")) {
        const query = new URLSearchParams(path.split("?")[1] ?? "");
        const key = query.get("key") ?? "";
        const artifact = store.get(key);
        if (!artifact) return new Response(JSON.stringify({ ok: false }), { status: 404 });
        return new Response(JSON.stringify({ ok: true, artifact }), { status: 200 });
      }

      if (method === "DELETE") {
        const query = new URLSearchParams(path.split("?")[1] ?? "");
        const key = query.get("key") ?? "";
        store.delete(key);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      return new Response(JSON.stringify({ ok: false }), { status: 404 });
    });

    const cache = await import("./today-session.cache");
    const context = cache.resolveDailySessionCacheContext({ previewDate: "2026-03-21", lang: "id" });
    const artifact = createArtifact("2026-03-21");
    await cache.writeDailySessionCacheArtifact(context, artifact.raw, { ttlSeconds: 900 });

    const fetched = await cache.getDailySessionCacheArtifact(context);
    expect(fetched?.key).toBe(context.key);

    const latest = await cache.getLastKnownGoodDailySession({ lang: "id" });
    expect(latest?.date).toBe("2026-03-21");
  });

  it("uses explicit memory fallback when durable adapter errors and fallback is allowed", async () => {
    process.env.TODAY_SESSION_CACHE_ALLOW_MEMORY_FALLBACK = "true";
    callLaravelApiMock.mockRejectedValue(new Error("durable down"));

    const cache = await import("./today-session.cache");
    const context = cache.resolveDailySessionCacheContext({ previewDate: "2026-03-21", lang: "id" });
    const artifact = createArtifact("2026-03-21");
    await cache.writeDailySessionCacheArtifact(context, artifact.raw, { ttlSeconds: 900 });

    const fetched = await cache.getDailySessionCacheArtifact(context);
    expect(fetched?.date).toBe("2026-03-21");
    expect(callLaravelApiMock).toHaveBeenCalled();
  });
});
