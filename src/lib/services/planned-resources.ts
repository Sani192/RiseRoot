import { apiFetch } from "@/lib/api/client";

export const plannedResourcesService = {
  days: {
    get: (date: string) => apiFetch(`/api/days?date=${date}`),
  },
  tasks: {
    list: (date: string) => apiFetch(`/api/tasks?date=${date}`),
    create: (date: string, title: string) =>
      apiFetch(`/api/tasks`, { method: "POST", body: JSON.stringify({ date, title }) }),
  },
  workouts: {
    list: () => apiFetch(`/api/workouts`),
  },
  logs: {
    get: (date: string) => apiFetch(`/api/logs?date=${date}`),
  },
  notes: {
    get: (date: string) => apiFetch(`/api/notes?date=${date}`),
    save: (date: string, body: string) =>
      apiFetch(`/api/notes`, { method: "PUT", body: JSON.stringify({ date, body }) }),
  },
  meals: {
    list: (mealType?: string, context?: string) =>
      apiFetch(`/api/meals?mealType=${mealType ?? ""}&context=${context ?? ""}`),
  },
  notificationPreferences: {
    get: () => apiFetch(`/api/notifications/preferences`),
    save: (enabled: boolean) =>
      apiFetch(`/api/notifications/preferences`, {
        method: "PUT",
        body: JSON.stringify({ enabled }),
      }),
  },
  calendar: {
    history: (from: string, to: string) =>
      apiFetch<Array<{ planDate: string; completionPercent: number }>>(
        `/api/calendar/history?from=${from}&to=${to}`,
      ),
  },
};
