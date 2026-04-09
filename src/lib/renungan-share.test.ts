import { describe, expect, it } from "vitest";
import { createRenunganShareToken, parseRenunganShareToken } from "./renungan-share";

describe("renungan share token parser", () => {
  it("round-trips payload safely", () => {
    const token = createRenunganShareToken({
      verseReference: "Mazmur 121:7-8",
      verseText: "TUHAN akan menjaga engkau terhadap segala kecelakaan; Ia akan menjaga nyawamu.",
      meditationExcerpt: "Tuhan menjaga keluarga yang kamu rindukan, bahkan saat jarak belum bisa dipersingkat.",
      theme: "longing_family",
    });

    const parsed = parseRenunganShareToken(token);

    expect(parsed).not.toBeNull();
    expect(parsed?.verseReference).toBe("Mazmur 121:7-8");
    expect(parsed?.theme).toBe("longing_family");
    expect(parsed?.verseText.length).toBeGreaterThan(10);
    expect(parsed?.meditationExcerpt.length).toBeGreaterThan(20);
  });

  it("returns null for invalid token", () => {
    expect(parseRenunganShareToken("not-a-valid-token")).toBeNull();
  });

  it("sanitizes oversized payload fields", () => {
    const token = createRenunganShareToken({
      verseReference: "A".repeat(200),
      verseText: "B".repeat(800),
      meditationExcerpt: "C".repeat(700),
      theme: "D".repeat(120),
    });
    const parsed = parseRenunganShareToken(token);

    expect(parsed).not.toBeNull();
    // cleanLine appends "..." when trimmed, so max length can exceed by 2 chars.
    expect(parsed?.verseReference.length).toBeLessThanOrEqual(82);
    expect(parsed?.verseText.length).toBeLessThanOrEqual(322);
    expect(parsed?.meditationExcerpt.length).toBeLessThanOrEqual(262);
    expect(parsed?.theme?.length ?? 0).toBeLessThanOrEqual(50);
  });
});
