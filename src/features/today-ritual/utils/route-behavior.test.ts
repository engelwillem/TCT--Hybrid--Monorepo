import { describe, expect, it } from "vitest";
import { shouldPrimeDeepeningAfterCompletion, shouldShowDeepeningNotice } from "./route-behavior";

const primeIntent = {
  source: "versehub",
  intent: "organic-entry",
  pane: "pendalaman-firman" as const,
  shouldPrimeDeepening: true,
};

describe("today ritual route behavior helpers", () => {
  it("shows lightweight notice when deepening intent exists but prayer is not complete", () => {
    expect(
      shouldShowDeepeningNotice({
        entryIntent: primeIntent,
        isPrayerCompleted: false,
      }),
    ).toBe(true);
  });

  it("does not show lightweight notice when prayer is complete", () => {
    expect(
      shouldShowDeepeningNotice({
        entryIntent: primeIntent,
        isPrayerCompleted: true,
      }),
    ).toBe(false);
  });

  it("primes deepening only when completion state is ready", () => {
    expect(
      shouldPrimeDeepeningAfterCompletion({
        entryIntent: primeIntent,
        isPrayerCompleted: true,
      }),
    ).toBe(true);
    expect(
      shouldPrimeDeepeningAfterCompletion({
        entryIntent: primeIntent,
        isPrayerCompleted: false,
      }),
    ).toBe(false);
  });
});
