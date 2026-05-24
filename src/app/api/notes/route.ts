import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { withApiHandler, parseJsonBody, parseWithSchema } from "@/lib/api/response";
import { formatUtcIsoTimestamp, localDayStartUtc, toLocalIsoDate } from "@/lib/date";
import { z } from "zod";

const notes = new Map<string, { body: string; utcDate: string; updatedAtUtc: string }>();
const getQuerySchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), timezone: z.string().min(1).default("UTC") }).strict();
const putBodySchema = z.object({ body: z.string().max(5000), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), timezone: z.string().min(1) }).strict();

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const query = parseWithSchema({ date: request.nextUrl.searchParams.get("date") ?? "", timezone: request.nextUrl.searchParams.get("timezone") ?? "UTC" }, getQuerySchema, "query");
    const found = notes.get(query.date);
    if (!found) throw new ApiError("NOT_FOUND", "Note not found.", 404);
    return { body: found.body, date: toLocalIsoDate(new Date(found.utcDate), query.timezone), updatedAt: found.updatedAtUtc };
  });
}

export async function PUT(request: NextRequest) {
  return withApiHandler(async () => {
    const body = await parseJsonBody(request, putBodySchema);
    const utcDate = localDayStartUtc(body.date, body.timezone).toISOString();
    const record = { utcDate, body: body.body.trim(), updatedAtUtc: formatUtcIsoTimestamp() };
    notes.set(body.date, record);
    return { body: record.body, date: body.date, updatedAt: record.updatedAtUtc };
  });
}
