import { NextRequest } from "next/server";
import { toLocalIsoDate } from "@/lib/date";
import { withApiHandler, parseWithSchema } from "@/lib/api/response";
import { z } from "zod";
import { ianaTimezoneSchema, isoDateSchema, nonEmptyStringSchema } from "@/lib/api/validation";
import { getDayAggregate } from "@/lib/services/day-aggregate";

const querySchema = z
  .object({
    userId: nonEmptyStringSchema,
    date: isoDateSchema.optional(),
    timezone: ianaTimezoneSchema.default("UTC"),
  })
  .strict();

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const query = parseWithSchema(
      {
        userId: request.nextUrl.searchParams.get("userId") ?? "",
        date: request.nextUrl.searchParams.get("date") ?? undefined,
        timezone: request.nextUrl.searchParams.get("timezone") ?? "UTC",
      },
      querySchema,
      "query",
    );

    const date = query.date ?? toLocalIsoDate(new Date(), query.timezone);
    return getDayAggregate({ userId: query.userId, date, timezone: query.timezone });
  });
}
