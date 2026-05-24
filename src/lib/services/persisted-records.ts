import { getActiveUserId } from "@/lib/supabase/session";
import { plannedResourcesService } from "@/lib/services/planned-resources";

export async function loadCompletionHistory(from: string, to: string) {
  return plannedResourcesService.calendar.history(from, to);
}

export async function loadTasksForDate(date: string) {
  const userId = getActiveUserId();
  if (!userId) throw new Error("NEXT_PUBLIC_APP_USER_ID must be set.");
  return plannedResourcesService.tasks.list(date, userId) as Promise<Array<{ id: string; title: string; status: string }>>;
}

export async function loadWeightLogsForDate(date: string) {
  const userId = getActiveUserId();
  if (!userId) throw new Error("NEXT_PUBLIC_APP_USER_ID must be set.");
  return plannedResourcesService.logs.list(date, userId);
}

export async function createWeightLogForDate(date: string, weight: number, unit: "lb" | "kg") {
  const userId = getActiveUserId();
  if (!userId) throw new Error("NEXT_PUBLIC_APP_USER_ID must be set.");
  return plannedResourcesService.logs.create(date, userId, weight, unit);
}
