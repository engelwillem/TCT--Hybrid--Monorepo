import type {
  ComposerAnalyticsFilters,
  ComposerAnalyticsInsight,
  ComposerAnalyticsSegmentRow,
  ComposerAnalyticsSnapshot,
  ComposerAnalyticsTimeframe,
  ComposerValidationFailureKey,
} from "./types";

const POST_TYPE_ORDER = ["user_post", "reflection", "testimony", "prayer_request", "quote"] as const;

function pct(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export function filterComposerRows(rows: ComposerAnalyticsSegmentRow[], filters: ComposerAnalyticsFilters): ComposerAnalyticsSegmentRow[] {
  return rows.filter((row) => {
    if (row.timeframe !== filters.timeframe) return false;
    if (filters.postType !== "all" && row.postType !== filters.postType) return false;
    if (filters.media === "with_media" && !row.hasMedia) return false;
    if (filters.media === "without_media" && row.hasMedia) return false;
    return true;
  });
}

function sum(rows: ComposerAnalyticsSegmentRow[], selector: (row: ComposerAnalyticsSegmentRow) => number): number {
  return rows.reduce((acc, row) => acc + selector(row), 0);
}

function weightedAverageTime(rows: ComposerAnalyticsSegmentRow[]): number {
  const totalAttempts = sum(rows, (row) => row.submitSuccessCount + row.submitFailureCount);
  if (totalAttempts <= 0) return 0;

  const weighted = rows.reduce((acc, row) => {
    const attempts = row.submitSuccessCount + row.submitFailureCount;
    return acc + row.avgTimeToPostSec * attempts;
  }, 0);

  return round(weighted / totalAttempts);
}

function aggregateValidationFailures(rows: ComposerAnalyticsSegmentRow[]): Record<ComposerValidationFailureKey, number> {
  return rows.reduce<Record<ComposerValidationFailureKey, number>>(
    (acc, row) => {
      acc.text_too_short += row.validationFailures.text_too_short;
      acc.max_images += row.validationFailures.max_images;
      acc.pending_crop += row.validationFailures.pending_crop;
      acc.network_error += row.validationFailures.network_error;
      acc.unknown += row.validationFailures.unknown;
      return acc;
    },
    { text_too_short: 0, max_images: 0, pending_crop: 0, network_error: 0, unknown: 0 }
  );
}

function buildInsights(snapshot: Omit<ComposerAnalyticsSnapshot, "insights">): ComposerAnalyticsInsight[] {
  const insights: ComposerAnalyticsInsight[] = [];

  if (snapshot.overview.typingRatePct < 55) {
    insights.push({
      id: "typing-rate-low",
      tone: "warning",
      title: "Engage rate masih rendah",
      detail: `Hanya ${snapshot.overview.typingRatePct}% sesi open berlanjut ke typing. Evaluasi prompt awal dan clarity entry state.`,
    });
  }

  if (snapshot.draft.restoreRatePct >= 20 && snapshot.draft.restoredToSuccessRatePct < 45) {
    insights.push({
      id: "draft-gap",
      tone: "warning",
      title: "Draft dipulihkan, tapi belum banyak selesai diposting",
      detail: `Restore rate ${snapshot.draft.restoreRatePct}% dengan conversion restore->success ${snapshot.draft.restoredToSuccessRatePct}%. Audit friction submit/auth flow.`,
    });
  }

  if (snapshot.media.mediaSuccessRatePct > snapshot.media.textOnlySuccessRatePct + 6) {
    insights.push({
      id: "media-outperform",
      tone: "positive",
      title: "Post dengan media cenderung lebih sukses",
      detail: `Success media ${snapshot.media.mediaSuccessRatePct}% vs text-only ${snapshot.media.textOnlySuccessRatePct}%. Pertahankan flow media yang ringan.`,
    });
  }

  if (snapshot.failure.networkErrorRatePct > 6) {
    insights.push({
      id: "network-risk",
      tone: "warning",
      title: "Network failure rate meningkat",
      detail: `Sekitar ${snapshot.failure.networkErrorRatePct}% attempt gagal karena network. Perlu cek proxy/API reliability.`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "healthy-baseline",
      tone: "neutral",
      title: "Baseline composer stabil",
      detail: "Tidak ada sinyal friksi menonjol pada filter saat ini. Lanjutkan monitoring mingguan.",
    });
  }

  return insights;
}

export function buildComposerSnapshot(rows: ComposerAnalyticsSegmentRow[], filters: ComposerAnalyticsFilters): ComposerAnalyticsSnapshot {
  const filtered = filterComposerRows(rows, filters);

  const openCount = sum(filtered, (row) => row.openCount);
  const typingStartCount = sum(filtered, (row) => row.typingStartCount);
  const attachMediaCount = sum(filtered, (row) => row.attachMediaCount);
  const cropAppliedCount = sum(filtered, (row) => row.cropAppliedCount);
  const submitSuccessCount = sum(filtered, (row) => row.submitSuccessCount);
  const submitFailureCount = sum(filtered, (row) => row.submitFailureCount);
  const submitAttemptCount = submitSuccessCount + submitFailureCount;

  const draftRestoredCount = sum(filtered, (row) => row.draftRestoredCount);
  const draftRestoredSuccessCount = sum(filtered, (row) => row.draftRestoredSuccessCount);
  const abandonedDraftCount = sum(filtered, (row) => row.abandonedDraftCount);

  const mediaRows = filtered.filter((row) => row.hasMedia);
  const textRows = filtered.filter((row) => !row.hasMedia);
  const mediaAttempts = sum(mediaRows, (row) => row.submitSuccessCount + row.submitFailureCount);
  const mediaSuccess = sum(mediaRows, (row) => row.submitSuccessCount);
  const textAttempts = sum(textRows, (row) => row.submitSuccessCount + row.submitFailureCount);
  const textSuccess = sum(textRows, (row) => row.submitSuccessCount);

  const validationFailures = aggregateValidationFailures(filtered);
  const topValidationFailures = Object.entries(validationFailures)
    .map(([reason, count]) => ({ reason: reason as ComposerValidationFailureKey, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const stageOpen = openCount;
  const stageEngage = typingStartCount;
  const stagePrepare = attachMediaCount;
  const stageAttempt = submitAttemptCount;
  const stageSuccess = submitSuccessCount;

  const baseSnapshot = {
    generatedAt: new Date().toISOString(),
    filters,
    overview: {
      openCount,
      submitSuccessCount,
      submitFailureCount,
      meaningfulActivationRatePct: pct(submitSuccessCount, openCount),
      openToSuccessRatePct: pct(submitSuccessCount, openCount),
      typingRatePct: pct(typingStartCount, openCount),
      averageTimeToPostSec: weightedAverageTime(filtered),
    },
    draft: {
      restoredCount: draftRestoredCount,
      restoreRatePct: pct(draftRestoredCount, openCount),
      restoredToSuccessRatePct: pct(draftRestoredSuccessCount, draftRestoredCount),
      abandonedDraftRatioPct: pct(abandonedDraftCount, draftRestoredCount),
    },
    media: {
      attachmentRatePct: pct(attachMediaCount, openCount),
      mediaSuccessRatePct: pct(mediaSuccess, mediaAttempts),
      textOnlySuccessRatePct: pct(textSuccess, textAttempts),
      cropInteractionDensity: round(cropAppliedCount / Math.max(1, attachMediaCount)),
    },
    failure: {
      networkErrorRatePct: pct(validationFailures.network_error, submitAttemptCount),
      topValidationFailures,
    },
    funnel: [
      { key: "open" as const, label: "Open", value: stageOpen, rateFromPreviousPct: 100 },
      { key: "engage" as const, label: "Engage", value: stageEngage, rateFromPreviousPct: pct(stageEngage, stageOpen) },
      { key: "prepare" as const, label: "Prepare", value: stagePrepare, rateFromPreviousPct: pct(stagePrepare, stageEngage) },
      { key: "attempt" as const, label: "Attempt", value: stageAttempt, rateFromPreviousPct: pct(stageAttempt, stagePrepare || stageEngage) },
      { key: "success" as const, label: "Success", value: stageSuccess, rateFromPreviousPct: pct(stageSuccess, stageAttempt) },
    ],
    postTypeBreakdown: POST_TYPE_ORDER.map((postType) => {
      const postRows = filtered.filter((row) => row.postType === postType);
      const postOpen = sum(postRows, (row) => row.openCount);
      const postSuccess = sum(postRows, (row) => row.submitSuccessCount);
      return {
        postType,
        openCount: postOpen,
        submitSuccessCount: postSuccess,
        successRatePct: pct(postSuccess, postOpen),
      };
    }).filter((item) => item.openCount > 0),
  };

  return {
    ...baseSnapshot,
    insights: buildInsights(baseSnapshot),
  };
}

export function defaultComposerFilters(timeframe: ComposerAnalyticsTimeframe = "7d"): ComposerAnalyticsFilters {
  return {
    timeframe,
    postType: "all",
    media: "all",
  };
}
