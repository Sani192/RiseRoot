import { generateDailyPlan, type DailyPlanTask } from "@/features/daily-plans";
import { generateSafeLocalDateKey, toLocalIsoDate } from "@/lib/date";
import { createGenerationKey, deterministicUuid } from "@/lib/schedule-engine";
import { getDailyWorkoutSplit } from "@/features/tasks";
import { scheduleRepository, taskRepository, workoutRepository } from "@/repositories";
import type { DailyTaskDbInsert, WorkoutDbInsert } from "@/infrastructure/orm/types";
import type { Schedule } from "@/domain";

export * from "@/lib/schedule-engine";

function mapPlanTask(userId: string, planId: string, localDate: string, task: DailyPlanTask, sortOrder: number): DailyTaskDbInsert {
  const recurrenceId = `daily-plan:${task.id}`;
  const key = createGenerationKey(userId, recurrenceId, localDate);
  return {
    id: deterministicUuid(key),
    user_id: userId,
    daily_plan_id: planId,
    title: task.title,
    description: task.description,
    sort_order: sortOrder,
  };
}

export async function ensureScheduleForDate(userId: string, at: Date, timeZone: string): Promise<Schedule> {
  const planDate = generateSafeLocalDateKey(at, timeZone);
  const planTemplate = generateDailyPlan(new Date(`${planDate}T12:00:00.000Z`));

  const plan = await scheduleRepository.upsertPlan({
    user_id: userId,
    plan_date: planDate,
    status: "active",
    summary: `${planTemplate.focus} ${planTemplate.affirmation}`,
  });

  const tasks = planTemplate.tasks.map((task, idx) => mapPlanTask(userId, plan.id, planDate, task, idx));
  await Promise.all(tasks.map((task) => taskRepository.upsert(task)));

  const split = getDailyWorkoutSplit(planTemplate.weekday);
  const workoutDef: WorkoutDbInsert = {
    id: deterministicUuid(createGenerationKey(userId, `workout:${split.day.toLowerCase()}`, planDate)),
    user_id: userId,
    daily_plan_id: plan.id,
    name: split.focus,
    workout_type: split.recovery ? "recovery" : "mixed",
    status: "planned",
  };
  const workout = await workoutRepository.upsert(workoutDef);

  return { planDate, planId: plan.id, generatedTaskIds: tasks.map((x) => x.id ?? ""), generatedWorkoutId: workout.id };
}

export { toLocalIsoDate };
