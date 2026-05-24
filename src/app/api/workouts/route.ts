import { NextRequest } from "next/server";
import { withApiHandler, parseJsonBody } from "@/lib/api/response";
import { z } from "zod";

const createWorkoutRequestSchema = z.object({ title: z.string().trim().min(1).max(120) }).strict();
const workoutResponseSchema = z.object({ id: z.string(), title: z.string(), complete: z.boolean() }).strict();

const workoutService = {
  list: () => [workoutResponseSchema.parse({ id: "workout-1", title: "Upper body", complete: false })],
  create: (title: string) => workoutResponseSchema.parse({ id: `workout-${Date.now()}`, title, complete: false }),
};

export async function GET() {
  return withApiHandler(async () => workoutService.list());
}

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const body = await parseJsonBody(request, createWorkoutRequestSchema);
    return workoutService.create(body.title);
  });
}
