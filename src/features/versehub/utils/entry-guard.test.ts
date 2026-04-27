import { describe, expect, it } from "vitest";
import {
  isAllowedVersehubReaderIntent,
  shouldRenderVersehubReader,
  VERSEHUB_READER_ALLOWED_INTENTS,
} from "./entry-guard";

describe("versehub entry guard", () => {
  it("allows only explicit reader intents", () => {
    expect(VERSEHUB_READER_ALLOWED_INTENTS).toEqual(["clarify", "deep-read", "chapter-context"]);
    expect(isAllowedVersehubReaderIntent("clarify")).toBe(true);
    expect(isAllowedVersehubReaderIntent("deep-read")).toBe(true);
    expect(isAllowedVersehubReaderIntent("chapter-context")).toBe(true);
    expect(isAllowedVersehubReaderIntent("organic-entry")).toBe(false);
    expect(isAllowedVersehubReaderIntent(null)).toBe(false);
  });

  it("allows reader render for renungan source plus whitelisted intent", () => {
    expect(shouldRenderVersehubReader({ source: "renungan", intent: "clarify" })).toBe(true);
    expect(shouldRenderVersehubReader({ source: "renungan", intent: "deep-read" })).toBe(true);
    expect(shouldRenderVersehubReader({ source: "renungan", intent: "chapter-context" })).toBe(true);
  });

  it("fails closed for unknown or ambiguous params", () => {
    expect(shouldRenderVersehubReader({ source: "renungan", intent: "organic-entry" })).toBe(false);
    expect(shouldRenderVersehubReader({ source: "versehub", intent: "clarify" })).toBe(false);
    expect(shouldRenderVersehubReader({ source: "renungan" })).toBe(false);
    expect(shouldRenderVersehubReader({ intent: "clarify" })).toBe(false);
    expect(shouldRenderVersehubReader({})).toBe(false);
  });

  it("normalizes casing and array query params", () => {
    expect(shouldRenderVersehubReader({ source: ["RENUNGAN"], intent: ["DEEP-READ"] })).toBe(true);
    expect(shouldRenderVersehubReader({ source: ["renungan"], intent: [" CHAPTER-CONTEXT "] })).toBe(true);
  });
});
