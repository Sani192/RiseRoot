import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/date", () => ({ toLocalIsoDate: () => "2026-05-24" }));

const { getDayAggregate } = vi.hoisted(() => ({ getDayAggregate: vi.fn() }));
vi.mock("@/lib/services/day-aggregate", () => ({ getDayAggregate }));

import { GET } from "@/app/api/days/route";
import { localDevUserIdEnvKey } from "@/lib/identity/authentication";

describe("days API contract", () => {
  beforeEach(() => {
    process.env[localDevUserIdEnvKey] = "u1";
    getDayAggregate.mockReset();
  });

  it("returns 401 when no server-side identity is available", async () => {
    delete process.env[localDevUserIdEnvKey];
    const response = await GET(
      new NextRequest("http://localhost/api/days?date=2026-03-08"),
    );
    const body = await response.json();
    expect(response.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns validation envelope for malformed query", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/days?date=bad"),
    );
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.meta.requestId).toBeTypeOf("string");
  });

  it("rejects client-supplied ownership that does not match the session", async () => {
    const response = await GET(
      new NextRequest(
        "http://localhost/api/days?userId=attacker&date=2026-03-08&timezone=UTC",
      ),
    );
    const body = await response.json();
    expect(response.status).toBe(403);
    expect(body.error.code).toBe("FORBIDDEN");
    expect(getDayAggregate).not.toHaveBeenCalled();
  });

  it("passes timezone, resolved date, and server-side user to service", async () => {
    getDayAggregate.mockResolvedValueOnce({
      date: "2026-03-08",
      timezone: "America/New_York",
      tasks: [],
      workouts: [],
      note: null,
      logs: [],
    });
    const response = await GET(
      new NextRequest(
        "http://localhost/api/days?date=2026-03-08&timezone=America/New_York",
      ),
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(getDayAggregate).toHaveBeenCalledWith({
      userId: "u1",
      date: "2026-03-08",
      timezone: "America/New_York",
    });
    expect(body.data.timezone).toBe("America/New_York");
  });
});
