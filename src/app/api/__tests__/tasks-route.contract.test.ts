import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { repositories } = vi.hoisted(() => ({ repositories: {
  scheduleRepository: { upsertPlan: vi.fn() },
  taskRepository: { listByDate: vi.fn(), upsert: vi.fn() },
} }));

vi.mock("@/repositories", () => repositories);

import { GET, POST } from "@/app/api/tasks/route";

describe("tasks API contract", () => {
  beforeEach(() => {
    repositories.scheduleRepository.upsertPlan.mockReset();
    repositories.taskRepository.listByDate.mockReset();
    repositories.taskRepository.upsert.mockReset();
  });

  it("returns validation envelope with 400 for invalid date query", async () => {
    const response = await GET(new NextRequest("http://localhost/api/tasks?date=05-24-2026&userId=u1"));
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.details).toEqual([{ field: "date", message: "Expected YYYY-MM-DD." }]);
  });

  it("returns validation envelope for malformed json payload", async () => {
    const response = await POST(new NextRequest("http://localhost/api/tasks", { method: "POST", body: "{" }));
    expect(response.status).toBe(400);
  });

  it("returns success envelope and trimmed title for valid payload", async () => {
    repositories.scheduleRepository.upsertPlan.mockResolvedValueOnce({ id: "p1" });
    repositories.taskRepository.upsert.mockResolvedValueOnce({ id: "t1", title: "Hydrate", status: "todo" });
    const request = new NextRequest("http://localhost/api/tasks", { method: "POST", body: JSON.stringify({ userId: "u1", date: "2026-05-24", title: "  Hydrate  " }) });
    const response = await POST(request);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({ title: "Hydrate", completed: false, date: "2026-05-24" });
  });
});
