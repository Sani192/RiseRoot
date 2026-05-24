import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const { repo } = vi.hoisted(() => ({ repo: { listUpcoming: vi.fn(), upsert: vi.fn() } }));
vi.mock("@/repositories", () => ({ workoutRepository: repo }));

import { GET, POST } from "@/app/api/workouts/route";

describe("workouts API contract", () => {
  it("returns malformed-body envelope", async () => {
    const response = await POST(new NextRequest("http://localhost/api/workouts", { method: "POST", body: "{" }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns success envelope", async () => {
    repo.listUpcoming.mockResolvedValueOnce([{ id: "w1", name: "Run", status: "planned" }]);
    const response = await GET(new NextRequest("http://localhost/api/workouts?userId=u1"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data[0]).toMatchObject({ id: "w1", title: "Run" });
  });
});
