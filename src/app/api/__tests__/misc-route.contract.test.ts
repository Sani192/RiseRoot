import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
const { weightRepository } = vi.hoisted(() => ({
  weightRepository: { listByDate: vi.fn(), create: vi.fn() },
}));
vi.mock("@/repositories", () => ({ weightRepository }));

import { GET as mealsGet } from "@/app/api/meals/route";
import { localDevUserIdEnvKey } from "@/lib/api/identity";
import { GET as calendarGet } from "@/app/api/calendar/history/route";
import { POST as logsPost } from "@/app/api/logs/route";
import { PUT as prefPut } from "@/app/api/notifications/preferences/route";

describe("misc API contracts", () => {
  beforeEach(() => {
    process.env[localDevUserIdEnvKey] = "u1";
  });

  it("meals validates query enum values", async () => {
    const response = await mealsGet(
      new NextRequest("http://localhost/api/meals?mealType=brunch"),
    );
    expect(response.status).toBe(400);
  });

  it("calendar validates date range query", async () => {
    const response = await calendarGet(
      new NextRequest(
        "http://localhost/api/calendar/history?from=bad&to=2026-01-01",
      ),
    );
    expect(response.status).toBe(400);
  });

  it("logs validates body schema", async () => {
    const response = await logsPost(
      new NextRequest("http://localhost/api/logs", {
        method: "POST",
        body: JSON.stringify({ userId: "u1", date: "2026-01-01", unit: "lb" }),
      }),
    );
    expect(response.status).toBe(400);
  });

  it("notification preferences validates hh:mm format", async () => {
    const response = await prefPut(
      new NextRequest("http://localhost/api/notifications/preferences", {
        method: "PUT",
        body: JSON.stringify({ quietHoursStart: "25:00" }),
      }),
    );
    expect(response.status).toBe(400);
  });
});
