import { MOCK_COMPOSER_ANALYTICS_ROWS } from "./mock-composer-analytics";
import { buildComposerSnapshot } from "./selectors";
import type { ComposerAnalyticsFilters, ComposerAnalyticsSnapshot } from "./types";

export async function getComposerAnalytics(filters: ComposerAnalyticsFilters): Promise<ComposerAnalyticsSnapshot> {
  try {
    const params = new URLSearchParams({
      timeframe: filters.timeframe,
      postType: filters.postType,
      media: filters.media,
    });

    const response = await fetch(`/api/analytics/community/composer?${params.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (response.ok) {
      const payload = (await response.json()) as ComposerAnalyticsSnapshot;
      if (payload?.overview?.openCount !== undefined) {
        return payload;
      }
    }
  } catch {
    // Fallback to mock data for MVP.
  }

  return buildComposerSnapshot(MOCK_COMPOSER_ANALYTICS_ROWS, filters);
}
