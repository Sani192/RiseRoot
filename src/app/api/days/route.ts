import { NextRequest } from "next/server";
import { toLocalIsoDate } from "@/features/schedule-engine";
import { withApiHandler, assertDate } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const timeZone = request.nextUrl.searchParams.get("timezone") ?? "UTC";
    const date = assertDate(
      request.nextUrl.searchParams.get("date") ?? toLocalIsoDate(new Date(), timeZone),
      "date",
    );

    return {
      id: `day-${date}`,
      date,
      status: "planned",
    };
  });
}
