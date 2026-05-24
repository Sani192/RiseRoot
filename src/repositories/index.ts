import { supabaseQueries } from "@/lib/supabase/queries";
import type {
  DailyNote,
  DailyNoteInsert,
  DailyPlan,
  DailyTask,
  DailyTaskInsert,
  MoodLog,
  MoodLogInsert,
  Reminder,
  ReminderInsert,
  User,
  UserInsert,
  WeightLog,
  WeightLogInsert,
  Workout,
  WorkoutInsert,
} from "@/lib/supabase/types";

export interface TaskRepository {
  listByDate(userId: string, planDate: string): Promise<DailyTask[]>;
  upsert(input: DailyTaskInsert): Promise<DailyTask>;
}

export interface ScheduleRepository {
  upsertPlan(input: { user_id: string; plan_date: string; status: string; summary: string }): Promise<DailyPlan>;
  listPlanCompletions(userId: string, range: { from: string; to: string }): Promise<Array<{ planDate: string; completionPercent: number }>>;
}

export interface WorkoutRepository {
  upsert(input: WorkoutInsert): Promise<Workout>;
}

export interface WeightRepository {
  create(input: WeightLogInsert): Promise<WeightLog>;
}

export interface NoteRepository {
  create(input: DailyNoteInsert): Promise<DailyNote>;
}

export interface MoodRepository {
  create(input: MoodLogInsert): Promise<MoodLog>;
}

export interface ReminderRepository {
  create(input: ReminderInsert): Promise<Reminder>;
}

export interface UserRepository {
  getById(id: string): Promise<User | null>;
  create(input: UserInsert): Promise<User>;
}

export const taskRepository: TaskRepository = {
  listByDate: (userId, planDate) => supabaseQueries.dailyTasks.listByDate(userId, planDate),
  upsert: (input) => supabaseQueries.dailyTasks.upsert(input),
};

export const scheduleRepository: ScheduleRepository = {
  upsertPlan: (input) =>
    supabaseQueries.dailyPlans.upsert({
      user_id: input.user_id,
      plan_date: input.plan_date,
      status: input.status as "active" | "archived" | "completed",
      summary: input.summary,
    }),
  listPlanCompletions: (userId, range) => supabaseQueries.calendar.listPlanCompletions(userId, range),
};

export const workoutRepository: WorkoutRepository = {
  upsert: (input) => supabaseQueries.workouts.upsert(input),
};

export const weightRepository: WeightRepository = {
  create: (input) => supabaseQueries.weightLogs.create(input),
};

export const noteRepository: NoteRepository = {
  create: (input) => supabaseQueries.dailyNotes.create(input),
};

export const moodRepository: MoodRepository = {
  create: (input) => supabaseQueries.moodLogs.create(input),
};

export const reminderRepository: ReminderRepository = {
  create: (input) => supabaseQueries.reminders.create(input),
};

export const userRepository: UserRepository = {
  getById: (id) => supabaseQueries.users.getById(id),
  create: (input) => supabaseQueries.users.create(input),
};
