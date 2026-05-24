import { NextRequest } from "next/server";
import { withApiHandler, parseWithSchema } from "@/lib/api/response";
import { z } from "zod";
import { workoutRepository } from "@/repositories";

const listQuerySchema = z.object({ userId: z.string().min(1) }).strict();

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const query = parseWithSchema({ userId: request.nextUrl.searchParams.get("userId") ?? "" }, listQuerySchema, "query");
    const workouts = await workoutRepository.listUpcoming(query.userId);
    return workouts.map((w) => ({ id: w.id, title: w.name, status: w.status, complete: w.status === "completed" }));
  });
}

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const body = await request.json() as { userId: string; title: string };
    const workout = await workoutRepository.upsert({ userId: body.userId, name: body.title, status: "planned" });
    return { id: workout.id, title: workout.name, complete: false, status: workout.status };
  });
}
