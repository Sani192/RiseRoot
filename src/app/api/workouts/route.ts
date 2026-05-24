import { NextRequest } from "next/server";
import { withApiHandler, parseJsonBody, parseWithSchema } from "@/lib/api/response";
import { z } from "zod";
import { workoutRepository } from "@/repositories";
import { nonEmptyStringSchema } from "@/lib/api/validation";

const listQuerySchema = z.object({ userId: nonEmptyStringSchema }).strict();
const createBodySchema = z.object({ userId: nonEmptyStringSchema, title: nonEmptyStringSchema }).strict();

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const query = parseWithSchema({ userId: request.nextUrl.searchParams.get("userId") ?? "" }, listQuerySchema, "query");
    const workouts = await workoutRepository.listUpcoming(query.userId);
    return workouts.map((w) => ({ id: w.id, title: w.name, status: w.status, complete: w.status === "completed" }));
  });
}

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const body = await parseJsonBody(request, createBodySchema);
    const workout = await workoutRepository.upsert({ userId: body.userId, name: body.title.trim(), status: "planned" });
    return { id: workout.id, title: workout.name, complete: false, status: workout.status };
  });
}
