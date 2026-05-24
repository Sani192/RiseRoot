import { NextRequest } from "next/server";
import { withApiHandler, parseWithSchema } from "@/lib/api/response";
import { getActiveUserId } from "@/lib/supabase/session";
import { ApiError } from "@/lib/api/errors";
import { getCalendarHistory } from "@/features/calendar-history";
import { z } from "zod";

const querySchema = z.object({ from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).strict();

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const userId = getActiveUserId();
    if (!userId) throw new ApiError("VALIDATION_ERROR", "NEXT_PUBLIC_APP_USER_ID must be set.", 400);
    const query = parseWithSchema({ from: request.nextUrl.searchParams.get("from") ?? "", to: request.nextUrl.searchParams.get("to") ?? "" }, querySchema, "query");
    return getCalendarHistory(userId, query);
  });
}
