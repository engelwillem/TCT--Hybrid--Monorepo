import { describe, expect, it } from "vitest";
import { resolveRenunganEntryIntent } from "./entry-intent";

describe("resolveRenunganEntryIntent", () => {
  it("primes deepening for explicit pane", () => {
    const result = resolveRenunganEntryIntent({
      source: "versehub",
      intent: "organic-entry",
      pane: "pendalaman-firman",
    });

    expect(result).toEqual({
      source: "versehub",
      intent: "organic-entry",
      pane: "pendalaman-firman",
      shouldPrimeDeepening: true,
    });
  });

  it("normalizes casing and trims parameters", () => {
    const result = resolveRenunganEntryIntent({
      source: [" VerseHub "],
      intent: [" ORGANIC-ENTRY "],
      pane: [" PENDALAMAN-FIRMAN "],
    });

    expect(result.shouldPrimeDeepening).toBe(true);
    expect(result.source).toBe("versehub");
    expect(result.intent).toBe("organic-entry");
    expect(result.pane).toBe("pendalaman-firman");
  });

  it("does not prime deepening for non-matching input", () => {
    const result = resolveRenunganEntryIntent({
      source: "renungan",
      intent: "resume",
      pane: "unknown-pane",
    });

    expect(result).toEqual({
      source: "renungan",
      intent: "resume",
      pane: null,
      shouldPrimeDeepening: false,
    });
  });
});
