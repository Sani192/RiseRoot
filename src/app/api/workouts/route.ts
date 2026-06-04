import { NextRequest } from "next/server";
import {
  withApiHandler,
  parseJsonBody,
  parseWithSchema,
} from "@/lib/api/response";
import { z } from "zod";
import { workoutRepository } from "@/repositories";
import { nonEmptyStringSchema } from "@/lib/api/validation";
import {
  assertAuthorizedUserId,
  requireAuthenticatedUser,
} from "@/lib/identity/authentication";

const listQuerySchema = z
  .object({ userId: nonEmptyStringSchema.optional() })
  .strict();
const createBodySchema = z
  .object({
    userId: nonEmptyStringSchema.optional(),
    title: nonEmptyStringSchema,
  })
  .strict();

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await requireAuthenticatedUser(request);
    const query = parseWithSchema(
      { userId: request.nextUrl.searchParams.get("userId") ?? undefined },
      listQuerySchema,
      "query",
    );
    assertAuthorizedUserId(query.userId, user.id);
    const workouts = await workoutRepository.listUpcoming(user.id);
    return workouts.map((w) => ({
      id: w.id,
      title: w.name,
      status: w.status,
      complete: w.status === "completed",
    }));
  });
}

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await requireAuthenticatedUser(request);
    const body = await parseJsonBody(request, createBodySchema);
    assertAuthorizedUserId(body.userId, user.id);
    const workout = await workoutRepository.upsert({
      userId: user.id,
      name: body.title.trim(),
      status: "planned",
    });
    return {
      id: workout.id,
      title: workout.name,
      complete: false,
      status: workout.status,
    };
  });
}
