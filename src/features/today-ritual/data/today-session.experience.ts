import type { TodaySessionSourceStatus } from './today-session.diagnostics';

export type RenunganExperienceState = 'healthy' | 'degraded' | 'fallback';

export function resolveRenunganExperienceState(options: {
  sourceStatus: TodaySessionSourceStatus;
  missingRequiredFieldsCount?: number;
  hasOfflineFallback?: boolean;
}): RenunganExperienceState {
  const missingRequiredFieldsCount = options.missingRequiredFieldsCount ?? 0;
  const hasOfflineFallback = options.hasOfflineFallback ?? options.sourceStatus === 'fallback_only';

  if (options.sourceStatus === 'fallback_only' || hasOfflineFallback) {
    return 'fallback';
  }

  // Cache staleness alone is an infrastructure concern and should remain calm/invisible in ritual UX.
  if (missingRequiredFieldsCount > 0) {
    return 'degraded';
  }

  return 'healthy';
}

export function isRenunganExperienceAtRisk(options: {
  sourceStatus: TodaySessionSourceStatus;
  missingRequiredFieldsCount?: number;
  hasOfflineFallback?: boolean;
}): boolean {
  return resolveRenunganExperienceState(options) !== 'healthy';
}
