import type { PostType } from "../components/post-composer/types";

export type ComposerAnalyticsTimeframe = "7d" | "30d";
export type ComposerAnalyticsMediaFilter = "all" | "with_media" | "without_media";

export type ComposerAnalyticsFilters = {
  timeframe: ComposerAnalyticsTimeframe;
  postType: PostType | "all";
  media: ComposerAnalyticsMediaFilter;
};

export type ComposerValidationFailureKey =
  | "text_too_short"
  | "max_images"
  | "pending_crop"
  | "network_error"
  | "unknown";

export type ComposerAnalyticsSegmentRow = {
  timeframe: ComposerAnalyticsTimeframe;
  postType: PostType;
  hasMedia: boolean;
  openCount: number;
  typingStartCount: number;
  attachMediaCount: number;
  cropAppliedCount: number;
  submitSuccessCount: number;
  submitFailureCount: number;
  draftRestoredCount: number;
  draftRestoredSuccessCount: number;
  abandonedDraftCount: number;
  avgTimeToPostSec: number;
  validationFailures: Record<ComposerValidationFailureKey, number>;
};

export type ComposerAnalyticsFunnelStage = {
  key: "open" | "engage" | "prepare" | "attempt" | "success";
  label: string;
  value: number;
  rateFromPreviousPct: number;
};

export type ComposerAnalyticsInsight = {
  id: string;
  tone: "neutral" | "positive" | "warning";
  title: string;
  detail: string;
};

export type ComposerAnalyticsSnapshot = {
  generatedAt: string;
  filters: ComposerAnalyticsFilters;
  overview: {
    openCount: number;
    submitSuccessCount: number;
    submitFailureCount: number;
    meaningfulActivationRatePct: number;
    openToSuccessRatePct: number;
    typingRatePct: number;
    averageTimeToPostSec: number;
  };
  draft: {
    restoredCount: number;
    restoreRatePct: number;
    restoredToSuccessRatePct: number;
    abandonedDraftRatioPct: number;
  };
  media: {
    attachmentRatePct: number;
    mediaSuccessRatePct: number;
    textOnlySuccessRatePct: number;
    cropInteractionDensity: number;
  };
  failure: {
    networkErrorRatePct: number;
    topValidationFailures: Array<{ reason: ComposerValidationFailureKey; count: number }>;
  };
  funnel: ComposerAnalyticsFunnelStage[];
  postTypeBreakdown: Array<{
    postType: PostType;
    openCount: number;
    submitSuccessCount: number;
    successRatePct: number;
  }>;
  insights: ComposerAnalyticsInsight[];
};
