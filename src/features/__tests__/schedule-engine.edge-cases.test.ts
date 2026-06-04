import { describe, expect, it } from "vitest";

import {
  fromUtcPersistenceTimestampToLocalDate,
  generateOccurrences,
  occursOnLocalDate,
  toLocalIsoDate,
  toUtcPersistenceTimestamp,
  type RecurrenceDefinition,
} from "@/features/schedule-engine";

describe("schedule engine edge cases", () => {
  it("handles DST start/end transitions in America/New_York", () => {
    const recurrence: RecurrenceDefinition = {
      id: "dst",
      type: "task",
      title: "Check-in",
      frequency: "daily",
      startDate: "2026-03-07",
    };
    expect(
      occursOnLocalDate({
        userTimeZone: "America/New_York",
        recurrence,
        localDate: "2026-03-08",
      }),
    ).toBe(true);
    expect(
      occursOnLocalDate({
        userTimeZone: "America/New_York",
        recurrence,
        localDate: "2026-11-01",
      }),
    ).toBe(true);
  });

  it("respects midnight boundaries in non-UTC zones", () => {
    const at = new Date("2026-01-01T18:45:00.000Z");
    expect(toLocalIsoDate(at, "Asia/Kolkata")).toBe("2026-01-02");
    expect(toLocalIsoDate(at, "America/New_York")).toBe("2026-01-01");
  });

  it("keeps historical backfill consistency for weekly recurrence windows", () => {
    const recurrence: RecurrenceDefinition = {
      id: "w",
      type: "task",
      title: "Run",
      frequency: "weekly",
      interval: 2,
      weekdays: [1, 4],
      startDate: "2026-01-01",
      metadata: { source: "backfill" },
    };
    expect(
      generateOccurrences({
        userTimeZone: "America/New_York",
        recurrence,
        localDateRange: { from: "2025-11-01", to: "2026-01-31" },
      }),
    ).toEqual([
      "2026-01-01",
      "2026-01-05",
      "2026-01-15",
      "2026-01-19",
      "2026-01-29",
    ]);
  });

  it("converts local persistence dates to UTC and back consistently", () => {
    const nyUtc = toUtcPersistenceTimestamp("2026-03-08", "America/New_York");
    const istUtc = toUtcPersistenceTimestamp("2026-03-08", "Asia/Kolkata");
    expect(
      fromUtcPersistenceTimestampToLocalDate(nyUtc, "America/New_York"),
    ).toBe("2026-03-08");
    expect(fromUtcPersistenceTimestampToLocalDate(istUtc, "Asia/Kolkata")).toBe(
      "2026-03-08",
    );
  });
});
