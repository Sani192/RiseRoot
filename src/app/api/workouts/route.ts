import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { withApiHandler } from "@/lib/api/response";

export async function GET() {
  return withApiHandler(async () => [{ id: "workout-1", title: "Upper body", complete: false }]);
}

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const body = (await request.json()) as { title?: string };
    const title = body.title?.trim();

    if (!title) {
      throw new ApiError("VALIDATION_ERROR", "title is required.", 400);
    }

    return { id: `workout-${Date.now()}`, title, complete: false };
  });
}
