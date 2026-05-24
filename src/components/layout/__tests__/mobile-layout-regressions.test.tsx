import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/notes" }));
vi.mock("@/features/selected-date-context", () => ({ useSelectedDate: () => ({ selectedDate: "2026-05-24", setSelectedDate: vi.fn() }) }));

import { AppShell } from "@/components/layout/app-shell";
import OnboardingPage from "@/app/onboarding/page";

describe("mobile layout regressions", () => {
  it("applies keyboard-safe and horizontal-overflow guards at narrow viewport widths", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 320 });

    const { container } = render(<AppShell><div>content</div></AppShell>);

    const safeRegion = container.querySelector(".rr-keyboard-safe-scroll");
    expect(safeRegion?.className).toContain("min-w-0");
    const nav = screen.getByRole("navigation", { name: /primary app navigation/i });
    expect(nav.className).toContain("inset-x-0");
  });

  it("keeps primary onboarding action sticky with touch-safe target", () => {
    render(<OnboardingPage />);
    const submit = screen.getByRole("button", { name: /save profile setup/i });
    expect(submit.className).toContain("min-h-12");
    const sticky = submit.closest("div");
    expect(sticky?.className).toContain("rr-sticky-action");
  });
});
