import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { repo } = vi.hoisted(() => ({
  repo: {
    listByDate: vi.fn(),
    seedForDate: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/repositories", () => ({ mealSuggestionRepository: repo }));

import { GET, PUT } from "@/app/api/meals/route";
import { localDevUserIdEnvKey } from "@/lib/identity/authentication";

const persistedMeal = {
  id: "m1",
  userId: "u1",
  dailyPlanId: null,
  mealDate: "2026-06-02",
  mealType: "breakfast",
  title: "Greek yogurt crunch bowl",
  description: "Greek yogurt with berries, walnuts, and a drizzle of honey.",
  ingredients: [],
  nutritionSummary: {
    context: "steady-energy",
    prepMinutes: 5,
    tags: ["protein"],
  },
  status: "suggested",
  source: "template",
  createdAt: "2026-06-02T12:00:00.000Z",
  updatedAt: "2026-06-02T12:00:00.000Z",
};

describe("meals API contract", () => {
  beforeEach(() => {
    process.env[localDevUserIdEnvKey] = "u1";
    repo.listByDate.mockReset();
    repo.seedForDate.mockReset();
    repo.update.mockReset();
  });

  it("seeds templates once and lists persisted meal suggestions for the authenticated user's local date", async () => {
    repo.listByDate
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([persistedMeal]);
    repo.seedForDate.mockResolvedValueOnce([persistedMeal]);

    const response = await GET(
      new NextRequest(
        "http://localhost/api/meals?date=2026-06-02&timezone=America/New_York&context=quick&mealType=breakfast",
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(repo.listByDate).toHaveBeenNthCalledWith(1, {
      userId: "u1",
      mealDate: "2026-06-02",
    });
    expect(repo.seedForDate).toHaveBeenCalledWith({
      userId: "u1",
      mealDate: "2026-06-02",
      suggestions: expect.arrayContaining([
        expect.objectContaining({
          userId: "u1",
          mealDate: "2026-06-02",
          mealType: "breakfast",
          source: "template",
        }),
      ]),
    });
    expect(repo.listByDate).toHaveBeenNthCalledWith(2, {
      userId: "u1",
      mealDate: "2026-06-02",
      mealType: "breakfast",
    });
    expect(body.data).toEqual([
      expect.objectContaining({
        id: "m1",
        date: "2026-06-02",
        mealType: "breakfast",
        status: "suggested",
        source: "template",
      }),
    ]);
  });

  it("does not reseed when persisted suggestions already exist for the user's date", async () => {
    repo.listByDate
      .mockResolvedValueOnce([persistedMeal])
      .mockResolvedValueOnce([persistedMeal]);

    const response = await GET(
      new NextRequest("http://localhost/api/meals?date=2026-06-02"),
    );

    expect(response.status).toBe(200);
    expect(repo.seedForDate).not.toHaveBeenCalled();
    expect(repo.listByDate).toHaveBeenNthCalledWith(2, {
      userId: "u1",
      mealDate: "2026-06-02",
    });
  });

  it.each(["accepted", "skipped", "replaced", "completed"] as const)(
    "updates a user-owned suggestion to %s",
    async (status) => {
      repo.update.mockResolvedValueOnce({
        ...persistedMeal,
        status,
        title: status === "replaced" ? "Replacement bowl" : persistedMeal.title,
      });

      const response = await PUT(
        new NextRequest("http://localhost/api/meals", {
          method: "PUT",
          body: JSON.stringify({
            id: "m1",
            date: "2026-06-02",
            status,
            title: status === "replaced" ? "Replacement bowl" : undefined,
          }),
        }),
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(repo.update).toHaveBeenCalledWith({
        userId: "u1",
        id: "m1",
        mealDate: "2026-06-02",
        status,
        ...(status === "replaced" ? { title: "Replacement bowl" } : {}),
      });
      expect(body.data).toMatchObject({ id: "m1", status });
    },
  );

  it("returns 403 when updating another user's suggestion", async () => {
    const response = await PUT(
      new NextRequest("http://localhost/api/meals", {
        method: "PUT",
        body: JSON.stringify({
          userId: "attacker",
          id: "m1",
          status: "skipped",
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error.code).toBe("FORBIDDEN");
    expect(repo.update).not.toHaveBeenCalled();
  });
});
