import { describe, expect, it } from "vitest";
import { resolveRenunganExperienceState } from "./today-session.experience";

describe("resolveRenunganExperienceState", () => {
  it("keeps cache_stale as healthy for ritual UX when content is still valid", () => {
    const state = resolveRenunganExperienceState({
      sourceStatus: "cache_stale",
      hasOfflineFallback: false,
      missingRequiredFieldsCount: 0,
    });

    expect(state).toBe("healthy");
  });

  it("returns fallback for fallback_only source state", () => {
    const state = resolveRenunganExperienceState({
      sourceStatus: "fallback_only",
      hasOfflineFallback: true,
      missingRequiredFieldsCount: 0,
    });

    expect(state).toBe("fallback");
  });

  it("returns degraded only when content completeness is impacted", () => {
    const state = resolveRenunganExperienceState({
      sourceStatus: "external_live",
      hasOfflineFallback: false,
      missingRequiredFieldsCount: 2,
    });

    expect(state).toBe("degraded");
  });
});
