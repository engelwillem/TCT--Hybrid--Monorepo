import type { CommunityAiAssistAction, CommunityComposerMode } from "@/ai/community/resolve-community-request";

export type CommunityAiSuggestion = {
  originalText: string;
  suggestedText: string;
  action: CommunityAiAssistAction;
};

export async function requestCommunityAiSuggestion(payload: {
  text: string;
  action: CommunityAiAssistAction;
  mode: CommunityComposerMode;
}) {
  const response = await fetch("/api/community/ai/assist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to get AI suggestion");
  }

  const data = (await response.json()) as { data?: { output_text?: string } };
  return {
    originalText: payload.text,
    suggestedText: String(data?.data?.output_text || "").trim(),
    action: payload.action,
  } satisfies CommunityAiSuggestion;
}
