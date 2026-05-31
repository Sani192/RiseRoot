import { plannedResourcesService } from "@/lib/services/planned-resources";

export async function loadCompletionHistory(from: string, to: string) {
  return plannedResourcesService.calendar.history(from, to);
}

export async function loadTasksForDate(date: string) {
  return plannedResourcesService.tasks.list(date) as Promise<
    Array<{ id: string; title: string; status: string }>
  >;
}

export async function loadWeightLogsForDate(date: string) {
  return plannedResourcesService.logs.list(date);
}

export async function createWeightLogForDate(
  date: string,
  weight: number,
  unit: "lb" | "kg",
) {
  return plannedResourcesService.logs.create(date, weight, unit);
}
