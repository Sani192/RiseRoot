import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { withApiHandler, assertDate } from "@/lib/api/response";

const notes = new Map<string, { body: string; date: string; updatedAt: string }>();

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const date = assertDate(request.nextUrl.searchParams.get("date") ?? "", "date");
    const found = notes.get(date);
    if (!found) {
      throw new ApiError("NOT_FOUND", "Note not found.", 404);
    }
    return found;
  });
}

export async function PUT(request: NextRequest) {
  return withApiHandler(async () => {
    const body = (await request.json()) as { body?: string; date?: string };
    const date = assertDate(body.date ?? "", "date");
    const text = body.body?.trim() ?? "";

    if (text.length > 5000) {
      throw new ApiError("VALIDATION_ERROR", "body exceeds max length.", 400);
    }

    const record = { date, body: text, updatedAt: new Date().toISOString() };
    notes.set(date, record);
    return record;
  });
}
