import { useCallback, useMemo, useState } from "react";
import type { PostType } from "../components/post-composer/types";
import { incrementComposerInsightCounter, readComposerInsightContext } from "../utils/composer-insights-context";

export type ComposerInsightBehaviorContext = {
  recentAbandonCount: number;
  lastAbandonAt?: number | null;
  recentDraftRestoreCount: number;
  recentSubmitSuccessCount: number;
  lastSubmitSuccessAt: number | null;
  updatedAt: number;
};

export type ComposerInsightSignals = {
  hesitationLevel: "low" | "medium" | "high";
  confidenceLevel: "low" | "normal" | "high";
  intentType: "quick" | "reflective" | "uncertain";
  recommendedPromptTone: "gentle" | "neutral" | "affirming";
  shouldShowSoftNudge: boolean;
  shouldPreferShortPrompt: boolean;
};

type UseComposerInsightsParams = {
  text: string;
  hasMedia: boolean;
  isDraftRestored: boolean;
  postType: PostType;
  behaviorContext?: Partial<ComposerInsightBehaviorContext>;
};

const REFLECTIVE_TYPES = new Set<PostType>(["reflection", "testimony", "prayer_request"]);
const RECENT_SUCCESS_WINDOW_MS = 1000 * 60 * 60 * 24 * 3;
const SUCCESS_SOFT_COOLDOWN_MS = 1000 * 60 * 30;
const SUCCESS_STRONG_COOLDOWN_MS = 1000 * 60 * 10;
const ABANDON_SOFT_DECAY_MS = 1000 * 60 * 60 * 12;
const ABANDON_STRONG_DECAY_MS = 1000 * 60 * 60 * 48;

function mergeContext(
  base: ComposerInsightBehaviorContext,
  override?: Partial<ComposerInsightBehaviorContext>
): ComposerInsightBehaviorContext {
  if (!override) return base;
  return {
    recentAbandonCount: override.recentAbandonCount ?? base.recentAbandonCount,
    lastAbandonAt: override.lastAbandonAt ?? base.lastAbandonAt ?? null,
    recentDraftRestoreCount: override.recentDraftRestoreCount ?? base.recentDraftRestoreCount,
    recentSubmitSuccessCount: override.recentSubmitSuccessCount ?? base.recentSubmitSuccessCount,
    lastSubmitSuccessAt: override.lastSubmitSuccessAt ?? base.lastSubmitSuccessAt,
    updatedAt: override.updatedAt ?? base.updatedAt,
  };
}

function lowerHesitationLevel(level: ComposerInsightSignals["hesitationLevel"]): ComposerInsightSignals["hesitationLevel"] {
  if (level === "high") return "medium";
  if (level === "medium") return "low";
  return "low";
}

export function useComposerInsights({
  text,
  hasMedia,
  isDraftRestored,
  postType,
  behaviorContext,
}: UseComposerInsightsParams) {
  const [storedContext, setStoredContext] = useState<ComposerInsightBehaviorContext>(() => readComposerInsightContext());

  const context = useMemo(
    () => mergeContext(storedContext, behaviorContext),
    [behaviorContext, storedContext]
  );

  const signals = useMemo<ComposerInsightSignals>(() => {
    const now = Date.now();
    const textLength = text.trim().length;
    const hasRecentSuccess =
      context.lastSubmitSuccessAt !== null && now - context.lastSubmitSuccessAt <= RECENT_SUCCESS_WINDOW_MS;
    const hasSuccessCooldownActive =
      context.lastSubmitSuccessAt !== null && now - context.lastSubmitSuccessAt <= SUCCESS_SOFT_COOLDOWN_MS;
    const hasStrongSuccessCooldown =
      context.lastSubmitSuccessAt !== null && now - context.lastSubmitSuccessAt <= SUCCESS_STRONG_COOLDOWN_MS;

    let effectiveAbandonCount = context.recentAbandonCount;
    if (context.lastAbandonAt) {
      const abandonAge = now - context.lastAbandonAt;
      if (abandonAge >= ABANDON_STRONG_DECAY_MS) {
        effectiveAbandonCount = Math.max(0, effectiveAbandonCount - 2);
      } else if (abandonAge >= ABANDON_SOFT_DECAY_MS) {
        effectiveAbandonCount = Math.max(0, effectiveAbandonCount - 1);
      }
    }

    if (hasSuccessCooldownActive) {
      effectiveAbandonCount = Math.max(0, effectiveAbandonCount - 1);
    }
    if (hasStrongSuccessCooldown) {
      effectiveAbandonCount = Math.max(0, effectiveAbandonCount - 1);
    }

    let hesitationLevel: ComposerInsightSignals["hesitationLevel"] =
      effectiveAbandonCount >= 3
        ? "high"
        : effectiveAbandonCount >= 1 || (textLength > 0 && textLength < 28 && !hasMedia)
          ? "medium"
          : "low";

    if (hasStrongSuccessCooldown) {
      hesitationLevel = lowerHesitationLevel(hesitationLevel);
    }

    let confidenceScore = 0;
    if (context.recentSubmitSuccessCount >= 3) {
      confidenceScore += 2;
    } else if (context.recentSubmitSuccessCount >= 1) {
      confidenceScore += 1;
    }
    if (hasRecentSuccess) confidenceScore += 1;
    if (hasSuccessCooldownActive) confidenceScore += 1;
    if (hasStrongSuccessCooldown) confidenceScore += 1;

    if (effectiveAbandonCount >= 3) {
      confidenceScore -= 2;
    } else if (effectiveAbandonCount >= 1) {
      confidenceScore -= 1;
    }

    if (textLength > 0 && textLength < 20 && !hasMedia) {
      confidenceScore -= 1;
    }

    let confidenceLevel: ComposerInsightSignals["confidenceLevel"] =
      confidenceScore >= 3 ? "high" : confidenceScore <= -1 ? "low" : "normal";

    if (hasStrongSuccessCooldown && confidenceLevel === "low") {
      confidenceLevel = "normal";
    }

    const intentType: ComposerInsightSignals["intentType"] =
      isDraftRestored || textLength >= 180 || (REFLECTIVE_TYPES.has(postType) && textLength >= 90)
        ? "reflective"
        : textLength > 0 && textLength <= 80 && !hasMedia
          ? "quick"
          : "uncertain";

    const recommendedPromptTone: ComposerInsightSignals["recommendedPromptTone"] =
      hesitationLevel === "high" || (hesitationLevel === "medium" && confidenceLevel === "low")
        ? "affirming"
        : intentType === "reflective"
          ? "gentle"
          : "neutral";

    const shouldShowSoftNudge =
      confidenceLevel !== "high" &&
      !hasStrongSuccessCooldown &&
      (hesitationLevel === "high" || (hesitationLevel === "medium" && context.recentDraftRestoreCount > 0)) &&
      textLength > 0 &&
      textLength < 50 &&
      !hasMedia;

    return {
      hesitationLevel,
      confidenceLevel,
      intentType,
      recommendedPromptTone,
      shouldShowSoftNudge,
      shouldPreferShortPrompt:
        intentType === "quick" ||
        ((hesitationLevel !== "low" || confidenceLevel === "low") && confidenceLevel !== "high" && textLength < 48),
    };
  }, [context, hasMedia, isDraftRestored, postType, text]);

  const recordAbandon = useCallback(() => {
    setStoredContext(incrementComposerInsightCounter("abandon"));
  }, []);

  const recordDraftRestored = useCallback(() => {
    setStoredContext(incrementComposerInsightCounter("draftRestore"));
  }, []);

  const recordSubmitSuccess = useCallback(() => {
    setStoredContext(incrementComposerInsightCounter("submitSuccess"));
  }, []);

  return {
    signals,
    behaviorContext: context,
    recordAbandon,
    recordDraftRestored,
    recordSubmitSuccess,
  };
}
