import { NextRequest } from "next/server";
import { withApiHandler, parseWithSchema } from "@/lib/api/response";
import { z } from "zod";

const querySchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).strict();
const responseSchema = z.object({ date: z.string(), weight: z.null(), mood: z.null() }).strict();

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const query = parseWithSchema({ date: request.nextUrl.searchParams.get("date") ?? "" }, querySchema, "query");
    return responseSchema.parse({ date: query.date, weight: null, mood: null });
  });
}
