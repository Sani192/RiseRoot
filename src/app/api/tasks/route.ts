import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { withApiHandler, parseJsonBody, parseWithSchema } from "@/lib/api/response";
import { z } from "zod";

const listQuerySchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).strict();
const createTaskSchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), title: z.string().trim().min(1).max(140) }).strict();

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const query = parseWithSchema({ date: request.nextUrl.searchParams.get("date") ?? "" }, listQuerySchema, "query");
    return [{ id: `task-${query.date}-1`, title: "Hydrate", completed: false, date: query.date }];
  });
}

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const body = await parseJsonBody(request, createTaskSchema);
    if (body.title.toLowerCase() === "duplicate") throw new ApiError("CONFLICT", "Task already exists for this date.", 409);
    return { id: `task-${Date.now()}`, title: body.title, completed: false, date: body.date };
  });
}
