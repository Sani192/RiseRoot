import { supabaseQueries } from "@/lib/supabase/queries";
import type { DailyNote, DailyNoteInsert, DailyPlan } from "@/lib/supabase/types";
import type { DailyTask, MoodLog, Reminder, User, WeightLog, Workout } from "@/domain";
import {
  mapDailyTaskRowToDomain,
  mapMoodLogRowToDomain,
  mapReminderRowToDomain,
  mapUserRowToDomain,
  mapWeightLogRowToDomain,
  mapWorkoutRowToDomain,
} from "@/infrastructure/orm/mappers";
import type {
  DailyTaskDbInsert,
  MoodLogDbInsert,
  ReminderDbInsert,
  UserDbInsert,
  WeightLogDbInsert,
  WorkoutDbInsert,
} from "@/infrastructure/orm/types";

export interface TaskRepository {
  listByDate(userId: string, planDate: string): Promise<DailyTask[]>;
  upsert(input: DailyTaskDbInsert): Promise<DailyTask>;
}
export interface ScheduleRepository {
  upsertPlan(input: { user_id: string; plan_date: string; status: string; summary: string }): Promise<DailyPlan>;
  listPlanCompletions(userId: string, range: { from: string; to: string }): Promise<Array<{ planDate: string; completionPercent: number }>>;
}
export interface WorkoutRepository { upsert(input: WorkoutDbInsert): Promise<Workout>; }
export interface WeightRepository { create(input: WeightLogDbInsert): Promise<WeightLog>; }
export interface NoteRepository { create(input: DailyNoteInsert): Promise<DailyNote>; }
export interface MoodRepository { create(input: MoodLogDbInsert): Promise<MoodLog>; }
export interface ReminderRepository { create(input: ReminderDbInsert): Promise<Reminder>; }
export interface UserRepository { getById(id: string): Promise<User | null>; create(input: UserDbInsert): Promise<User>; }

export const taskRepository: TaskRepository = {
  listByDate: async (userId, planDate) => (await supabaseQueries.dailyTasks.listByDate(userId, planDate)).map(mapDailyTaskRowToDomain),
  upsert: async (input) => mapDailyTaskRowToDomain(await supabaseQueries.dailyTasks.upsert(input)),
};
export const scheduleRepository: ScheduleRepository = {
  upsertPlan: (input) => supabaseQueries.dailyPlans.upsert({ user_id: input.user_id, plan_date: input.plan_date, status: input.status as "active" | "archived" | "completed", summary: input.summary }),
  listPlanCompletions: (userId, range) => supabaseQueries.calendar.listPlanCompletions(userId, range),
};
export const workoutRepository: WorkoutRepository = { upsert: async (input) => mapWorkoutRowToDomain(await supabaseQueries.workouts.upsert(input)) };
export const weightRepository: WeightRepository = { create: async (input) => mapWeightLogRowToDomain(await supabaseQueries.weightLogs.create(input)) };
export const noteRepository: NoteRepository = { create: (input) => supabaseQueries.dailyNotes.create(input) };
export const moodRepository: MoodRepository = { create: async (input) => mapMoodLogRowToDomain(await supabaseQueries.moodLogs.create(input)) };
export const reminderRepository: ReminderRepository = { create: async (input) => mapReminderRowToDomain(await supabaseQueries.reminders.create(input)) };
export const userRepository: UserRepository = {
  getById: async (id) => {
    const user = await supabaseQueries.users.getById(id);
    return user ? mapUserRowToDomain(user) : null;
  },
  create: async (input) => mapUserRowToDomain(await supabaseQueries.users.create(input)),
};
