import { NextRequest } from "next/server";
import { withApiHandler, parseWithSchema } from "@/lib/api/response";
import { getCalendarHistory } from "@/features/calendar-history";
import { requireAuthenticatedUser } from "@/lib/api/identity";
import { z } from "zod";

const querySchema = z
  .object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .strict();

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await requireAuthenticatedUser(request);
    const query = parseWithSchema(
      {
        from: request.nextUrl.searchParams.get("from") ?? "",
        to: request.nextUrl.searchParams.get("to") ?? "",
      },
      querySchema,
      "query",
    );
    return getCalendarHistory(user.id, query);
  });
}
