import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { trackFunnelEvent } from "@/lib/funnel-analytics";
import { buildVersehubClarifyUrl } from "@/ai/bridges/build-bridge-context";
import { bucketInputLength, trackRenunganTelemetryEvent } from "../analytics";
import type { RenunganMatch } from "../content/personal-renungan";
import type { EmotionalEntryState } from "@/features/ux-architecture/types";

type RitualActionAuthContext = {
  isAuthenticated: boolean;
  isAuthRestoring: boolean;
};

type RitualActionReflectionContext = {
  reflectionText: string;
  entryState: EmotionalEntryState | null;
};

type RitualActionMentorContext = {
  personalRenungan: RenunganMatch;
  mentorFeedback: "helpful" | "not_helpful" | null;
  isFollowUpOpen: boolean;
};

type RitualActionHandlers = {
  completePrayer: () => void;
  setHasStarted: (value: boolean) => void;
  setMentorFeedback: (value: "helpful" | "not_helpful" | null) => void;
  setIsFollowUpOpen: (value: boolean) => void;
};

type UseRitualActionsParams = {
  context: {
    auth: RitualActionAuthContext;
    reflection: RitualActionReflectionContext;
    mentor: RitualActionMentorContext;
  };
  handlers: RitualActionHandlers;
};

export function useRitualActions({
  context: {
    auth: { isAuthenticated, isAuthRestoring },
    reflection: { reflectionText, entryState },
    mentor: { personalRenungan, mentorFeedback, isFollowUpOpen },
  },
  handlers: { completePrayer, setHasStarted, setMentorFeedback, setIsFollowUpOpen },
}: UseRitualActionsParams) {
  const router = useRouter();

  const ensureAuthenticatedRitual = useCallback(() => {
    if (isAuthRestoring) return false;
    if (!isAuthenticated) {
      router.push("/login?next=/renungan");
      return false;
    }
    return true;
  }, [isAuthRestoring, isAuthenticated, router]);

  const handleStartRenungan = useCallback(() => {
    if (!ensureAuthenticatedRitual()) return;

    void trackFunnelEvent("renungan_start", {
      surface: "renungan",
      meta: {
        source: "start_cta",
      },
    });
    setHasStarted(true);
  }, [ensureAuthenticatedRitual, setHasStarted]);

  const handleCompletePrayer = useCallback(() => {
    if (!ensureAuthenticatedRitual()) return;

    void trackFunnelEvent("renungan_complete", {
      surface: "renungan",
      meta: {
        source: "prayer_submit",
        has_reflection_text: reflectionText.trim().length > 0,
      },
    });
    completePrayer();
  }, [completePrayer, ensureAuthenticatedRitual, reflectionText]);

  const handleContinueToVersehub = useCallback(() => {
    void trackFunnelEvent("continue_to_versehub", {
      surface: "renungan",
      meta: {
        target: "/versehub/id?source=renungan&intent=clarify",
        mode: "landing",
      },
    });
    router.push(
      buildVersehubClarifyUrl({
        verseRef: personalRenungan.verseReference,
        source: "renungan",
        entryState,
      }),
    );
  }, [entryState, personalRenungan.verseReference, router]);

  const buildMentorOutcomeMeta = useCallback(
    () => ({
      request_id: personalRenungan.requestId ?? null,
      confidence: personalRenungan.confidence ?? null,
      driver: personalRenungan.driver ?? null,
      used_fallback: personalRenungan.usedFallback ?? false,
      has_follow_up_question: Boolean(personalRenungan.followUpQuestion),
      input_length_bucket: bucketInputLength(reflectionText.trim().length),
    }),
    [personalRenungan, reflectionText],
  );

  const handleMentorHelpful = useCallback(() => {
    if (mentorFeedback !== null) return;
    setMentorFeedback("helpful");
    void trackRenunganTelemetryEvent("renungan_result_helpful", buildMentorOutcomeMeta());
  }, [buildMentorOutcomeMeta, mentorFeedback, setMentorFeedback]);

  const handleMentorNotHelpful = useCallback(() => {
    if (mentorFeedback !== null) return;
    setMentorFeedback("not_helpful");
    void trackRenunganTelemetryEvent("renungan_result_not_helpful", {
      ...buildMentorOutcomeMeta(),
      reason: "other",
    });
  }, [buildMentorOutcomeMeta, mentorFeedback, setMentorFeedback]);

  const handleOpenFollowUp = useCallback(() => {
    if (isFollowUpOpen || !personalRenungan.followUpQuestion) return;
    setIsFollowUpOpen(true);
    void trackRenunganTelemetryEvent("renungan_followup_opened", buildMentorOutcomeMeta());
  }, [buildMentorOutcomeMeta, isFollowUpOpen, personalRenungan.followUpQuestion, setIsFollowUpOpen]);

  return {
    ensureAuthenticatedRitual,
    handleStartRenungan,
    handleCompletePrayer,
    handleContinueToVersehub,
    handleMentorHelpful,
    handleMentorNotHelpful,
    handleOpenFollowUp,
  };
}
