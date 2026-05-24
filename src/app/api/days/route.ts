import { NextRequest } from "next/server";
import { toLocalIsoDate } from "@/lib/date";
import { withApiHandler, parseWithSchema } from "@/lib/api/response";
import { z } from "zod";

const querySchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    timezone: z.string().trim().min(1).default("UTC"),
  })
  .strict();

const responseSchema = z.object({ id: z.string(), date: z.string(), status: z.literal("planned") }).strict();

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const query = parseWithSchema(
      {
        date: request.nextUrl.searchParams.get("date") ?? undefined,
        timezone: request.nextUrl.searchParams.get("timezone") ?? "UTC",
      },
      querySchema,
      "query",
    );

    const date = query.date ?? toLocalIsoDate(new Date(), query.timezone);
    return responseSchema.parse({ id: `day-${date}`, date, status: "planned" });
  });
}
