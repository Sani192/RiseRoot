import { NextRequest } from "next/server";
import { assertDate, withApiHandler } from "@/lib/api/response";
import { getActiveUserId } from "@/lib/supabase/session";
import { ApiError } from "@/lib/api/errors";
import { getCalendarHistory } from "@/features/calendar-history";

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const userId = getActiveUserId();
    if (!userId) {
      throw new ApiError("VALIDATION_ERROR", "NEXT_PUBLIC_APP_USER_ID must be set.", 400);
    }

    const from = assertDate(request.nextUrl.searchParams.get("from") ?? "", "from");
    const to = assertDate(request.nextUrl.searchParams.get("to") ?? "", "to");

    return getCalendarHistory(userId, { from, to });
  });
}
