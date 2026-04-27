import { describe, expect, it, vi } from "vitest";
import TodayRedirectPage from "./page";

const permanentRedirectMock = vi.fn();

vi.mock("next/navigation", () => ({
  permanentRedirect: (...args: unknown[]) => permanentRedirectMock(...args),
}));

describe("/today redirect", () => {
  it("redirects permanently to /renungan", () => {
    TodayRedirectPage();

    expect(permanentRedirectMock).toHaveBeenCalledWith("/renungan");
  });
});
