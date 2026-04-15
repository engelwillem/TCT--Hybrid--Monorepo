import type { EmotionalEntryState, FollowUpAction } from "@/ai/core/contracts";

export function resolveRenunganFollowUps(entryState: EmotionalEntryState | null): FollowUpAction[] {
  const base: FollowUpAction[] = ["make_prayer", "small_step", "open_versehub", "save_draft", "done"];

  if (entryState === "overwhelmed" || entryState === "disconnected") {
    return ["make_prayer", "done"];
  }

  if (entryState === "clarity") {
    return ["small_step", "open_versehub", "done"];
  }

  return base;
}
