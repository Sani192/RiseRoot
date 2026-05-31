import type { DailyTask, MoodLog, Reminder, User, WeightLog, Workout } from "@/domain";

export interface UpsertDailyTaskInput {
  userId: string;
  dailyPlanId: string;
  title: string;
  description?: string | null;
  status?: DailyTask["status"];
  priority?: number | null;
  sortOrder?: number;
  dueAt?: string | null;
  completedAt?: string | null;
}

export interface UpsertWorkoutInput {
  userId: string;
  name: string;
  workoutType?: Workout["workoutType"];
  status?: Workout["status"];
  dailyPlanId?: string | null;
  scheduledAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  notes?: string | null;
}

export interface CreateWeightLogInput {
  userId: string;
  loggedOn: string;
  weightValue: number;
  weightUnit?: WeightLog["weightUnit"];
  source?: WeightLog["source"];
  loggedAt?: string | null;
  notes?: string | null;
}

export interface TaskRepository {
  listByDate(userId: string, planDate: string): Promise<DailyTask[]>;
  upsert(input: UpsertDailyTaskInput): Promise<DailyTask>;
}

export interface WorkoutRepository {
  listUpcoming(userId: string): Promise<Workout[]>;
  upsert(input: UpsertWorkoutInput): Promise<Workout>;
}

export interface ScheduleRepository {
  upsertPlan(input: { userId: string; planDate: string; status: string; summary: string }): Promise<{ id: string; userId: string; planDate: string; status: string; summary: string }>;
  listPlanCompletions(userId: string, range: { from: string; to: string }): Promise<Array<{ planDate: string; completionPercent: number }>>;
}

export interface WeightRepository {
  listByDate(userId: string, loggedOn: string): Promise<WeightLog[]>;
  create(input: CreateWeightLogInput): Promise<WeightLog>;
}
export type NoteRecord = { id: string; userId: string; noteDate: string; body: string; dailyPlanId: string | null; updatedAt: string };

export interface NoteRepository {
  upsertByDate(input: { userId: string; noteDate: string; body: string; dailyPlanId?: string | null }): Promise<NoteRecord>;
  findByDate(userId: string, noteDate: string): Promise<NoteRecord | null>;
}
export interface MoodRepository { create(input: { userId: string; loggedOn: string; moodScore: number; notes?: string | null }): Promise<MoodLog>; }
export interface ReminderRepository { create(input: { userId: string; category: Reminder["category"]; status?: Reminder["status"]; channel?: Reminder["channel"]; scheduledAt: string; dailyPlanId?: string | null; relatedType?: string | null; relatedId?: string | null }): Promise<Reminder>; }
export interface UserRepository { getById(id: string): Promise<User | null>; create(input: { id?: string; displayName?: string | null; email?: string | null; timezone?: string; unitSystem?: User["unitSystem"] }): Promise<User>; }
