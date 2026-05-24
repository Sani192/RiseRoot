import { NextRequest } from "next/server";
import { withApiHandler, parseJsonBody, parseWithSchema } from "@/lib/api/response";
import { ApiError } from "@/lib/api/errors";
import { getActiveUserId } from "@/lib/supabase/session";
import { weightRepository } from "@/repositories";
import { z } from "zod";
import { isoDateSchema, nonEmptyStringSchema } from "@/lib/api/validation";

const querySchema = z.object({ date: isoDateSchema, userId: nonEmptyStringSchema }).strict();
const createSchema = z.object({ userId: nonEmptyStringSchema, date: isoDateSchema, weight: z.number().positive(), unit: z.enum(["lb", "kg"]) }).strict();

export async function GET(request: NextRequest) { /* unchanged */
  return withApiHandler(async () => {
    const activeUserId = getActiveUserId();
    if (!activeUserId) throw new ApiError("VALIDATION_ERROR", "NEXT_PUBLIC_APP_USER_ID must be set.", 400);
    const query = parseWithSchema({ date: request.nextUrl.searchParams.get("date") ?? "", userId: request.nextUrl.searchParams.get("userId") ?? "" }, querySchema, "query");
    if (query.userId !== activeUserId) throw new ApiError("VALIDATION_ERROR", "User mismatch.", 403);
    const rows = await weightRepository.listByDate(query.userId, query.date);
    return rows.map((row) => ({ id: row.id, userId: row.userId, loggedOn: row.loggedOn, weightValue: row.weightValue, weightUnit: row.weightUnit, source: row.source }));
  });
}

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const activeUserId = getActiveUserId();
    if (!activeUserId) throw new ApiError("VALIDATION_ERROR", "NEXT_PUBLIC_APP_USER_ID must be set.", 400);
    const body = await parseJsonBody(request, createSchema);
    if (body.userId !== activeUserId) throw new ApiError("VALIDATION_ERROR", "User mismatch.", 403);
    const row = await weightRepository.create({ userId: body.userId, loggedOn: body.date, weightValue: body.weight, weightUnit: body.unit, source: "manual" });
    return { id: row.id, userId: row.userId, loggedOn: row.loggedOn, weightValue: row.weightValue, weightUnit: row.weightUnit, source: row.source };
  });
}
