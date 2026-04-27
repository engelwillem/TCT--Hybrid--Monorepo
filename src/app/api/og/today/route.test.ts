import { beforeEach, describe, expect, it, vi } from "vitest";

const generateOGImageMock = vi.fn(async () => new Response("ok"));
const loadRenunganSessionContentWithDiagnosticsMock = vi.fn();

vi.mock("@/features/og/today/generate-og-image", () => ({
  generateOGImage: generateOGImageMock,
}));

vi.mock("@/features/today-ritual/data/today-session.loader", () => ({
  loadRenunganSessionContentWithDiagnostics: loadRenunganSessionContentWithDiagnosticsMock,
}));

describe("GET /api/og/today", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses live session verse content when loader succeeds", async () => {
    const { GET } = await import("./route");
    loadRenunganSessionContentWithDiagnosticsMock.mockResolvedValue({
      content: {
        verseText: "Tuhan setia menyertaimu.",
        verseReference: "Mazmur 23:1",
      },
    });

    await GET();

    expect(generateOGImageMock).toHaveBeenCalledWith({
      verseText: "Tuhan setia menyertaimu.",
      reference: "Mazmur 23:1",
    });
  });

  it("falls back to mock content when live loader fails", async () => {
    const { GET } = await import("./route");
    loadRenunganSessionContentWithDiagnosticsMock.mockRejectedValue(new Error("network down"));

    await GET();

    expect(generateOGImageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        verseText: expect.any(String),
        reference: expect.any(String),
      })
    );
  });
});
