import { createHash } from "node:crypto";

import { eachUtcDateKeyInRange, localDateToUtcDayStart, localWeekdayIndex, utcInstantToLocalIsoDate } from "@/lib/date";

export type RecurrenceFrequency = "daily" | "weekly";

export type RecurrenceRuleMetadata = Record<string, string | number | boolean | null>;

export type RecurrenceDefinition = {
  id: string;
  type: "task" | "workout";
  title: string;
  frequency: RecurrenceFrequency;
  interval?: number;
  weekdays?: number[];
  startDate: string;
  endDate?: string;
  metadata?: RecurrenceRuleMetadata;
};

export type RecurrenceEvaluationInput = {
  userTimeZone: string;
  localDate: string;
  recurrence: RecurrenceDefinition;
};

export type RecurrenceRangeEvaluationInput = {
  userTimeZone: string;
  localDateRange: { from: string; to: string };
  recurrence: RecurrenceDefinition;
};

export function createGenerationKey(userId: string, recurrenceId: string, localDate: string): string {
  return `${userId}:${recurrenceId}:${localDate}`;
}

export function deterministicUuid(input: string): string {
  const hash = createHash("sha256").update(input).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export function occursOnLocalDate({ userTimeZone, localDate, recurrence }: RecurrenceEvaluationInput): boolean {
  const interval = Math.max(recurrence.interval ?? 1, 1);
  if (localDate < recurrence.startDate || (recurrence.endDate && localDate > recurrence.endDate)) return false;

  const startLocalUtc = localDateToUtcDayStart(recurrence.startDate, userTimeZone);
  const targetLocalUtc = localDateToUtcDayStart(localDate, userTimeZone);
  const daysBetween = Math.floor((targetLocalUtc.getTime() - startLocalUtc.getTime()) / 86_400_000);

  if (recurrence.frequency === "daily") return daysBetween % interval === 0;

  const weeksBetween = Math.floor(daysBetween / 7);
  const weekday = localWeekdayIndex(targetLocalUtc, userTimeZone);
  const startWeekday = localWeekdayIndex(startLocalUtc, userTimeZone);
  const allowedWeekdays = recurrence.weekdays ?? [startWeekday];
  return weeksBetween % interval === 0 && allowedWeekdays.includes(weekday);
}

export function generateOccurrences({ userTimeZone, recurrence, localDateRange }: RecurrenceRangeEvaluationInput): string[] {
  return eachUtcDateKeyInRange(localDateRange.from, localDateRange.to).filter((localDate) => occursOnLocalDate({ userTimeZone, localDate, recurrence }));
}

export function toUtcPersistenceTimestamp(localDate: string, userTimeZone: string): string {
  return localDateToUtcDayStart(localDate, userTimeZone).toISOString();
}

export function fromUtcPersistenceTimestampToLocalDate(utcTimestamp: string, userTimeZone: string): string {
  return utcInstantToLocalIsoDate(new Date(utcTimestamp), userTimeZone);
}
