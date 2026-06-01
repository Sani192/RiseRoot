import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/layout/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock("@/components/layout/page-container", () => ({
  PageContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
}));
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));
vi.mock("@/components/layout/mobile-safe-area", () => ({
  KeyboardSafeScrollRegion: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  StickyActionBar: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={`sticky ${className ?? ""}`}>{children}</div>,
}));

import OnboardingPage from "@/app/onboarding/page";

describe("mobile critical interactions", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            message:
              "Profile setup saved. You can update this any time in Settings.",
          },
        }),
      }),
    );
  });
  it("keeps sticky action visible and submits form", async () => {
    render(<OnboardingPage />);

    const submit = screen.getByRole("button", { name: /save profile setup/i });
    const stickyContainer = submit.closest("div");
    expect(stickyContainer?.className).toContain("sticky");

    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: "Ari" },
    });
    fireEvent.change(screen.getByLabelText(/Age/i), {
      target: { value: "29" },
    });
    fireEvent.click(screen.getByRole("radio", { name: /Early morning/i }));
    fireEvent.change(screen.getByLabelText(/Usual wake time/i), {
      target: { value: "06:30" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /Build strength/i }));
    fireEvent.click(submit);

    await waitFor(() =>
      expect(screen.getByText(/profile setup saved/i)).toBeInTheDocument(),
    );
  });
});
