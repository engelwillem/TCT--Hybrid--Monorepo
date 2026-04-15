export type SurfaceName = "renungan" | "versehub" | "community";

export type EmotionalEntryState =
  | "overwhelmed"
  | "disconnected"
  | "clarity"
  | "connect"
  | "neutral";

export type AiTone = "gentle" | "grounded" | "assistive";
export type BridgeIntent = "regulate" | "clarify" | "connect";
export type UiDensity = "low" | "standard";

export type FollowUpAction =
  | "make_prayer"
  | "small_step"
  | "open_versehub"
  | "save_draft"
  | "done";

export type RenunganMode =
  | "calm_heart"
  | "practical_step"
  | "short_prayer"
  | "deep_reflection";

export type VerseHubAssistMode =
  | "explain_simple"
  | "context"
  | "practical_meaning"
  | "prayer_from_verse"
  | "related_verses";
