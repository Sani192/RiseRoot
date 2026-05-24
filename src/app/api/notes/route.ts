import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { withApiHandler, parseJsonBody, parseWithSchema } from "@/lib/api/response";
import { localDateToUtcDayStart, utcInstantToLocalIsoDate } from "@/lib/date";
import { noteRepository } from "@/repositories";
import { z } from "zod";
import { ianaTimezoneSchema, isoDateSchema, nonEmptyStringSchema } from "@/lib/api/validation";

const getQuerySchema = z.object({ userId: nonEmptyStringSchema, date: isoDateSchema, timezone: ianaTimezoneSchema.default("UTC") }).strict();
const putBodySchema = z.object({ userId: nonEmptyStringSchema, body: z.string().max(5000), date: isoDateSchema, timezone: ianaTimezoneSchema }).strict();

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const query = parseWithSchema({ userId: request.nextUrl.searchParams.get("userId") ?? "", date: request.nextUrl.searchParams.get("date") ?? "", timezone: request.nextUrl.searchParams.get("timezone") ?? "UTC" }, getQuerySchema, "query");
    const utcDayStart = localDateToUtcDayStart(query.date, query.timezone).toISOString();
    const found = await noteRepository.findByUtcDay(query.userId, utcDayStart);
    if (!found) throw new ApiError("NOT_FOUND", "Note not found.", 404);
    return { body: found.content, date: utcInstantToLocalIsoDate(new Date(found.utcDayStart), query.timezone), updatedAt: found.updatedAt };
  });
}

export async function PUT(request: NextRequest) {
  return withApiHandler(async () => {
    const body = await parseJsonBody(request, putBodySchema);
    const utcDayStart = localDateToUtcDayStart(body.date, body.timezone).toISOString();
    const record = await noteRepository.upsertByUtcDay({ userId: body.userId, utcDayStart, content: body.body.trim() });
    return { body: record.content, date: utcInstantToLocalIsoDate(new Date(record.utcDayStart), body.timezone), updatedAt: record.updatedAt };
  });
}
