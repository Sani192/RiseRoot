import { NextRequest } from "next/server";
import { withApiHandler, parseWithSchema } from "@/lib/api/response";
import { z } from "zod";
import { scheduleRepository, taskRepository } from "@/repositories";

const listQuerySchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), userId: z.string().min(1) }).strict();

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const query = parseWithSchema({ date: request.nextUrl.searchParams.get("date") ?? "", userId: request.nextUrl.searchParams.get("userId") ?? "" }, listQuerySchema, "query");
    const tasks = await taskRepository.listByDate(query.userId, query.date);
    return tasks.map((task) => ({ id: task.id, title: task.title, status: task.status, completed: task.status === "completed", date: query.date }));
  });
}

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const body = await request.json() as { userId: string; date: string; title: string };
    const plan = await scheduleRepository.upsertPlan({ userId: body.userId, planDate: body.date, status: "active", summary: "" });
    const task = await taskRepository.upsert({ userId: body.userId, dailyPlanId: plan.id, title: body.title, status: "todo" });
    return { id: task.id, title: task.title, completed: false, date: body.date, status: task.status };
  });
}
