import { describe, expect, it } from "vitest";
import { resolveVersehubIdRoute } from "./versehub-id-route";

describe("resolveVersehubIdRoute", () => {
  it("redirects to renungan alias when params are missing", () => {
    const result = resolveVersehubIdRoute({});
    expect(result).toEqual({
      kind: "redirect",
      target: "/renungan?source=versehub&intent=organic-entry&pane=pendalaman-firman",
    });
  });

  it("renders reader for allowed renungan intents", () => {
    expect(resolveVersehubIdRoute({ source: "renungan", intent: "clarify" })).toEqual({ kind: "render_reader" });
    expect(resolveVersehubIdRoute({ source: "renungan", intent: "deep-read" })).toEqual({ kind: "render_reader" });
    expect(resolveVersehubIdRoute({ source: "renungan", intent: "chapter-context" })).toEqual({ kind: "render_reader" });
  });

  it("fails closed for invalid intent", () => {
    const result = resolveVersehubIdRoute({
      source: "renungan",
      intent: "organic-entry",
    });
    expect(result).toEqual({
      kind: "redirect",
      target: "/renungan?source=versehub&intent=organic-entry&pane=pendalaman-firman",
    });
  });
});
