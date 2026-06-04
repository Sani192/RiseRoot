import { describe, expect, it } from "vitest";

import {
  localDateToUtcDayStart,
  localDateUtcDayRange,
  utcInstantToLocalIsoDate,
} from "@/lib/date";

describe("canonical day timezone helpers", () => {
  it("computes UTC day-start across DST start and end", () => {
    expect(
      localDateToUtcDayStart("2026-03-08", "America/New_York").toISOString(),
    ).toBe("2026-03-08T05:00:00.000Z");
    expect(
      localDateToUtcDayStart("2026-11-01", "America/New_York").toISOString(),
    ).toBe("2026-11-01T04:00:00.000Z");
  });

  it("returns half-open UTC ranges with midnight boundary transitions", () => {
    const spring = localDateUtcDayRange("2026-03-08", "America/New_York");
    expect(spring.start.toISOString()).toBe("2026-03-08T05:00:00.000Z");
    expect(spring.endExclusive.toISOString()).toBe("2026-03-09T04:00:00.000Z");

    const fall = localDateUtcDayRange("2026-11-01", "America/New_York");
    expect(fall.start.toISOString()).toBe("2026-11-01T04:00:00.000Z");
    expect(fall.endExclusive.toISOString()).toBe("2026-11-02T05:00:00.000Z");
  });

  it("keeps stored UTC records stable while local timezone switches", () => {
    const storedUtc = "2026-03-08T05:00:00.000Z";
    expect(utcInstantToLocalIsoDate(storedUtc, "America/New_York")).toBe(
      "2026-03-08",
    );
    expect(utcInstantToLocalIsoDate(storedUtc, "UTC")).toBe("2026-03-08");
    expect(utcInstantToLocalIsoDate(storedUtc, "Asia/Tokyo")).toBe(
      "2026-03-08",
    );
  });
});
