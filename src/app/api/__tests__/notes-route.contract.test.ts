import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { repo } = vi.hoisted(() => ({
  repo: { upsertByDate: vi.fn(), findByDate: vi.fn() },
}));
vi.mock("@/repositories", () => ({ noteRepository: repo }));

import { GET, PUT } from "@/app/api/notes/route";
import { localDevUserIdEnvKey } from "@/lib/identity/authentication";

describe("notes API contract", () => {
  beforeEach(() => {
    process.env[localDevUserIdEnvKey] = "u1";
    repo.upsertByDate.mockReset();
    repo.findByDate.mockReset();
  });

  it("returns 401 when no server-side identity is available", async () => {
    delete process.env[localDevUserIdEnvKey];
    const response = await GET(
      new NextRequest(
        "http://localhost/api/notes?date=2026-03-09&timezone=UTC",
      ),
    );
    const body = await response.json();
    expect(response.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns validation envelope for invalid timezone", async () => {
    const response = await GET(
      new NextRequest(
        "http://localhost/api/notes?date=2026-03-09&timezone=Not/AZone",
      ),
    );
    expect(response.status).toBe(400);
  });

  it("returns 403 when the request body tries to override ownership", async () => {
    const response = await PUT(
      new NextRequest("http://localhost/api/notes", {
        method: "PUT",
        body: JSON.stringify({
          userId: "attacker",
          date: "2026-03-08",
          timezone: "UTC",
          body: "Boundary note",
        }),
      }),
    );
    const body = await response.json();
    expect(response.status).toBe(403);
    expect(body.error.code).toBe("FORBIDDEN");
    expect(repo.upsertByDate).not.toHaveBeenCalled();
  });

  it.each([
    ["spring-forward", "2026-03-08", "America/New_York"],
    ["west-of-UTC", "2026-03-08", "America/Los_Angeles"],
    ["east-of-UTC", "2026-03-08", "Asia/Tokyo"],
    ["fall-back", "2026-11-01", "America/New_York"],
  ])(
    "roundtrips local note dates without UTC conversion around %s boundaries",
    async (_label, date, timezone) => {
      repo.upsertByDate.mockResolvedValue({
        id: "n1",
        userId: "u1",
        noteDate: date,
        body: "Boundary note",
        dailyPlanId: null,
        updatedAt: "2026-03-08T05:15:00.000Z",
      });
      repo.findByDate.mockResolvedValue({
        id: "n1",
        userId: "u1",
        noteDate: date,
        body: "Boundary note",
        dailyPlanId: null,
        updatedAt: "2026-03-08T05:15:00.000Z",
      });

      const putResponse = await PUT(
        new NextRequest("http://localhost/api/notes", {
          method: "PUT",
          body: JSON.stringify({ date, timezone, body: " Boundary note " }),
        }),
      );
      expect(putResponse.status).toBe(200);
      await expect(putResponse.json()).resolves.toMatchObject({
        data: { body: "Boundary note", date, timezone },
      });
      expect(repo.upsertByDate).toHaveBeenCalledWith({
        userId: "u1",
        noteDate: date,
        body: "Boundary note",
      });

      const getResponse = await GET(
        new NextRequest(
          `http://localhost/api/notes?date=${date}&timezone=${encodeURIComponent(timezone)}`,
        ),
      );
      expect(getResponse.status).toBe(200);
      await expect(getResponse.json()).resolves.toMatchObject({
        data: { body: "Boundary note", date, timezone },
      });
      expect(repo.findByDate).toHaveBeenCalledWith("u1", date);
    },
  );
});
