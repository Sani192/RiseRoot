import { addDays, format, parseISO } from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

const ISO_LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoLocalDate(value: string): boolean {
  return ISO_LOCAL_DATE_PATTERN.test(value);
}

export function parseUtcIsoDateOnly(value: string): Date {
  if (!isIsoLocalDate(value)) throw new Error(`Invalid ISO local date: ${value}`);
  return parseISO(`${value}T00:00:00.000Z`);
}

export function normalizeUtcDate(value: Date | string): Date {
  const date = typeof value === "string" ? parseISO(value) : value;
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date input");
  return date;
}

export function toUtcIsoDateKey(value: Date): string {
  return format(value, "yyyy-MM-dd");
}

export function toLocalIsoDate(value: Date, timeZone: string): string {
  return formatInTimeZone(value, timeZone, "yyyy-MM-dd");
}

export function localDayStartUtc(localDate: string, timeZone: string): Date {
  return fromZonedTime(`${localDate}T00:00:00`, timeZone);
}

export function localDayEndUtc(localDate: string, timeZone: string): Date {
  return fromZonedTime(`${localDate}T23:59:59.999`, timeZone);
}

export function formatLocalDisplayDate(value: Date | string, timeZone: string, pattern = "MMM d, yyyy"): string {
  return formatInTimeZone(normalizeUtcDate(value), timeZone, pattern);
}

export function formatUtcIsoTimestamp(value: Date = new Date()): string {
  return normalizeUtcDate(value).toISOString();
}

export function generateSafeLocalDateKey(value: Date, timeZone: string): string {
  return formatInTimeZone(value, timeZone, "yyyy-MM-dd");
}

export function eachUtcDateKeyInRange(fromDate: string, toDate: string): string[] {
  const from = parseUtcIsoDateOnly(fromDate);
  const to = parseUtcIsoDateOnly(toDate);
  const out: string[] = [];
  for (let cursor = from; cursor <= to; cursor = addDays(cursor, 1)) out.push(toUtcIsoDateKey(cursor));
  return out;
}

export function localWeekdayIndex(value: Date, timeZone: string): number {
  return toZonedTime(value, timeZone).getDay();
}
