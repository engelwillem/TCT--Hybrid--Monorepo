import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DailyVerseHeroCard } from "./DailyVerseHeroCard";

describe("DailyVerseHeroCard", () => {
  it("renders English default UI copy", () => {
    render(<DailyVerseHeroCard />);
    expect(screen.getByText(/My Strength Verse/i)).toBeInTheDocument();
    expect(screen.getByText("Share or save")).toBeInTheDocument();
  });
});
