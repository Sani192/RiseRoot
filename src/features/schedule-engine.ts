import { generateDailyPlan, type DailyPlanTask } from "@/features/daily-plans";
import { generateSafeLocalDateKey, toLocalIsoDate } from "@/lib/date";
import { createGenerationKey } from "@/lib/schedule-engine";
import { getDailyWorkoutSplit } from "@/features/tasks";
import {
  scheduleRepository,
  taskRepository,
  workoutRepository,
} from "@/repositories";
import type { Schedule } from "@/domain";
import type {
  UpsertDailyTaskInput,
  UpsertWorkoutInput,
} from "@/domain/repositories";

export * from "@/lib/schedule-engine";

function mapPlanTask(
  userId: string,
  planId: string,
  localDate: string,
  task: DailyPlanTask,
  sortOrder: number,
): UpsertDailyTaskInput {
  const recurrenceId = `daily-plan:${task.id}`;
  createGenerationKey(userId, recurrenceId, localDate);
  return {
    userId,
    dailyPlanId: planId,
    title: task.title,
    description: task.description,
    sortOrder,
  };
}

export async function ensureScheduleForDate(
  userId: string,
  at: Date,
  timeZone: string,
): Promise<Schedule> {
  const planDate = generateSafeLocalDateKey(at, timeZone);
  const planTemplate = generateDailyPlan(new Date(`${planDate}T12:00:00.000Z`));

  const plan = await scheduleRepository.upsertPlan({
    userId,
    planDate,
    status: "active",
    summary: `${planTemplate.focus} ${planTemplate.affirmation}`,
  });

  const tasks = planTemplate.tasks.map((task, idx) =>
    mapPlanTask(userId, plan.id, planDate, task, idx),
  );
  const createdTasks = await Promise.all(
    tasks.map((task) => taskRepository.upsert(task)),
  );

  const split = getDailyWorkoutSplit(planTemplate.weekday);
  const workoutDef: UpsertWorkoutInput = {
    userId,
    dailyPlanId: plan.id,
    name: split.focus,
    workoutType: split.recovery ? "recovery" : "mixed",
    status: "planned",
  };
  const workout = await workoutRepository.upsert(workoutDef);

  return {
    planDate,
    planId: plan.id,
    generatedTaskIds: createdTasks.map((x) => x.id),
    generatedWorkoutId: workout.id,
  };
}

export { toLocalIsoDate };
