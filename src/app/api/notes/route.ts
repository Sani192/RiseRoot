import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { withApiHandler, parseJsonBody, parseWithSchema } from "@/lib/api/response";
import { localDayStartUtc, toLocalIsoDate } from "@/lib/date";
import { noteRepository } from "@/repositories";
import { z } from "zod";

const isValidTimeZone = (value: string): boolean => {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
};

const timeZoneSchema = z.string().trim().min(1).refine(isValidTimeZone, "Invalid IANA timezone.");
const getQuerySchema = z.object({ userId: z.string().trim().min(1), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), timezone: timeZoneSchema.default("UTC") }).strict();
const putBodySchema = z.object({ userId: z.string().trim().min(1), body: z.string().max(5000), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), timezone: timeZoneSchema }).strict();

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const query = parseWithSchema({ userId: request.nextUrl.searchParams.get("userId") ?? "", date: request.nextUrl.searchParams.get("date") ?? "", timezone: request.nextUrl.searchParams.get("timezone") ?? "UTC" }, getQuerySchema, "query");
    const utcDayStart = localDayStartUtc(query.date, query.timezone).toISOString();
    const found = await noteRepository.findByUtcDay(query.userId, utcDayStart);
    if (!found) throw new ApiError("NOT_FOUND", "Note not found.", 404);
    return { body: found.content, date: toLocalIsoDate(new Date(found.utcDayStart), query.timezone), updatedAt: found.updatedAt };
  });
}

export async function PUT(request: NextRequest) {
  return withApiHandler(async () => {
    const body = await parseJsonBody(request, putBodySchema);
    const utcDayStart = localDayStartUtc(body.date, body.timezone).toISOString();
    const record = await noteRepository.upsertByUtcDay({ userId: body.userId, utcDayStart, content: body.body.trim() });
    return { body: record.content, date: toLocalIsoDate(new Date(record.utcDayStart), body.timezone), updatedAt: record.updatedAt };
  });
}
