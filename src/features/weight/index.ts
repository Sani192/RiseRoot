import type { FeatureBoundary, ISODateString } from "@/types";

export interface WeightLogEntry {
  date: ISODateString;
  weight: number;
  unit: "lb" | "kg";
}

export interface WeightTrendPoint extends WeightLogEntry {
  changeFromPrevious: number | null;
  rollingAverage: number;
}

function toISODateString(date: Date): ISODateString {
  return date.toISOString().slice(0, 10);
}

export function isSundayWeightLogDate(date: Date): boolean {
  return date.getDay() === 0;
}

export function createSundayWeightLog(
  weight: number,
  unit: WeightLogEntry["unit"] = "lb",
  date: Date = new Date(),
): WeightLogEntry {
  if (!isSundayWeightLogDate(date)) {
    throw new Error("Weekly weight logs are reserved for Sundays.");
  }

  return {
    date: toISODateString(date),
    weight,
    unit,
  };
}

export function upsertWeightLog(
  entries: readonly WeightLogEntry[],
  entry: WeightLogEntry,
): WeightLogEntry[] {
  const nextEntries = entries.filter(
    (currentEntry) => currentEntry.date !== entry.date,
  );
  nextEntries.push(entry);

  return nextEntries.sort((left, right) => left.date.localeCompare(right.date));
}

export function buildWeightTrendData(
  entries: readonly WeightLogEntry[],
  rollingWindowSize = 4,
): WeightTrendPoint[] {
  const sortedEntries = [...entries].sort((left, right) =>
    left.date.localeCompare(right.date),
  );

  return sortedEntries.map((entry, index) => {
    const windowEntries = sortedEntries.slice(
      Math.max(0, index - rollingWindowSize + 1),
      index + 1,
    );
    const rollingAverage =
      windowEntries.reduce((sum, windowEntry) => sum + windowEntry.weight, 0) /
      windowEntries.length;
    const previousEntry = sortedEntries[index - 1];

    return {
      ...entry,
      changeFromPrevious: previousEntry
        ? entry.weight - previousEntry.weight
        : null,
      rollingAverage: Number(rollingAverage.toFixed(1)),
    };
  });
}

export const weightFeature: FeatureBoundary = {
  name: "Weight",
  phase: "phase-1",
  status: "ready",
};
