import { NextRequest } from "next/server";
import { toLocalIsoDate } from "@/lib/date";
import { withApiHandler, parseWithSchema } from "@/lib/api/response";
import { z } from "zod";
import {
  ianaTimezoneSchema,
  isoDateSchema,
  nonEmptyStringSchema,
} from "@/lib/api/validation";
import { getDayAggregate } from "@/lib/services/day-aggregate";
import {
  assertAuthorizedUserId,
  requireAuthenticatedUser,
} from "@/lib/identity/authentication";

const querySchema = z
  .object({
    userId: nonEmptyStringSchema.optional(),
    date: isoDateSchema.optional(),
    timezone: ianaTimezoneSchema.default("UTC"),
  })
  .strict();

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await requireAuthenticatedUser(request);
    const query = parseWithSchema(
      {
        userId: request.nextUrl.searchParams.get("userId") ?? undefined,
        date: request.nextUrl.searchParams.get("date") ?? undefined,
        timezone: request.nextUrl.searchParams.get("timezone") ?? "UTC",
      },
      querySchema,
      "query",
    );
    assertAuthorizedUserId(query.userId, user.id);

    const date = query.date ?? toLocalIsoDate(new Date(), query.timezone);
    return getDayAggregate({ userId: user.id, date, timezone: query.timezone });
  });
}
