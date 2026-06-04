import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/services/planned-resources", () => ({
  plannedResourcesService: {
    notes: {
      get: vi.fn().mockResolvedValue({ body: "" }),
      save: vi
        .fn()
        .mockResolvedValue({ body: "Today I felt steady and focused." }),
    },
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/notes",
}));

import NotesPage from "@/app/notes/page";
import { SelectedDateProvider } from "@/features/selected-date-context";

describe("NotesPage editing", () => {
  it("allows editing freeform notes", async () => {
    render(
      <SelectedDateProvider>
        <NotesPage />
      </SelectedDateProvider>,
    );

    const noteInput = screen.getByPlaceholderText(/Write your note/i);

    await waitFor(() => {
      expect(noteInput).not.toBeDisabled();
    });

    fireEvent.change(noteInput, {
      target: { value: "Today I felt steady and focused." },
    });

    expect(noteInput).toHaveValue("Today I felt steady and focused.");
  });
});
