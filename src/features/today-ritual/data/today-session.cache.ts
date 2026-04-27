import { callLaravelApi } from '@/lib/laravel-api';
import type { RawTodaySessionPayload } from './today-session.source';

const CACHE_TIME_ZONE = 'Asia/Jakarta';
const DEFAULT_CACHE_TTL_SECONDS = 900;
const DEFAULT_CACHE_MAX_AGE_DAYS = 3;
const DEFAULT_CACHE_LANG = 'id';
const GLOBAL_MEMORY_STORE_KEY = '__TCT_TODAY_SESSION_MEMORY_STORE__';
const GLOBAL_REFRESH_STORE_KEY = '__TCT_TODAY_SESSION_REFRESH_STORE__';

export type DailySessionCacheContext = {
  date: string;
  lang: string;
  key: string;
};

export type DailySessionCacheArtifact = {
  key: string;
  date: string;
  lang: string;
  raw: RawTodaySessionPayload;
  fetchedAtMs: number;
  expiresAtMs: number;
};

type RefreshStore = {
  inFlightRefreshes: Map<string, Promise<DailySessionCacheArtifact | null>>;
  lastRefreshAttemptMs: Map<string, number>;
};

type DailySessionCacheAdapter = {
  kind: 'durable_laravel' | 'memory';
  get: (key: string) => Promise<DailySessionCacheArtifact | null>;
  set: (key: string, artifact: DailySessionCacheArtifact, ttlSeconds: number) => Promise<void>;
  delete: (key: string) => Promise<void>;
  getLatestByLang: (lang: string, options?: { maxAgeDays?: number; excludeDate?: string | null }) => Promise<DailySessionCacheArtifact | null>;
};

function getRefreshStore(): RefreshStore {
  const scope = globalThis as typeof globalThis & {
    [GLOBAL_REFRESH_STORE_KEY]?: RefreshStore;
  };

  if (!scope[GLOBAL_REFRESH_STORE_KEY]) {
    scope[GLOBAL_REFRESH_STORE_KEY] = {
      inFlightRefreshes: new Map<string, Promise<DailySessionCacheArtifact | null>>(),
      lastRefreshAttemptMs: new Map<string, number>(),
    };
  }

  return scope[GLOBAL_REFRESH_STORE_KEY];
}

function getMemoryEntries(): Map<string, DailySessionCacheArtifact> {
  const scope = globalThis as typeof globalThis & {
    [GLOBAL_MEMORY_STORE_KEY]?: Map<string, DailySessionCacheArtifact>;
  };

  if (!scope[GLOBAL_MEMORY_STORE_KEY]) {
    scope[GLOBAL_MEMORY_STORE_KEY] = new Map<string, DailySessionCacheArtifact>();
  }

  return scope[GLOBAL_MEMORY_STORE_KEY];
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }
  return fallback;
}

export function getCacheTtlSeconds(): number {
  return parsePositiveInt(process.env.TODAY_SESSION_CACHE_TTL_SECONDS, DEFAULT_CACHE_TTL_SECONDS);
}

export function getCacheMaxAgeDays(): number {
  return parsePositiveInt(process.env.TODAY_SESSION_CACHE_MAX_AGE_DAYS, DEFAULT_CACHE_MAX_AGE_DAYS);
}

function getArtifactApiToken(): string | null {
  const raw = process.env.TODAY_SESSION_ARTIFACT_TOKEN?.trim();
  return raw ? raw : null;
}

function getArtifactRequestHeaders(): HeadersInit {
  const token = getArtifactApiToken();
  return token ? { 'x-today-artifact-token': token } : {};
}

function shouldPreferDurableCache(): boolean {
  const configured = process.env.TODAY_SESSION_CACHE_ADAPTER?.trim().toLowerCase();
  return configured !== 'memory';
}

function isMemoryFallbackAllowed(): boolean {
  return process.env.TODAY_SESSION_CACHE_ALLOW_MEMORY_FALLBACK === 'true' || process.env.NODE_ENV !== 'production';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidArtifact(value: unknown): value is DailySessionCacheArtifact {
  if (!isRecord(value)) return false;
  if (typeof value.key !== 'string') return false;
  if (typeof value.date !== 'string') return false;
  if (typeof value.lang !== 'string') return false;
  if (!isRecord(value.raw)) return false;
  if (typeof value.fetchedAtMs !== 'number') return false;
  if (typeof value.expiresAtMs !== 'number') return false;
  return true;
}

async function parseArtifactResponse(response: Response): Promise<DailySessionCacheArtifact | null> {
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`artifact cache responded with ${response.status}`);
  }

  const body = (await response.json()) as unknown;
  if (!isRecord(body)) return null;
  const artifact = body.artifact;
  return isValidArtifact(artifact) ? artifact : null;
}

function pruneMemoryEntries(nowMs = Date.now()): void {
  const maxAgeMs = getCacheMaxAgeDays() * 24 * 60 * 60 * 1000;
  const oldestAllowedMs = nowMs - maxAgeMs;
  const entries = getMemoryEntries();
  for (const [key, artifact] of entries) {
    if (artifact.fetchedAtMs < oldestAllowedMs) {
      entries.delete(key);
    }
  }
}

const memoryAdapter: DailySessionCacheAdapter = {
  kind: 'memory',
  async get(key) {
    pruneMemoryEntries();
    return getMemoryEntries().get(key) ?? null;
  },
  async set(key, artifact) {
    getMemoryEntries().set(key, artifact);
    pruneMemoryEntries();
  },
  async delete(key) {
    getMemoryEntries().delete(key);
  },
  async getLatestByLang(lang, options = {}) {
    pruneMemoryEntries();
    const excludeDate = options.excludeDate?.trim() || null;
    let newest: DailySessionCacheArtifact | null = null;
    for (const artifact of getMemoryEntries().values()) {
      if (artifact.lang !== lang) continue;
      if (excludeDate && artifact.date === excludeDate) continue;
      if (!newest || artifact.fetchedAtMs > newest.fetchedAtMs) {
        newest = artifact;
      }
    }
    return newest;
  },
};

const durableLaravelAdapter: DailySessionCacheAdapter = {
  kind: 'durable_laravel',
  async get(key) {
    const response = await callLaravelApi(`/api/v1/today/session-artifact?key=${encodeURIComponent(key)}`, {
      method: 'GET',
      headers: getArtifactRequestHeaders(),
    });
    return parseArtifactResponse(response);
  },
  async set(key, artifact, ttlSeconds) {
    const response = await callLaravelApi('/api/v1/today/session-artifact', {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        ...getArtifactRequestHeaders(),
      },
      body: JSON.stringify({
        key,
        artifact,
        ttlSeconds,
      }),
    });

    if (!response.ok) {
      throw new Error(`artifact cache write failed with ${response.status}`);
    }
  },
  async delete(key) {
    const response = await callLaravelApi(`/api/v1/today/session-artifact?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers: getArtifactRequestHeaders(),
    });

    if (!response.ok && response.status !== 404) {
      throw new Error(`artifact cache delete failed with ${response.status}`);
    }
  },
  async getLatestByLang(lang, options = {}) {
    const maxAgeDays = options.maxAgeDays ?? getCacheMaxAgeDays();
    const excludeDate = options.excludeDate?.trim() || '';
    const query = new URLSearchParams({
      lang,
      maxAgeDays: String(maxAgeDays),
    });
    if (excludeDate) {
      query.set('excludeDate', excludeDate);
    }

    const response = await callLaravelApi(`/api/v1/today/session-artifact/latest?${query.toString()}`, {
      method: 'GET',
      headers: getArtifactRequestHeaders(),
    });
    return parseArtifactResponse(response);
  },
};

function getPrimaryAdapter(): DailySessionCacheAdapter {
  return shouldPreferDurableCache() ? durableLaravelAdapter : memoryAdapter;
}

function getFallbackAdapter(): DailySessionCacheAdapter | null {
  if (!shouldPreferDurableCache()) return null;
  return isMemoryFallbackAllowed() ? memoryAdapter : null;
}

async function executeWithAdapterFallback<T>(operation: {
  onPrimary: (adapter: DailySessionCacheAdapter) => Promise<T>;
  onFallback: (adapter: DailySessionCacheAdapter) => Promise<T>;
  fallbackValue: T;
  logContext: string;
}): Promise<T> {
  const primary = getPrimaryAdapter();
  const fallback = getFallbackAdapter();

  try {
    return await operation.onPrimary(primary);
  } catch (error) {
    console.warn('[today] cache adapter primary operation failed', {
      adapter: primary.kind,
      context: operation.logContext,
      message: error instanceof Error ? error.message : String(error),
      fallbackEnabled: fallback !== null,
    });

    if (!fallback) {
      return operation.fallbackValue;
    }

    try {
      return await operation.onFallback(fallback);
    } catch (fallbackError) {
      console.warn('[today] cache adapter fallback operation failed', {
        adapter: fallback.kind,
        context: operation.logContext,
        message: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
      });
      return operation.fallbackValue;
    }
  }
}

export function normalizeSessionDateInput(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

function deriveJakartaDate(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CACHE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const year = parts.find((part) => part.type === 'year')?.value ?? '1970';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';
  return `${year}-${month}-${day}`;
}

export function buildDailySessionCacheKey(date: string, lang: string = DEFAULT_CACHE_LANG): string {
  return `today-session:${date}:${lang}`;
}

export function resolveDailySessionCacheContext(options: {
  previewDate?: string | null;
  lang?: string | null;
  now?: Date;
} = {}): DailySessionCacheContext {
  const now = options.now ?? new Date();
  const date = normalizeSessionDateInput(options.previewDate) ?? deriveJakartaDate(now);
  const lang = options.lang?.trim() || DEFAULT_CACHE_LANG;
  return {
    date,
    lang,
    key: buildDailySessionCacheKey(date, lang),
  };
}

export async function getDailySessionCacheArtifact(
  context: DailySessionCacheContext
): Promise<DailySessionCacheArtifact | null> {
  return executeWithAdapterFallback({
    onPrimary: (adapter) => adapter.get(context.key),
    onFallback: (adapter) => adapter.get(context.key),
    fallbackValue: null,
    logContext: `get:${context.key}`,
  });
}

export function isDailySessionCacheFresh(artifact: DailySessionCacheArtifact, nowMs = Date.now()): boolean {
  return artifact.expiresAtMs > nowMs;
}

export async function getLastKnownGoodDailySession(options: {
  lang?: string | null;
  excludeDate?: string | null;
  maxAgeDays?: number;
} = {}): Promise<DailySessionCacheArtifact | null> {
  const lang = options.lang?.trim() || DEFAULT_CACHE_LANG;
  const maxAgeDays = options.maxAgeDays ?? getCacheMaxAgeDays();
  const excludeDate = options.excludeDate?.trim() || null;

  return executeWithAdapterFallback({
    onPrimary: (adapter) => adapter.getLatestByLang(lang, { maxAgeDays, excludeDate }),
    onFallback: (adapter) => adapter.getLatestByLang(lang, { maxAgeDays, excludeDate }),
    fallbackValue: null,
    logContext: `getLatest:${lang}`,
  });
}

export async function writeDailySessionCacheArtifact(
  context: DailySessionCacheContext,
  raw: RawTodaySessionPayload,
  options: { ttlSeconds?: number } = {}
): Promise<DailySessionCacheArtifact> {
  const nowMs = Date.now();
  const ttlSeconds = options.ttlSeconds ?? getCacheTtlSeconds();
  const artifact: DailySessionCacheArtifact = {
    key: context.key,
    date: context.date,
    lang: context.lang,
    raw,
    fetchedAtMs: nowMs,
    expiresAtMs: nowMs + Math.max(1, ttlSeconds) * 1000,
  };

  await executeWithAdapterFallback({
    onPrimary: async (adapter) => adapter.set(context.key, artifact, ttlSeconds),
    onFallback: async (adapter) => adapter.set(context.key, artifact, ttlSeconds),
    fallbackValue: undefined,
    logContext: `set:${context.key}`,
  });

  return artifact;
}

export async function deleteDailySessionCacheArtifact(context: DailySessionCacheContext): Promise<void> {
  await executeWithAdapterFallback({
    onPrimary: async (adapter) => adapter.delete(context.key),
    onFallback: async (adapter) => adapter.delete(context.key),
    fallbackValue: undefined,
    logContext: `delete:${context.key}`,
  });
}

export function getInFlightDailySessionRefresh(
  context: DailySessionCacheContext
): Promise<DailySessionCacheArtifact | null> | null {
  return getRefreshStore().inFlightRefreshes.get(context.key) ?? null;
}

export function startDailySessionRefresh(
  context: DailySessionCacheContext,
  refreshFn: () => Promise<RawTodaySessionPayload | null>,
  options: { ttlSeconds?: number; minRefreshIntervalMs?: number } = {}
): Promise<DailySessionCacheArtifact | null> | null {
  const refreshStore = getRefreshStore();
  const existingInFlight = refreshStore.inFlightRefreshes.get(context.key);
  if (existingInFlight) {
    return existingInFlight;
  }

  const nowMs = Date.now();
  const minRefreshIntervalMs = options.minRefreshIntervalMs ?? 60_000;
  const lastAttemptMs = refreshStore.lastRefreshAttemptMs.get(context.key) ?? 0;
  if (nowMs - lastAttemptMs < minRefreshIntervalMs) {
    return null;
  }

  refreshStore.lastRefreshAttemptMs.set(context.key, nowMs);

  const promise = refreshFn()
    .then(async (raw) => {
      if (!raw) return null;
      return writeDailySessionCacheArtifact(context, raw, { ttlSeconds: options.ttlSeconds });
    })
    .catch(() => null)
    .finally(() => {
      const current = refreshStore.inFlightRefreshes.get(context.key);
      if (current === promise) {
        refreshStore.inFlightRefreshes.delete(context.key);
      }
    });

  refreshStore.inFlightRefreshes.set(context.key, promise);
  return promise;
}

export function __resetTodaySessionCacheForTests(): void {
  getMemoryEntries().clear();
  const refreshStore = getRefreshStore();
  refreshStore.inFlightRefreshes.clear();
  refreshStore.lastRefreshAttemptMs.clear();
}
