import { buildTodaySessionMock } from '../content/today-session.mock';
import type { TodaySessionContent } from '../content/today-session.types';
import type { ContentFieldIssue, TodaySessionSourceStatus } from './today-session.diagnostics';
import { summarizeDiagnostics } from './today-session.diagnostics';
import { FetchBoundaryError } from './fetch-json';
import {
  getCacheTtlSeconds,
  getDailySessionCacheArtifact,
  getLastKnownGoodDailySession,
  isDailySessionCacheFresh,
  resolveDailySessionCacheContext,
  startDailySessionRefresh,
  writeDailySessionCacheArtifact,
} from './today-session.cache';
import { resolveRenunganExperienceState } from './today-session.experience';
import { mapRawToTodaySessionContentWithDiagnostics } from './today-session.mapper';
import { fetchTodaySessionRaw, isTodaySessionUsingExpectedLocalFallback } from './today-session.source';

type LoadTodaySessionContentOptions = {
  previewDate?: string | null;
  forwardedHeaders?: HeadersInit;
  strictIntegration?: boolean;
  lang?: string | null;
  bypassCache?: boolean;
};

export type LoadedTodaySession = {
  content: TodaySessionContent;
  diagnostics: {
    sourceStatus: TodaySessionSourceStatus;
    experienceState: 'healthy' | 'degraded' | 'fallback';
    hasOfflineFallback: boolean;
    missingRequiredFieldsCount: number;
    fallbackNotableCount: number;
    warnCount: number;
    recommendedActions: string[];
  };
};

type WarmTodaySessionCacheResult = {
  ok: boolean;
  sourceStatus: TodaySessionSourceStatus;
  cacheKey: string;
  date: string;
  lang: string;
};

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }
  return fallback;
}

function getBackgroundRefreshCooldownMs(): number {
  return parsePositiveInt(process.env.TODAY_SESSION_BACKGROUND_REFRESH_COOLDOWN_MS, 60_000);
}

function hasAuthForwardingHeaders(headers?: HeadersInit): boolean {
  if (!headers) return false;
  const normalized = new Headers(headers);
  return normalized.has('authorization') || normalized.has('cookie');
}

function buildSourceIssueFromError(
  error: unknown,
  expectedLocalFallback: boolean,
  status: TodaySessionSourceStatus = 'fallback_only'
): ContentFieldIssue {
  if (error instanceof FetchBoundaryError) {
    return {
      owner: expectedLocalFallback ? 'frontend' : 'backend',
      category: 'source_reliability',
      severity: status === 'fallback_only' ? (expectedLocalFallback ? 'info' : 'warn') : 'warn',
      field: '$source',
      message: expectedLocalFallback
        ? `LOCAL_FALLBACK_ACTIVE: ${error.code}: ${error.message}`
        : `${error.code}: ${error.message}`,
      recommendedAction: expectedLocalFallback
        ? 'Start Laravel locally or point LARAVEL_API_BASE_URL to a reachable parity backend before release verification.'
        : 'Check Laravel/CMS endpoint reliability, timeout, and response status.',
    };
  }

  return {
    owner: 'frontend',
    category: 'source_reliability',
    severity: status === 'fallback_only' ? 'warn' : 'info',
    field: '$source',
    message: 'UNKNOWN_SOURCE_ERROR: Unexpected source error, fallback to defaults',
    recommendedAction: 'Inspect frontend loader/source for unexpected runtime errors.',
  };
}

function addDefaultFallbackIssue(
  issues: ContentFieldIssue[],
  expectedLocalFallback: boolean
): void {
  issues.push({
    owner: expectedLocalFallback ? 'frontend' : 'backend',
    category: 'source_reliability',
    severity: 'info',
    field: '$source',
    message: expectedLocalFallback
      ? 'LOCAL_FALLBACK_ACTIVE: No external payload available, using fallback defaults'
      : 'No external payload available, using fallback defaults',
    recommendedAction: expectedLocalFallback
      ? 'Use local fallback during UI work, then reconnect Laravel or staging before parity validation.'
      : 'Check Laravel API connectivity or set TODAY_SESSION_ENDPOINT when needed.',
  });
}

function triggerBackgroundRefresh(context: ReturnType<typeof resolveDailySessionCacheContext>, options: {
  previewDate?: string | null;
  forwardedHeaders?: HeadersInit;
}): void {
  const refresh = startDailySessionRefresh(
    context,
    async () =>
      fetchTodaySessionRaw({
        previewDate: options.previewDate,
        forwardedHeaders: options.forwardedHeaders,
      }),
    {
      ttlSeconds: getCacheTtlSeconds(),
      minRefreshIntervalMs: getBackgroundRefreshCooldownMs(),
    }
  );

  if (refresh) {
    void refresh.then((artifact) => {
      if (!artifact) {
        console.warn('[today] background cache refresh failed', {
          cacheKey: context.key,
          date: context.date,
          lang: context.lang,
        });
      }
    });
  }
}

function finalizeLoadedSession(
  rawSession: Awaited<ReturnType<typeof fetchTodaySessionRaw>>,
  sourceStatus: TodaySessionSourceStatus,
  expectedLocalFallback: boolean,
  baseContent: TodaySessionContent,
  options: {
    previewDate?: string | null;
    issues?: ContentFieldIssue[];
  }
): LoadedTodaySession {
  const { content, diagnostics } = mapRawToTodaySessionContentWithDiagnostics(rawSession, baseContent, {
    sourceStatus,
  });

  for (const issue of options.issues ?? []) {
    diagnostics.issues.push(issue);
  }

  if (sourceStatus === 'fallback_only' && (options.issues?.length ?? 0) === 0) {
    addDefaultFallbackIssue(diagnostics.issues, expectedLocalFallback);
  }

  const summary = summarizeDiagnostics(diagnostics);
  const integrationTraceMode = process.env.TODAY_INTEGRATION_TRACE === 'true';
  const shouldLog =
    integrationTraceMode ||
    summary.notable ||
    sourceStatus !== 'cache_fresh' ||
    diagnostics.missingRequiredFields.length > 0;

  if (shouldLog) {
    const method = summary.warnCount > 0 ? console.warn : console.info;
    method('[today] content diagnostics', {
      sourceStatus: diagnostics.sourceStatus,
      previewDateRequested: options.previewDate ?? null,
      contract: {
        expected: diagnostics.contractVersionExpected,
        received: diagnostics.contractVersionReceived,
      },
      metrics: diagnostics.metrics,
      summary,
      missingRequiredFields: diagnostics.missingRequiredFields,
      issues: diagnostics.issues.slice(0, 12),
    });
  }

  return {
    content,
    diagnostics: {
      sourceStatus: diagnostics.sourceStatus,
      experienceState: resolveRenunganExperienceState({
        sourceStatus: diagnostics.sourceStatus,
        missingRequiredFieldsCount: diagnostics.missingRequiredFields.length,
        hasOfflineFallback: diagnostics.sourceStatus === 'fallback_only',
      }),
      hasOfflineFallback: diagnostics.sourceStatus === 'fallback_only',
      missingRequiredFieldsCount: diagnostics.missingRequiredFields.length,
      fallbackNotableCount: diagnostics.metrics.fallbackNotableCount,
      warnCount: summary.warnCount,
      recommendedActions: summary.recommendedActions,
    },
  };
}

export async function loadTodaySessionContentWithDiagnostics(
  options: LoadTodaySessionContentOptions = {}
): Promise<LoadedTodaySession> {
  const strictIntegrationMode = options.strictIntegration ?? process.env.TODAY_STRICT_INTEGRATION === 'true';
  const expectedLocalFallback = isTodaySessionUsingExpectedLocalFallback();
  const useSharedCache = !hasAuthForwardingHeaders(options.forwardedHeaders) && !options.bypassCache;
  const preferCache = useSharedCache && !strictIntegrationMode;
  const cacheContext = resolveDailySessionCacheContext({
    previewDate: options.previewDate,
    lang: options.lang,
  });
  const baseContent = buildTodaySessionMock({ sessionDate: cacheContext.date });
  const finalizeWithStrictCheck = (loaded: LoadedTodaySession): LoadedTodaySession => {
    const strictFailure =
      strictIntegrationMode &&
      (loaded.diagnostics.sourceStatus !== 'external_live' || loaded.diagnostics.warnCount > 0);

    if (strictFailure) {
      throw new Error(
        `[today] strict integration check failed: sourceStatus=${loaded.diagnostics.sourceStatus}, warnCount=${loaded.diagnostics.warnCount}`
      );
    }

    return loaded;
  };

  if (preferCache) {
    const todayArtifact = await getDailySessionCacheArtifact(cacheContext);
    if (todayArtifact) {
      if (isDailySessionCacheFresh(todayArtifact)) {
        return finalizeWithStrictCheck(
          finalizeLoadedSession(todayArtifact.raw, 'cache_fresh', expectedLocalFallback, baseContent, {
            previewDate: options.previewDate,
          })
        );
      }

      triggerBackgroundRefresh(cacheContext, {
        previewDate: options.previewDate,
        forwardedHeaders: options.forwardedHeaders,
      });

      const staleIssue: ContentFieldIssue = {
        owner: 'frontend',
        category: 'source_reliability',
        severity: 'info',
        field: '$source',
        message: 'Serving stale cached daily session while background refresh runs.',
        recommendedAction: 'Monitor backend source reliability and warm today cache on deployment/restart.',
      };

      return finalizeWithStrictCheck(
        finalizeLoadedSession(todayArtifact.raw, 'cache_stale', expectedLocalFallback, baseContent, {
          previewDate: options.previewDate,
          issues: [staleIssue],
        })
      );
    }
  }

  try {
    const liveRaw = await fetchTodaySessionRaw({
      previewDate: options.previewDate,
      forwardedHeaders: options.forwardedHeaders,
    });

    if (!liveRaw) {
      throw new FetchBoundaryError('INVALID_PAYLOAD_SHAPE', 'Source returned an empty payload');
    }

    if (useSharedCache) {
      await writeDailySessionCacheArtifact(cacheContext, liveRaw, { ttlSeconds: getCacheTtlSeconds() });
    }

    return finalizeWithStrictCheck(
      finalizeLoadedSession(liveRaw, 'external_live', expectedLocalFallback, baseContent, {
        previewDate: options.previewDate,
      })
    );
  } catch (error) {
    const sourceIssue = buildSourceIssueFromError(error, expectedLocalFallback);

    if (useSharedCache) {
      const todayArtifact = await getDailySessionCacheArtifact(cacheContext);
      if (todayArtifact) {
        triggerBackgroundRefresh(cacheContext, {
          previewDate: options.previewDate,
          forwardedHeaders: options.forwardedHeaders,
        });

        return finalizeWithStrictCheck(
          finalizeLoadedSession(todayArtifact.raw, 'cache_stale', expectedLocalFallback, baseContent, {
            previewDate: options.previewDate,
            issues: [
              sourceIssue,
              {
                owner: 'frontend',
                category: 'source_reliability',
                severity: 'info',
                field: '$cache',
                message: `Using stale cached session for ${cacheContext.date}.`,
                recommendedAction: 'Warm today cache using /api/today/readiness?warm=1 during rollout windows.',
              },
            ],
          })
        );
      }

      const lastKnownGood = await getLastKnownGoodDailySession({
        lang: cacheContext.lang,
        excludeDate: cacheContext.date,
      });
      if (lastKnownGood) {
        return finalizeWithStrictCheck(
          finalizeLoadedSession(lastKnownGood.raw, 'cache_stale', expectedLocalFallback, baseContent, {
            previewDate: options.previewDate,
            issues: [
              sourceIssue,
              {
                owner: 'frontend',
                category: 'source_reliability',
                severity: 'warn',
                field: '$cache',
                message: `Serving last-known-good session from ${lastKnownGood.date}.`,
                recommendedAction: 'Recover upstream feed and warm the current day cache as soon as possible.',
              },
            ],
          })
        );
      }
    }

    return finalizeWithStrictCheck(
      finalizeLoadedSession(null, 'fallback_only', expectedLocalFallback, baseContent, {
        previewDate: options.previewDate,
        issues: [sourceIssue],
      })
    );
  }
}

export async function warmTodaySessionCache(
  options: Omit<LoadTodaySessionContentOptions, 'strictIntegration' | 'bypassCache'> = {}
): Promise<WarmTodaySessionCacheResult> {
  const cacheContext = resolveDailySessionCacheContext({
    previewDate: options.previewDate,
    lang: options.lang,
  });

  const refresh = startDailySessionRefresh(
    cacheContext,
    async () =>
      fetchTodaySessionRaw({
        previewDate: options.previewDate,
        forwardedHeaders: options.forwardedHeaders,
      }),
    {
      ttlSeconds: getCacheTtlSeconds(),
      minRefreshIntervalMs: 0,
    }
  );

  if (refresh) {
    const refreshed = await refresh;
    if (refreshed) {
      return {
        ok: true,
        sourceStatus: 'external_live',
        cacheKey: cacheContext.key,
        date: cacheContext.date,
        lang: cacheContext.lang,
      };
    }
  }

  const current = await getDailySessionCacheArtifact(cacheContext);
  if (current) {
    return {
      ok: true,
      sourceStatus: isDailySessionCacheFresh(current) ? 'cache_fresh' : 'cache_stale',
      cacheKey: cacheContext.key,
      date: cacheContext.date,
      lang: cacheContext.lang,
    };
  }

  return {
    ok: false,
    sourceStatus: 'fallback_only',
    cacheKey: cacheContext.key,
    date: cacheContext.date,
    lang: cacheContext.lang,
  };
}

export async function loadTodaySessionContent(
  options: LoadTodaySessionContentOptions = {}
): Promise<TodaySessionContent> {
  const loaded = await loadTodaySessionContentWithDiagnostics(options);
  return loaded.content;
}

export async function loadRenunganSessionContentWithDiagnostics(
  options: LoadTodaySessionContentOptions = {}
): Promise<LoadedTodaySession> {
  return loadTodaySessionContentWithDiagnostics(options);
}
