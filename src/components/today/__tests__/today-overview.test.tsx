import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/services/persisted-records", () => ({
  loadTasksForDate: vi.fn().mockResolvedValue([
    { id: "task-1", title: "Hydrate", status: "completed" },
    { id: "task-2", title: "Ten-minute outside walk", status: "todo" },
    { id: "task-3", title: "Evening wind-down", status: "todo" },
  ]),
}));

import { TodayOverview } from "@/components/today/today-overview";

describe("TodayOverview persisted task summary", () => {
  it("shows progress for tasks loaded from persisted records", async () => {
    render(<TodayOverview />);

    expect(screen.getByText(/loading today's records/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText(/1 of 3 complete \(33%\)\./i),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/Hydrate · completed/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Ten-minute outside walk · todo/i),
    ).toBeInTheDocument();
  });
});
