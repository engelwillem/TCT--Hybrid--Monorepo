import type { RenunganMode } from "@/features/ux-architecture/types";

export const RENUNGAN_MODE_OPTIONS: Array<{ value: RenunganMode; label: string }> = [
  { value: "calm_heart", label: "Tenangkan hati" },
  { value: "practical_step", label: "Langkah kecil" },
  { value: "short_prayer", label: "Doa singkat" },
  { value: "deep_reflection", label: "Renungan lebih dalam" },
];
