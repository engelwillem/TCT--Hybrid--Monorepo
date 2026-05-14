import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useRitualActions } from "./useRitualActions";

const pushMock = vi.fn();
const prefetchMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    prefetch: prefetchMock,
  }),
}));

vi.mock("@/lib/funnel-analytics", () => ({
  trackFunnelEvent: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../analytics", async () => {
  const actual = await vi.importActual<typeof import("../analytics")>("../analytics");
  return {
    ...actual,
    trackRenunganTelemetryEvent: vi.fn().mockResolvedValue(undefined),
  };
});

function buildHook() {
  return renderHook(() =>
    useRitualActions({
      context: {
        auth: {
          isAuthenticated: false,
          isAuthRestoring: false,
        },
        reflection: {
          reflectionText: "aku ingin berjalan tenang",
          entryState: null,
        },
        mentor: {
          personalRenungan: {
            verseText: "Percayalah kepada TUHAN",
            verseReference: "Amsal 3:5",
            meditation: "Tuhan menuntun langkahmu hari ini dengan damai.",
          },
          mentorFeedback: null,
          isFollowUpOpen: false,
        },
      },
      handlers: {
        completePrayer: vi.fn(),
        setHasStarted: vi.fn(),
        setMentorFeedback: vi.fn(),
        setIsFollowUpOpen: vi.fn(),
      },
    })
  );
}

describe("useRitualActions guest-safe actions", () => {
  it("redirects guest to login when starting renungan", () => {
    const { result } = buildHook();

    result.current.handleStartRenungan();

    expect(pushMock).toHaveBeenCalledWith("/login?next=/renungan");
  });

  it("blocks guest from completing prayer and redirects to login", () => {
    const completePrayer = vi.fn();
    const { result } = renderHook(() =>
      useRitualActions({
        context: {
          auth: {
            isAuthenticated: false,
            isAuthRestoring: false,
          },
          reflection: {
            reflectionText: "aku tetap percaya",
            entryState: null,
          },
          mentor: {
            personalRenungan: {
              verseText: "Jangan gelisah",
              verseReference: "Yohanes 14:1",
              meditation: "Tuhan tetap dekat di tengah rasa cemasmu.",
            },
            mentorFeedback: null,
            isFollowUpOpen: false,
          },
        },
        handlers: {
          completePrayer,
          setHasStarted: vi.fn(),
          setMentorFeedback: vi.fn(),
          setIsFollowUpOpen: vi.fn(),
        },
      })
    );

    result.current.handleCompletePrayer();

    expect(completePrayer).not.toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith("/login?next=/renungan");
  });

  it("keeps member-required action guard for bookmark-class flows", () => {
    const { result } = buildHook();

    const allowed = result.current.ensureAuthenticatedRitual();

    expect(allowed).toBe(false);
    expect(pushMock).toHaveBeenCalledWith("/login?next=/renungan");
  });
});
