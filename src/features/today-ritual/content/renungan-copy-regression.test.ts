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

    expect(completion).toContain("Lanjutkan pendalaman");
    expect(completion).toContain("Selesai untuk hari ini");
    expect(completion).toContain("Simpan renungan ini agar bisa kamu temui lagi");
    expect(deepening).toContain("Baca lebih utuh di VerseHub");
    expect(completion).not.toContain("Lanjut ke Versehub");
  });

  it("keeps save prompt as continuity-first wording", () => {
    const savePrompt = readProjectFile("src/components/ritual/RitualSavePromptSheet.tsx");

    expect(savePrompt).toContain("Renungan ini bisa kamu simpan");
    expect(savePrompt).toContain(
      "Supaya kamu bisa melanjutkannya besok dan kembali membacanya kapan pun kamu membutuhkannya."
    );
    expect(savePrompt).toContain("Simpan renungan ini");
    expect(savePrompt).toContain("Saya sudah punya akun");
    expect(savePrompt).toContain("Nanti saja");
  });

  it("keeps share and bookmark aria labels aligned with visible tone", () => {
    const actionBar = readProjectFile("src/features/today-ritual/components/TodayShareActionBar.tsx");

    expect(actionBar).toContain("Simpan renungan ini");
    expect(actionBar).toContain("Renungan tersimpan");
    expect(actionBar).not.toContain("\"Bookmarked\"");
    expect(actionBar).not.toContain("\"Bookmark\"");
  });

  it("keeps fallback user messaging calm and non-technical", () => {
    const parityBanner = readProjectFile("src/features/today-ritual/components/RitualParityBanner.tsx");
    const ritualScreen = readProjectFile("src/features/today-ritual/components/TodayDailyRitualScreen.tsx");

    expect(parityBanner).not.toContain("Renungan hari ini tetap siap menemanimu.");
    expect(ritualScreen).toContain("Your reflection is not ready yet. Take a breath and try again shortly.");
    expect(ritualScreen).toContain(
      "Your reflection is still available. For now, we are serving a simpler fallback version."
    );
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
