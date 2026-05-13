import type { RenunganMode } from "@/features/ux-architecture/types";

export const RENUNGAN_MODE_OPTIONS: Array<{ value: RenunganMode; label: string }> = [
  { value: "calm_heart", label: "Calm my heart" },
  { value: "practical_step", label: "One small step" },
  { value: "short_prayer", label: "Short prayer" },
  { value: "deep_reflection", label: "Deeper reflection" },
];
