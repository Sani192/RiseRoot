import type {
  DailyTask as DailyTaskRow,
  MoodLog as MoodLogRow,
  Reminder as ReminderRow,
  User as UserRow,
  WeightLog as WeightLogRow,
  Workout as WorkoutRow,
} from "@/lib/supabase/types";
import type { DailyTask, MoodLog, Reminder, User, WeightLog, Workout } from "@/domain";

export const mapUserRowToDomain = (row: UserRow): User => ({
  id: row.id, displayName: row.display_name, email: row.email, timezone: row.timezone, unitSystem: row.unit_system, createdAt: row.created_at, updatedAt: row.updated_at,
});
export const mapDailyTaskRowToDomain = (row: DailyTaskRow): DailyTask => ({
  id: row.id, userId: row.user_id, dailyPlanId: row.daily_plan_id, title: row.title, description: row.description, status: row.status, priority: row.priority, sortOrder: row.sort_order, dueAt: row.due_at, completedAt: row.completed_at, createdAt: row.created_at, updatedAt: row.updated_at,
});
export const mapWorkoutRowToDomain = (row: WorkoutRow): Workout => ({
  id: row.id, userId: row.user_id, dailyPlanId: row.daily_plan_id, name: row.name, workoutType: row.workout_type, status: row.status, scheduledAt: row.scheduled_at, startedAt: row.started_at, completedAt: row.completed_at, notes: row.notes, createdAt: row.created_at, updatedAt: row.updated_at,
});
export const mapWeightLogRowToDomain = (row: WeightLogRow): WeightLog => ({
  id: row.id, userId: row.user_id, loggedOn: row.logged_on, loggedAt: row.logged_at, weightValue: row.weight_value, weightUnit: row.weight_unit, source: row.source, notes: row.notes, createdAt: row.created_at, updatedAt: row.updated_at,
});
export const mapMoodLogRowToDomain = (row: MoodLogRow): MoodLog => ({
  id: row.id, userId: row.user_id, loggedOn: row.logged_on, moodScore: row.mood_score, notes: row.notes, createdAt: row.created_at, updatedAt: row.updated_at,
});
export const mapReminderRowToDomain = (row: ReminderRow): Reminder => ({
  id: row.id, userId: row.user_id, dailyPlanId: row.daily_plan_id, relatedType: row.related_type, relatedId: row.related_id, category: row.category, status: row.status, channel: row.channel, scheduledAt: row.scheduled_at, deliveredAt: row.delivered_at, snoozedUntil: row.snoozed_until, createdAt: row.created_at, updatedAt: row.updated_at,
});
