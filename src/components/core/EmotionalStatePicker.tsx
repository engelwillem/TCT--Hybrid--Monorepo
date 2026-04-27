"use client";
import type { EmotionalEntryState } from "@/features/ux-architecture/types";

type EmotionalStatePickerProps = {
  value: EmotionalEntryState | null;
  onChange: (value: EmotionalEntryState) => void;
  compact?: boolean;
  className?: string;
};

export function EmotionalStatePicker(_props: EmotionalStatePickerProps) {
  return null;
}
