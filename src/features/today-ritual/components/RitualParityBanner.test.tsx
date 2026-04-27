import { render } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { RitualParityBanner } from "./RitualParityBanner";

describe("RitualParityBanner trust tone", () => {
  it("renders nothing for healthy mode", () => {
    const { container } = render(createElement(RitualParityBanner, { parityStatus: "healthy" }));
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for degraded-but-usable mode", () => {
    const { container } = render(createElement(RitualParityBanner, { parityStatus: "degraded" }));
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for fallback mode", () => {
    const { container } = render(createElement(RitualParityBanner, { parityStatus: "fallback" }));
    expect(container).toBeEmptyDOMElement();
  });
});
