import { NextRequest } from "next/server";
import {
  withApiHandler,
  parseJsonBody,
  parseWithSchema,
} from "@/lib/api/response";
import { z } from "zod";
import { scheduleRepository, taskRepository } from "@/repositories";
import { isoDateSchema, nonEmptyStringSchema } from "@/lib/api/validation";
import {
  assertAuthorizedUserId,
  requireAuthenticatedUser,
} from "@/lib/api/identity";

const listQuerySchema = z
  .object({ date: isoDateSchema, userId: nonEmptyStringSchema.optional() })
  .strict();
const createBodySchema = z
  .object({
    userId: nonEmptyStringSchema.optional(),
    date: isoDateSchema,
    title: nonEmptyStringSchema,
  })
  .strict();

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await requireAuthenticatedUser(request);
    const query = parseWithSchema(
      {
        date: request.nextUrl.searchParams.get("date") ?? "",
        userId: request.nextUrl.searchParams.get("userId") ?? undefined,
      },
      listQuerySchema,
      "query",
    );
    assertAuthorizedUserId(query.userId, user.id);
    const tasks = await taskRepository.listByDate(user.id, query.date);
    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      completed: task.status === "completed",
      date: query.date,
    }));
  });
}

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await requireAuthenticatedUser(request);
    const body = await parseJsonBody(request, createBodySchema);
    assertAuthorizedUserId(body.userId, user.id);
    const plan = await scheduleRepository.upsertPlan({
      userId: user.id,
      planDate: body.date,
      status: "active",
      summary: "",
    });
    const task = await taskRepository.upsert({
      userId: user.id,
      dailyPlanId: plan.id,
      title: body.title.trim(),
      status: "todo",
    });
    return {
      id: task.id,
      title: task.title,
      completed: false,
      date: body.date,
      status: task.status,
    };
  });
}
