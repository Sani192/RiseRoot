import { describe, expect, it } from "vitest";

import { generateOccurrences, occursOnLocalDate, toLocalIsoDate, type RecurrenceDefinition } from "@/features/schedule-engine";

describe("schedule engine edge cases", () => {
  it("handles timezone rollover between UTC+14 and UTC-11", () => {
    const at = new Date("2026-01-01T10:30:00.000Z");
    expect(toLocalIsoDate(at, "Pacific/Kiritimati")).toBe("2026-01-02");
    expect(toLocalIsoDate(at, "Pacific/Pago_Pago")).toBe("2025-12-31");
  });

  it("respects weekly recurrence interval and weekdays", () => {
    const def: RecurrenceDefinition = { id: "w", type: "task", title: "Run", frequency: "weekly", interval: 2, weekdays: [1, 4], startDate: "2026-01-01" };
    expect(generateOccurrences(def, "2026-01-01", "2026-01-31")).toEqual(["2026-01-01", "2026-01-05", "2026-01-15", "2026-01-19", "2026-01-29"]);
  });

  it("keeps generated occurrences de-duplicated for single-day windows", () => {
    const def: RecurrenceDefinition = { id: "d", type: "task", title: "Hydrate", frequency: "daily", interval: 1, startDate: "2026-05-24" };
    const hits = generateOccurrences(def, "2026-05-24", "2026-05-24");
    expect(hits).toEqual(["2026-05-24"]);
    expect(new Set(hits).size).toBe(hits.length);
    expect(occursOnLocalDate(def, "2026-05-24")).toBe(true);
  });
});
