import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { GET, POST } from "@/app/api/tasks/route";

describe("tasks API contract", () => {
  it("returns validation envelope with 400 for invalid date query", async () => {
    const response = await GET(new NextRequest("http://localhost/api/tasks?date=05-24-2026"));
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toMatchObject({ code: "VALIDATION_ERROR", message: "date must be YYYY-MM-DD." });
    expect(body.error.details).toEqual([{ field: "date", message: "Expected YYYY-MM-DD." }]);
    expect(body.meta.requestId).toBeTypeOf("string");
  });

  it("returns conflict envelope with 409 for duplicate title", async () => {
    const request = new NextRequest("http://localhost/api/tasks", { method: "POST", body: JSON.stringify({ date: "2026-05-24", title: "duplicate" }) });
    const response = await POST(request);
    const body = await response.json();
    expect(response.status).toBe(409);
    expect(body.error).toMatchObject({ code: "CONFLICT", message: "Task already exists for this date." });
  });

  it("returns success envelope and trimmed title for valid payload", async () => {
    const request = new NextRequest("http://localhost/api/tasks", { method: "POST", body: JSON.stringify({ date: "2026-05-24", title: "  Hydrate  " }) });
    const response = await POST(request);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({ title: "Hydrate", completed: false, date: "2026-05-24" });
    expect(body.meta.generatedAt).toBeTypeOf("string");
  });
});
