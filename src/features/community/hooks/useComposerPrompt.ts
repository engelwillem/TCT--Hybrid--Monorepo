import { useMemo } from "react";
import type { PostType } from "../components/post-composer/types";
import type { ComposerInsightSignals } from "./useComposerInsights";
import type { ComposerExperimentState } from "./useComposerExperiments";

type UseComposerPromptParams = {
  postType: PostType;
  hasRestoredDraft: boolean;
  insights?: ComposerInsightSignals;
  experiments?: ComposerExperimentState;
};

type ComposerPromptModel = {
  placeholder: string;
  helper: string;
};

const PROMPTS_BY_TYPE: Record<PostType, string[]> = {
  user_post: [
    "Apa yang Tuhan taruh di hati Anda?",
    "Tuliskan momen kecil yang ingin Anda syukuri.",
    "Bagikan kekuatan untuk sesama.",
  ],
  reflection: [
    "Pelajaran apa dari renungan hari ini?",
    "Satu refleksi jujur hari ini...",
    "Apa yang sedang Tuhan bentuk dalam hati?",
  ],
  testimony: [
    "Kesaksian sederhana hari ini?",
    "Perubahan kecil apa yang Anda alami?",
    "Ceritakan langkah iman Anda.",
  ],
  prayer_request: [
    "Permohonan doa yang ingin Anda titipkan?",
    "Apa yang paling Anda butuhkan dalam doa?",
    "Tuliskan kebutuhan doa dengan tenang.",
  ],
  quote: [
    "Kutipan yang menguatkan hari ini.",
    "Ayat yang paling menenangkan hati?",
    "Kutipan untuk dipegang minggu ini.",
  ],
};

const SHORT_PROMPT_BY_TYPE: Record<PostType, string> = {
  user_post: "Bagikan satu hal yang ingin Anda syukuri hari ini.",
  reflection: "Satu refleksi singkat dari hari ini...",
  testimony: "Satu langkah iman yang ingin Anda bagikan...",
  prayer_request: "Permohonan doa singkat Anda hari ini...",
  quote: "Kutipan singkat yang menguatkan Anda hari ini...",
};

const HELPER_BY_TONE: Record<NonNullable<ComposerInsightSignals["recommendedPromptTone"]>, string> = {
  gentle: "Bagikan dengan tenang. Tidak perlu tergesa.",
  neutral: "Bagikan dengan tenang. Cerita singkat pun berarti.",
  affirming: "Mulai dari kalimat sederhana. Yang jujur sudah cukup berarti.",
};

export function useComposerPrompt({ postType, hasRestoredDraft, insights, experiments }: UseComposerPromptParams): ComposerPromptModel {
  return useMemo(() => {
    const tone = insights?.recommendedPromptTone ?? experiments?.promptTone ?? "neutral";
    const preferShortPrompt =
      insights?.shouldPreferShortPrompt ?? (experiments?.promptLength === "short");
    const shouldShowSoftNudge = insights?.shouldShowSoftNudge ?? false;

    if (hasRestoredDraft) {
      const restoredHelper =
        tone === "affirming" || experiments?.draftRestore === "supportive"
          ? "Draf Anda dipulihkan otomatis. Lanjutkan perlahan, kalimat singkat pun cukup."
          : "Draf Anda dipulihkan otomatis di perangkat ini.";

      return {
        placeholder: preferShortPrompt ? "Lanjutkan draf Anda..." : "Lanjutkan yang tadi Anda tulis...",
        helper: restoredHelper,
      };
    }

    const prompts = PROMPTS_BY_TYPE[postType] ?? PROMPTS_BY_TYPE.user_post;
    const dayIndex = Math.floor(Date.now() / 86_400_000);
    const rotatingPrompt = prompts[dayIndex % prompts.length] ?? prompts[0] ?? "Apa yang Tuhan taruh di hati Anda?";
    const placeholder = preferShortPrompt
      ? SHORT_PROMPT_BY_TYPE[postType] ?? SHORT_PROMPT_BY_TYPE.user_post
      : rotatingPrompt;
    const helperBase = HELPER_BY_TONE[tone];
    const helper = shouldShowSoftNudge ? `${helperBase} Satu atau dua kalimat pun cukup.` : helperBase;

    return {
      placeholder,
      helper,
    };
  }, [experiments, hasRestoredDraft, insights, postType]);
}
