import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/layout/app-shell", () => ({ AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/components/layout/page-container", () => ({ PageContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/components/ui/card", () => ({ Card: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div> }));
vi.mock("@/components/ui/button", () => ({ Button: ({ children, ...props }: any) => <button {...props}>{children}</button> }));

import OnboardingPage from "@/app/onboarding/page";

describe("mobile critical interactions", () => {
  it("keeps sticky action visible and submits form", async () => {
    render(<OnboardingPage />);

    const submit = screen.getByRole("button", { name: /save profile setup/i });
    const stickyContainer = submit.closest("div");
    expect(stickyContainer?.className).toContain("sticky");

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "Ari" } });
    fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: "29" } });
    fireEvent.click(screen.getByRole("radio", { name: /Early morning/i }));
    fireEvent.change(screen.getByLabelText(/Usual wake time/i), { target: { value: "06:30" } });
    fireEvent.click(screen.getByRole("checkbox", { name: /Build strength/i }));
    fireEvent.click(submit);

    expect(await screen.findByRole("status")).toHaveTextContent(/saved/i);
  });
});
