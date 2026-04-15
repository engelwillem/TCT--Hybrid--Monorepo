import { resolveDefaultRenunganMode } from "@/ai/renungan/resolve-renungan-request";
import type { EmotionalEntryState, RenunganMode, VerseHubAssistMode } from "@/ai/core/contracts";
export type { EmotionalEntryState, RenunganMode, VerseHubAssistMode };

export const EMOTIONAL_STATE_LABELS: Record<EmotionalEntryState, string> = {
  overwhelmed: "Aku lagi penuh / capek",
  disconnected: "Aku lagi bingung / kosong",
  clarity: "Aku butuh kejelasan",
  connect: "Aku mau terhubung pelan",
  neutral: "Lewati dulu",
};

export const EMOTIONAL_STATE_PROMPT_SEEDS: Record<EmotionalEntryState, string> = {
  overwhelmed: "Hari ini aku lagi penuh dan capek, aku butuh satu pegangan yang menenangkan.",
  disconnected: "Hari ini aku merasa tidak sinkron dan bingung, tolong beri satu pijakan.",
  clarity: "Hari ini aku butuh kejelasan langkah dari firman Tuhan.",
  connect: "Hari ini aku mau terhubung pelan-pelan, tanpa tekanan.",
  neutral: "Hari ini aku butuh satu pegangan kecil untuk lanjut.",
};

export { resolveDefaultRenunganMode };
