import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const repo = {
  upsertByUtcDay: vi.fn(),
  findByUtcDay: vi.fn(),
};

vi.mock("@/repositories", () => ({ noteRepository: repo }));

import { GET, PUT } from "@/app/api/notes/route";

describe("notes API contract", () => {
  beforeEach(() => {
    repo.upsertByUtcDay.mockReset();
    repo.findByUtcDay.mockReset();
  });

  it("returns validation envelope for invalid timezone", async () => {
    const response = await GET(new NextRequest("http://localhost/api/notes?userId=u1&date=2026-03-09&timezone=Not/AZone"));
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("roundtrips note across DST boundary dates", async () => {
    repo.upsertByUtcDay.mockResolvedValue({
      id: "n1",
      userId: "u1",
      utcDayStart: "2026-03-08T05:00:00.000Z",
      content: "DST note",
      updatedAt: "2026-03-08T05:15:00.000Z",
    });
    repo.findByUtcDay.mockResolvedValue({
      id: "n1",
      userId: "u1",
      utcDayStart: "2026-03-08T05:00:00.000Z",
      content: "DST note",
      updatedAt: "2026-03-08T05:15:00.000Z",
    });

    const putReq = new NextRequest("http://localhost/api/notes", {
      method: "PUT",
      body: JSON.stringify({ userId: "u1", date: "2026-03-08", timezone: "America/New_York", body: " DST note " }),
    });
    const putResponse = await PUT(putReq);
    const putBody = await putResponse.json();

    expect(putResponse.status).toBe(200);
    expect(repo.upsertByUtcDay).toHaveBeenCalledWith({ userId: "u1", utcDayStart: "2026-03-08T05:00:00.000Z", content: "DST note" });
    expect(putBody.data.date).toBe("2026-03-08");

    const getResponse = await GET(new NextRequest("http://localhost/api/notes?userId=u1&date=2026-03-08&timezone=America/New_York"));
    const getBody = await getResponse.json();
    expect(getResponse.status).toBe(200);
    expect(getBody.data).toMatchObject({ body: "DST note", date: "2026-03-08" });
  });

  it("renders same UTC note value as different local dates by timezone", async () => {
    repo.findByUtcDay.mockImplementation(async (_userId: string, utcDayStart: string) => ({
      id: "n2",
      userId: "u1",
      utcDayStart,
      content: "Switch tz",
      updatedAt: "2026-01-01T00:00:00.000Z",
    }));

    const laResponse = await GET(new NextRequest("http://localhost/api/notes?userId=u1&date=2026-03-08&timezone=America/Los_Angeles"));
    const laBody = await laResponse.json();
    const tokyoResponse = await GET(new NextRequest("http://localhost/api/notes?userId=u1&date=2026-03-08&timezone=Asia/Tokyo"));
    const tokyoBody = await tokyoResponse.json();

    expect(laResponse.status).toBe(200);
    expect(tokyoResponse.status).toBe(200);
    expect(laBody.data.date).toBe("2026-03-08");
    expect(tokyoBody.data.date).toBe("2026-03-08");
    expect(repo.findByUtcDay).toHaveBeenNthCalledWith(1, "u1", "2026-03-08T08:00:00.000Z");
    expect(repo.findByUtcDay).toHaveBeenNthCalledWith(2, "u1", "2026-03-07T15:00:00.000Z");
  });

  it("returns not found envelope when repository has no note", async () => {
    repo.findByUtcDay.mockResolvedValue(null);
    const response = await GET(new NextRequest("http://localhost/api/notes?userId=u1&date=2026-03-09&timezone=UTC"));
    const body = await response.json();
    expect(response.status).toBe(404);
    expect(body.error).toMatchObject({ code: "NOT_FOUND", message: "Note not found." });
  });
});
