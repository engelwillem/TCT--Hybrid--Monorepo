import { beforeEach, describe, expect, it, vi } from "vitest";

const generateOGImageMock = vi.fn(async () => new Response("ok"));
vi.mock("@/features/og/today/generate-og-image", () => ({
  generateOGImage: generateOGImageMock,
}));

describe("GET /api/og/today", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses today session mock verse content", async () => {
    const { GET } = await import("./route");

    await GET();

    expect(generateOGImageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        verseText: expect.any(String),
        reference: expect.any(String),
      })
    );
  });
});
