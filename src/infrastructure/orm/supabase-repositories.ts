import { supabaseQueries } from "@/lib/supabase/queries";
import type { MoodRepository, NoteRepository, ReminderRepository, ScheduleRepository, TaskRepository, UserRepository, WeightRepository, WorkoutRepository } from "@/domain/repositories";
import type { ReminderRelatedType } from "@/lib/supabase/types";
import { mapDailyTaskRowToDomain, mapMoodLogRowToDomain, mapReminderRowToDomain, mapUserRowToDomain, mapWeightLogRowToDomain, mapWorkoutRowToDomain } from "@/infrastructure/orm/mappers";

export const supabaseTaskRepository: TaskRepository = {
  listByDate: async (userId, planDate) => (await supabaseQueries.dailyTasks.listByDate(userId, planDate)).map(mapDailyTaskRowToDomain),
  upsert: async (input) => mapDailyTaskRowToDomain(await supabaseQueries.dailyTasks.upsert({ user_id: input.userId, daily_plan_id: input.dailyPlanId, title: input.title, description: input.description ?? null, status: input.status ?? "todo", priority: input.priority ?? null, sort_order: input.sortOrder ?? 0, due_at: input.dueAt ?? null, completed_at: input.completedAt ?? null })),
};
export const supabaseScheduleRepository: ScheduleRepository = { upsertPlan: async (input) => { const r = await supabaseQueries.dailyPlans.upsert({ user_id: input.userId, plan_date: input.planDate, status: input.status as "active" | "archived" | "completed", summary: input.summary }); return { id: r.id, userId: r.user_id, planDate: r.plan_date, status: r.status, summary: r.summary ?? "" }; }, listPlanCompletions: (userId, range) => supabaseQueries.calendar.listPlanCompletions(userId, range) };
export const supabaseWorkoutRepository: WorkoutRepository = { listUpcoming: async (userId) => (await supabaseQueries.workouts.listUpcoming(userId)).map(mapWorkoutRowToDomain), upsert: async (input) => mapWorkoutRowToDomain(await supabaseQueries.workouts.upsert({ user_id: input.userId, name: input.name, workout_type: input.workoutType ?? "mixed", status: input.status ?? "planned", daily_plan_id: input.dailyPlanId ?? null, scheduled_at: input.scheduledAt ?? null, started_at: input.startedAt ?? null, completed_at: input.completedAt ?? null, notes: input.notes ?? null })) };
export const supabaseWeightRepository: WeightRepository = {
  listByDate: async (userId, loggedOn) =>
    (await supabaseQueries.weightLogs.list(userId, { from: loggedOn, to: loggedOn })).map(mapWeightLogRowToDomain),
  create: async (input) => mapWeightLogRowToDomain(await supabaseQueries.weightLogs.create({ user_id: input.userId, logged_on: input.loggedOn, weight_value: input.weightValue, weight_unit: input.weightUnit ?? "lb", source: input.source ?? "manual", logged_at: input.loggedAt ?? null, notes: input.notes ?? null })),
};
export const supabaseNoteRepository: NoteRepository = {
  upsertByDate: async (input) => {
    const existing = (await supabaseQueries.dailyNotes.list(input.userId, { from: input.noteDate, to: input.noteDate })).find((note) => note.category === "daily");
    const row = existing
      ? await supabaseQueries.dailyNotes.update(existing.id, input.userId, { body: input.body, daily_plan_id: input.dailyPlanId ?? null })
      : await supabaseQueries.dailyNotes.create({ user_id: input.userId, daily_plan_id: input.dailyPlanId ?? null, note_date: input.noteDate, body: input.body, category: "daily" });
    return { id: row.id, userId: row.user_id, noteDate: row.note_date, body: row.body, dailyPlanId: row.daily_plan_id, updatedAt: row.updated_at };
  },
  findByDate: async (userId, noteDate) => {
    const row = (await supabaseQueries.dailyNotes.list(userId, { from: noteDate, to: noteDate })).find((note) => note.category === "daily");
    return row ? { id: row.id, userId: row.user_id, noteDate: row.note_date, body: row.body, dailyPlanId: row.daily_plan_id, updatedAt: row.updated_at } : null;
  },
};
export const supabaseMoodRepository: MoodRepository = { create: async (input) => mapMoodLogRowToDomain(await supabaseQueries.moodLogs.create({ user_id: input.userId, logged_on: input.loggedOn, logged_at: new Date().toISOString(), mood_score: input.moodScore, notes: input.notes ?? null })) };
export const supabaseReminderRepository: ReminderRepository = { create: async (input) => mapReminderRowToDomain(await supabaseQueries.reminders.create({ user_id: input.userId, daily_plan_id: input.dailyPlanId ?? null, related_type: input.relatedType as ReminderRelatedType | null, related_id: input.relatedId ?? null, category: input.category, status: input.status ?? "scheduled", channel: input.channel ?? "in_app", scheduled_at: input.scheduledAt })) };
export const supabaseUserRepository: UserRepository = { getById: async (id) => { const user = await supabaseQueries.users.getById(id); return user ? mapUserRowToDomain(user) : null; }, create: async (input) => mapUserRowToDomain(await supabaseQueries.users.create({ ...(input.id ? { id: input.id } : {}), display_name: input.displayName ?? null, email: input.email ?? null, timezone: input.timezone ?? "UTC", unit_system: input.unitSystem ?? "imperial" })) };
