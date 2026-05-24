import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { withApiHandler } from "@/lib/api/response";

let preferences = { enabled: false, quietHoursStart: "22:00", quietHoursEnd: "07:00" };

export async function GET() {
  return withApiHandler(async () => preferences);
}

export async function PUT(request: NextRequest) {
  return withApiHandler(async () => {
    const body = (await request.json()) as Partial<typeof preferences>;
    if (typeof body.enabled !== "boolean") {
      throw new ApiError("VALIDATION_ERROR", "enabled must be boolean.", 400);
    }
    preferences = { ...preferences, ...body };
    return preferences;
  });
}
