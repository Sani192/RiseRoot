import { describe, expect, it } from "vitest";

import {
  createGenerationKey,
  deterministicUuid,
  generateOccurrences,
  occursOnLocalDate,
  toLocalIsoDate,
  type RecurrenceDefinition,
} from "@/features/schedule-engine";

describe("schedule engine", () => {
  it("normalizes local date boundaries in IST and US zones", () => {
    const instant = new Date("2026-03-10T23:45:00.000Z");
    expect(toLocalIsoDate(instant, "Asia/Kolkata")).toBe("2026-03-11");
    expect(toLocalIsoDate(instant, "America/Los_Angeles")).toBe("2026-03-10");
  });

  it("handles DST transition boundaries deterministically", () => {
    const beforeDst = new Date("2026-03-08T09:30:00.000Z");
    const afterDst = new Date("2026-03-08T10:30:00.000Z");
    expect(toLocalIsoDate(beforeDst, "America/Los_Angeles")).toBe("2026-03-08");
    expect(toLocalIsoDate(afterDst, "America/Los_Angeles")).toBe("2026-03-08");
  });

  it("generates past and future recurrence dates deterministically", () => {
    const recurrence: RecurrenceDefinition = {
      id: "hydrate",
      type: "task",
      title: "Hydration",
      frequency: "weekly",
      weekdays: [1, 3, 5],
      startDate: "2026-01-01",
    };

    const occurrences = generateOccurrences({
      userTimeZone: "America/New_York",
      recurrence,
      localDateRange: { from: "2025-12-29", to: "2026-01-12" },
    });
    expect(occurrences).toEqual([
      "2026-01-02",
      "2026-01-05",
      "2026-01-07",
      "2026-01-09",
      "2026-01-12",
    ]);
    expect(
      occursOnLocalDate({
        userTimeZone: "America/New_York",
        recurrence,
        localDate: "2026-01-06",
      }),
    ).toBe(false);
  });

  it("creates idempotent generation keys and UUIDs", () => {
    const key = createGenerationKey(
      "user-1",
      "daily-plan:monday-priority-map",
      "2026-05-25",
    );
    expect(key).toBe("user-1:daily-plan:monday-priority-map:2026-05-25");
    expect(deterministicUuid(key)).toBe(deterministicUuid(key));
    expect(deterministicUuid(key)).toMatch(/[0-9a-f-]{36}/);
  });
});
