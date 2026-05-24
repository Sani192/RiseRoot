import type {
  DailyTaskInsert,
  MoodLogInsert,
  ReminderInsert,
  UserInsert,
  WeightLogInsert,
  WorkoutInsert,
} from "@/lib/supabase/types";

export type UserDbInsert = UserInsert;
export type DailyTaskDbInsert = DailyTaskInsert;
export type WorkoutDbInsert = WorkoutInsert;
export type WeightLogDbInsert = WeightLogInsert;
export type MoodLogDbInsert = MoodLogInsert;
export type ReminderDbInsert = ReminderInsert;
