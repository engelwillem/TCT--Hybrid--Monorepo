import { describe, expect, it } from "vitest";
import { resolveRenunganBehavior } from "@/ai/renungan/resolve-renungan-request";
import { resolveRenunganFollowUps } from "@/ai/renungan/resolve-renungan-ui";
import { parseVersehubBridgeContext } from "@/ai/versehub/resolve-versehub-request";
import { resolveVersehubUiHints } from "@/ai/versehub/resolve-versehub-ui";
import { resolveVisibleCommunityActions } from "@/ai/community/resolve-community-request";
import { shouldShowEscapeHatch } from "@/ai/community/resolve-community-ui";

describe("AI orchestration resolvers", () => {
  it("maps overwhelmed state to calm_heart with low density", () => {
    const behavior = resolveRenunganBehavior({
      entryState: "overwhelmed",
      reflectionText: "Aku capek hari ini",
    });
    expect(behavior.mode).toBe("calm_heart");
    expect(behavior.density).toBe("low");
    expect(behavior.maxVisibleFollowUps).toBe(2);
  });

  it("returns clarify followups for clarity state", () => {
    const followUps = resolveRenunganFollowUps("clarity");
    expect(followUps).toContain("open_versehub");
    expect(followUps).toContain("small_step");
  });

  it("parses versehub bridge and enables clarify card from renungan", () => {
    const params = new URLSearchParams("source=renungan&intent=clarify&verseRef=mazmur-23-1");
    const ctx = parseVersehubBridgeContext(params);
    const ui = resolveVersehubUiHints(ctx);
    expect(ui.showClarifyCard).toBe(true);
  });

  it("keeps versehub clarify card hidden without bridge context", () => {
    const ctx = parseVersehubBridgeContext(new URLSearchParams(""));
    const ui = resolveVersehubUiHints(ctx);
    expect(ui.showClarifyCard).toBe(false);
  });

  it("limits community actions for prayer request mode", () => {
    const actions = resolveVisibleCommunityActions({ mode: "prayer_request" });
    expect(actions).toEqual(["refine", "shorten", "gentler_tone"]);
  });

  it("shows community escape hatch for overwhelmed entry state", () => {
    const visible = shouldShowEscapeHatch({
      entryState: "overwhelmed",
      hasUnsavedDraft: false,
      isReplying: false,
    });
    expect(visible).toBe(true);
  });
});
