import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/date", () => ({ toLocalIsoDate: () => "2026-05-24" }));


const getDayAggregate = vi.fn();
vi.mock("@/lib/services/day-aggregate", () => ({ getDayAggregate }));

import { GET } from "@/app/api/days/route";

describe("days API contract", () => {
  it("returns validation envelope for malformed query", async () => {
    const response = await GET(new NextRequest("http://localhost/api/days?date=bad&userId="));
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.meta.requestId).toBeTypeOf("string");
  });

  it("passes timezone and resolved date to service", async () => {
    getDayAggregate.mockResolvedValueOnce({ date: "2026-03-08", timezone: "America/New_York", tasks: [], workouts: [], note: null, logs: [] });
    const response = await GET(new NextRequest("http://localhost/api/days?userId=u1&date=2026-03-08&timezone=America/New_York"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(getDayAggregate).toHaveBeenCalledWith({ userId: "u1", date: "2026-03-08", timezone: "America/New_York" });
    expect(body.data.timezone).toBe("America/New_York");
  });
});
