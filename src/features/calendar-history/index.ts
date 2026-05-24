import { scheduleRepository } from "@/repositories";

export interface CalendarHistoryItem {
  planDate: string;
  completionPercent: number;
}

export async function getCalendarHistory(
  userId: string,
  range: { from: string; to: string },
): Promise<CalendarHistoryItem[]> {
  return scheduleRepository.listPlanCompletions(userId, range);
}
