import { z } from "zod";

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD.");

export const nonEmptyStringSchema = z.string().trim().min(1);

export const ianaTimezoneSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => {
    try {
      Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
      return true;
    } catch {
      return false;
    }
  }, "Invalid IANA timezone.");
