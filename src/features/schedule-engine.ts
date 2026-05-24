import { createHash } from "node:crypto";

import { generateDailyPlan, type DailyPlanTask } from "@/features/daily-plans";
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

function localDateParts(at: Date, timeZone: string): { year: number; month: number; day: number; weekday: number } {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  const parts = formatter.formatToParts(at);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  return {
    year: Number(byType.year),
    month: Number(byType.month),
    day: Number(byType.day),
    weekday: weekdayMap[byType.weekday ?? "Sun"] ?? 0,
  };
}

export function toLocalIsoDate(at: Date, timeZone: string): string {
  const { year, month, day } = localDateParts(at, timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseIsoDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

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

  const start = parseIsoDate(def.startDate);
  const target = parseIsoDate(localDate);
  const daysBetween = Math.floor((target.getTime() - start.getTime()) / 86_400_000);

  if (def.frequency === "daily") return daysBetween % interval === 0;

  const weeksBetween = Math.floor(daysBetween / 7);
  const weekday = target.getUTCDay();
  const allowedWeekdays = def.weekdays ?? [start.getUTCDay()];
  return weeksBetween % interval === 0 && allowedWeekdays.includes(weekday);
}

export function generateOccurrences(def: RecurrenceDefinition, fromDate: string, toDate: string): string[] {
  const out: string[] = [];
  let cursor = parseIsoDate(fromDate);
  const end = parseIsoDate(toDate);
  while (cursor <= end) {
    const localDate = cursor.toISOString().slice(0, 10);
    if (occursOnLocalDate(def, localDate)) out.push(localDate);
    cursor = new Date(cursor.getTime() + 86_400_000);
  }
  return out;
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
  const planDate = toLocalIsoDate(at, timeZone);
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
