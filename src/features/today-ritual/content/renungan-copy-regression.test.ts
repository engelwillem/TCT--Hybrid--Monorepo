import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readProjectFile(relativePath: string): string {
  const absolutePath = path.resolve(process.cwd(), relativePath);
  return readFileSync(absolutePath, "utf8");
}

describe("renungan copy regression guard", () => {
  it("keeps completion and deepening copy invitational", () => {
    const completion = readProjectFile("src/features/today-ritual/components/RitualCompletionSection.tsx");
    const deepening = readProjectFile("src/features/today-ritual/components/RenunganVerseContinuation.tsx");

    expect(completion).toMatch(/Continue|Finish|Save/i);
    expect(deepening).toMatch(/VerseHub|Read/i);
    expect(completion).not.toContain("Lanjut ke Versehub");
  });

  it("keeps save prompt as continuity-first wording", () => {
    const savePrompt = readProjectFile("src/components/ritual/RitualSavePromptSheet.tsx");

    expect(savePrompt).toMatch(/save/i);
    expect(savePrompt).toMatch(/account|login|continue/i);
  });

  it("keeps share and bookmark aria labels aligned with visible tone", () => {
    const actionBar = readProjectFile("src/features/today-ritual/components/TodayShareActionBar.tsx");

    expect(actionBar).toContain("aria-label");
    expect(actionBar).toContain("Share");
  });

  it("keeps fallback user messaging calm and non-technical", () => {
    const parityBanner = readProjectFile("src/features/today-ritual/components/RitualParityBanner.tsx");
    const ritualScreen = readProjectFile("src/features/today-ritual/components/TodayDailyRitualScreen.tsx");

    expect(parityBanner).not.toContain("Renungan hari ini tetap siap menemanimu.");
    expect(ritualScreen).toContain("Your reflection");
    expect(ritualScreen).not.toContain("UNKNOWN_SOURCE_ERROR");
    expect(ritualScreen).not.toContain("LOCAL_FALLBACK_ACTIVE");
  });

  it("avoids legacy terms in renungan mock copy", () => {
    const mock = readProjectFile("src/features/today-ritual/content/today-session.mock.ts");

    expect(mock).not.toContain("ritus");
    expect(mock).not.toContain("journey");
    expect(mock).not.toContain("konteks utuh");
  });
});
