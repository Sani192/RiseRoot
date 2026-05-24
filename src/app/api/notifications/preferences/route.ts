import { NextRequest } from "next/server";
import { withApiHandler, parseJsonBody } from "@/lib/api/response";
import { z } from "zod";

let preferences = { enabled: false, quietHoursStart: "22:00", quietHoursEnd: "07:00" };
const preferencesSchema = z.object({ enabled: z.boolean(), quietHoursStart: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), quietHoursEnd: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/) }).strict();

export async function GET() {
  return withApiHandler(async () => preferencesSchema.parse(preferences));
}

export async function PUT(request: NextRequest) {
  return withApiHandler(async () => {
    const body = await parseJsonBody(request, preferencesSchema.partial().strict());
    preferences = preferencesSchema.parse({ ...preferences, ...body });
    return preferences;
  });
}
