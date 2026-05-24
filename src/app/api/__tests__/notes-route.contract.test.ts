import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/date", () => ({
  localDayStartUtc: (date: string, timezone: string) => {
    if (timezone === "America/Los_Angeles") return new Date("2026-03-08T08:00:00.000Z");
    if (timezone === "Asia/Tokyo") return new Date("2026-03-07T15:00:00.000Z");
    return new Date("2026-03-08T05:00:00.000Z");
  },
  toLocalIsoDate: () => "2026-03-08",
}));

const { repo } = vi.hoisted(() => ({ repo: { upsertByUtcDay: vi.fn(), findByUtcDay: vi.fn() } }));
vi.mock("@/repositories", () => ({ noteRepository: repo }));

import { GET, PUT } from "@/app/api/notes/route";

describe("notes API contract", () => {
  beforeEach(() => {
    repo.upsertByUtcDay.mockReset();
    repo.findByUtcDay.mockReset();
  });

  it("returns validation envelope for invalid timezone", async () => {
    const response = await GET(new NextRequest("http://localhost/api/notes?userId=u1&date=2026-03-09&timezone=Not/AZone"));
    expect(response.status).toBe(400);
  });

  it("roundtrips note across DST boundary dates", async () => {
    repo.upsertByUtcDay.mockResolvedValue({ id: "n1", userId: "u1", utcDayStart: "2026-03-08T05:00:00.000Z", content: "DST note", updatedAt: "2026-03-08T05:15:00.000Z" });
    repo.findByUtcDay.mockResolvedValue({ id: "n1", userId: "u1", utcDayStart: "2026-03-08T05:00:00.000Z", content: "DST note", updatedAt: "2026-03-08T05:15:00.000Z" });
    const putResponse = await PUT(new NextRequest("http://localhost/api/notes", { method: "PUT", body: JSON.stringify({ userId: "u1", date: "2026-03-08", timezone: "America/New_York", body: " DST note " }) }));
    expect(putResponse.status).toBe(200);
    expect(repo.upsertByUtcDay).toHaveBeenCalledWith({ userId: "u1", utcDayStart: "2026-03-08T05:00:00.000Z", content: "DST note" });
  });
});
