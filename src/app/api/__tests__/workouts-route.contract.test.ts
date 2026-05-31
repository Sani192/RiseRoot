import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { repo } = vi.hoisted(() => ({
  repo: { listUpcoming: vi.fn(), upsert: vi.fn() },
}));
vi.mock("@/repositories", () => ({ workoutRepository: repo }));

import { GET, POST } from "@/app/api/workouts/route";
import { localDevUserIdEnvKey } from "@/lib/api/identity";

describe("workouts API contract", () => {
  beforeEach(() => {
    process.env[localDevUserIdEnvKey] = "u1";
    repo.listUpcoming.mockReset();
    repo.upsert.mockReset();
  });

  it("returns 401 when no server-side identity is available", async () => {
    delete process.env[localDevUserIdEnvKey];
    const response = await GET(
      new NextRequest("http://localhost/api/workouts"),
    );
    const body = await response.json();
    expect(response.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns malformed-body envelope", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/workouts", {
        method: "POST",
        body: "{",
      }),
    );
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns success envelope with server-side ownership", async () => {
    repo.listUpcoming.mockResolvedValueOnce([
      { id: "w1", name: "Run", status: "planned" },
    ]);
    const response = await GET(
      new NextRequest("http://localhost/api/workouts"),
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(repo.listUpcoming).toHaveBeenCalledWith("u1");
    expect(body.data[0]).toMatchObject({ id: "w1", title: "Run" });
  });

  it("returns 403 when the request body tries to override ownership", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/workouts", {
        method: "POST",
        body: JSON.stringify({ userId: "attacker", title: "Run" }),
      }),
    );
    const body = await response.json();
    expect(response.status).toBe(403);
    expect(body.error.code).toBe("FORBIDDEN");
    expect(repo.upsert).not.toHaveBeenCalled();
  });

  it("creates workouts for the server-side user", async () => {
    repo.upsert.mockResolvedValueOnce({
      id: "w1",
      name: "Run",
      status: "planned",
    });
    const response = await POST(
      new NextRequest("http://localhost/api/workouts", {
        method: "POST",
        body: JSON.stringify({ title: " Run " }),
      }),
    );
    expect(response.status).toBe(200);
    expect(repo.upsert).toHaveBeenCalledWith({
      userId: "u1",
      name: "Run",
      status: "planned",
    });
  });
});
