import { NextRequest } from "next/server";
import { withApiHandler, assertDate } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const date = assertDate(request.nextUrl.searchParams.get("date") ?? "", "date");
    return { date, weight: null, mood: null };
  });
}
