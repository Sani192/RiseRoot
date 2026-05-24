import { createHash } from "node:crypto";

import { generateDailyPlan, type DailyPlanTask } from "@/features/daily-plans";
import { eachUtcDateKeyInRange, generateSafeLocalDateKey, localWeekdayIndex, parseUtcIsoDateOnly, toLocalIsoDate } from "@/lib/date";
import { getDailyWorkoutSplit } from "@/features/tasks";
import { scheduleRepository, taskRepository, workoutRepository } from "@/repositories";
import type { DailyTaskInsert, WorkoutInsert } from "@/lib/supabase/types";

export type RecurrenceFrequency = "daily" | "weekly";

export type RecurrenceDefinition = {
  id: string;
  type: "task" | "workout";
  title: string;
  frequency: RecurrenceFrequency;
  interval?: number;
  weekdays?: number[];
  startDate: string;
  endDate?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export function createGenerationKey(userId: string, recurrenceId: string, localDate: string): string {
  return `${userId}:${recurrenceId}:${localDate}`;
}

export function deterministicUuid(input: string): string {
  const hash = createHash("sha256").update(input).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export function occursOnLocalDate(def: RecurrenceDefinition, localDate: string): boolean {
  const interval = Math.max(def.interval ?? 1, 1);
  if (localDate < def.startDate || (def.endDate && localDate > def.endDate)) return false;

  const start = parseUtcIsoDateOnly(def.startDate);
  const target = parseUtcIsoDateOnly(localDate);
  const daysBetween = Math.floor((target.getTime() - start.getTime()) / 86_400_000);

  if (def.frequency === "daily") return daysBetween % interval === 0;

  const weeksBetween = Math.floor(daysBetween / 7);
  const weekday = localWeekdayIndex(target, "UTC");
  const allowedWeekdays = def.weekdays ?? [localWeekdayIndex(start, "UTC")];
  return weeksBetween % interval === 0 && allowedWeekdays.includes(weekday);
}

export function generateOccurrences(def: RecurrenceDefinition, fromDate: string, toDate: string): string[] {
  return eachUtcDateKeyInRange(fromDate, toDate).filter((localDate) => occursOnLocalDate(def, localDate));
}

function mapPlanTask(userId: string, planId: string, localDate: string, task: DailyPlanTask, sortOrder: number): DailyTaskInsert {
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

export async function ensureScheduleForDate(userId: string, at: Date, timeZone: string): Promise<{ planDate: string; planId: string; generatedTaskIds: string[]; generatedWorkoutId: string }> {
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
  const workoutDef: WorkoutInsert = {
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
