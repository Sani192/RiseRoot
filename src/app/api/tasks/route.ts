import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { withApiHandler, assertDate } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const date = assertDate(request.nextUrl.searchParams.get("date") ?? "", "date");
    return [{ id: `task-${date}-1`, title: "Hydrate", completed: false, date }];
  });
}

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const body = (await request.json()) as { date?: string; title?: string };
    const date = assertDate(body.date ?? "", "date");
    const title = body.title?.trim();

    if (!title) {
      throw new ApiError("VALIDATION_ERROR", "title is required.", 400, [
        { field: "title", message: "Required." },
      ]);
    }

    if (title.toLowerCase() === "duplicate") {
      throw new ApiError("CONFLICT", "Task already exists for this date.", 409);
    }

    return { id: `task-${Date.now()}`, title, completed: false, date };
  });
}
