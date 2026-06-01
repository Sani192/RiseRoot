export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UnitSystem = "imperial" | "metric";
export type DailyPlanStatus = "draft" | "active" | "completed" | "archived";
export type DailyTaskStatus = "todo" | "in_progress" | "completed" | "skipped";
export type WorkoutType =
  | "strength"
  | "cardio"
  | "mobility"
  | "recovery"
  | "mixed";
export type WorkoutStatus = "planned" | "in_progress" | "completed" | "skipped";
export type ExerciseCategory =
  | "strength"
  | "cardio"
  | "mobility"
  | "warmup"
  | "cooldown";
export type ExerciseStatus = "planned" | "completed" | "skipped" | "swapped";
export type ExerciseAlternativeDifficulty = "easier" | "similar" | "harder";
export type WeightUnit = "lb" | "kg";
export type LogSource = "manual" | "imported" | "device";
export type NoteCategory =
  | "daily"
  | "workout"
  | "meal"
  | "wellbeing"
  | "general";
export type ReminderRelatedType =
  | "daily_plan"
  | "daily_task"
  | "workout"
  | "meal_suggestion"
  | "mood_log"
  | "note";
export type ReminderCategory =
  | "task"
  | "workout"
  | "meal"
  | "hydration"
  | "wellbeing"
  | "daily_review";
export type ReminderStatus =
  | "scheduled"
  | "sent"
  | "dismissed"
  | "snoozed"
  | "cancelled";
export type ReminderChannel = "in_app" | "push" | "email";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type MealSuggestionStatus =
  | "suggested"
  | "accepted"
  | "skipped"
  | "replaced"
  | "completed";
export type MealSuggestionSource = "manual" | "template" | "generated";

type DatabaseTable<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: never[];
};

type TimestampColumns = {
  created_at: string;
  updated_at: string;
};

type MutableTimestampInsert = {
  created_at?: string;
  updated_at?: string;
};

type MutableTimestampUpdate = {
  created_at?: string;
  updated_at?: string;
};

export type User = TimestampColumns & {
  id: string;
  display_name: string | null;
  email: string | null;
  timezone: string;
  unit_system: UnitSystem;
};

export type UserInsert = MutableTimestampInsert & {
  id?: string;
  display_name?: string | null;
  email?: string | null;
  timezone: string;
  unit_system: UnitSystem;
};

export type UserUpdate = MutableTimestampUpdate &
  Partial<Omit<UserInsert, "id">>;

export type UserProfile = TimestampColumns & {
  user_id: string;
  age: number;
  height_text: string | null;
  weight_text: string | null;
  goals: Json;
  preferred_gym_timing: string;
  wake_time: string;
};

export type UserProfileInsert = MutableTimestampInsert & {
  user_id: string;
  age: number;
  height_text?: string | null;
  weight_text?: string | null;
  goals?: Json;
  preferred_gym_timing: string;
  wake_time: string;
};

export type UserProfileUpdate = MutableTimestampUpdate &
  Partial<Omit<UserProfileInsert, "user_id">>;

export type DailyPlan = TimestampColumns & {
  id: string;
  user_id: string;
  plan_date: string;
  status: DailyPlanStatus;
  summary: string | null;
};

export type DailyPlanInsert = MutableTimestampInsert & {
  id?: string;
  user_id: string;
  plan_date: string;
  status?: DailyPlanStatus;
  summary?: string | null;
};

export type DailyPlanUpdate = MutableTimestampUpdate &
  Partial<Omit<DailyPlanInsert, "id" | "user_id">>;

export type DailyTask = TimestampColumns & {
  id: string;
  user_id: string;
  daily_plan_id: string;
  title: string;
  description: string | null;
  status: DailyTaskStatus;
  priority: number | null;
  sort_order: number;
  due_at: string | null;
  completed_at: string | null;
};

export type DailyTaskInsert = MutableTimestampInsert & {
  id?: string;
  user_id: string;
  daily_plan_id: string;
  title: string;
  description?: string | null;
  status?: DailyTaskStatus;
  priority?: number | null;
  sort_order?: number;
  due_at?: string | null;
  completed_at?: string | null;
};

export type DailyTaskUpdate = MutableTimestampUpdate &
  Partial<Omit<DailyTaskInsert, "id" | "user_id">>;

export type Workout = TimestampColumns & {
  id: string;
  user_id: string;
  daily_plan_id: string | null;
  name: string;
  workout_type: WorkoutType;
  status: WorkoutStatus;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
};

export type WorkoutInsert = MutableTimestampInsert & {
  id?: string;
  user_id: string;
  daily_plan_id?: string | null;
  name: string;
  workout_type: WorkoutType;
  status?: WorkoutStatus;
  scheduled_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  notes?: string | null;
};

export type WorkoutUpdate = MutableTimestampUpdate &
  Partial<Omit<WorkoutInsert, "id" | "user_id">>;

export type Exercise = TimestampColumns & {
  id: string;
  user_id: string;
  workout_id: string;
  name: string;
  category: ExerciseCategory;
  target_sets: number | null;
  target_reps: number | null;
  target_duration_seconds: number | null;
  target_weight: number | null;
  actual_sets: number | null;
  actual_reps: number | null;
  actual_duration_seconds: number | null;
  actual_weight: number | null;
  sort_order: number;
  status: ExerciseStatus;
  notes: string | null;
};

export type ExerciseInsert = MutableTimestampInsert & {
  id?: string;
  user_id: string;
  workout_id: string;
  name: string;
  category: ExerciseCategory;
  target_sets?: number | null;
  target_reps?: number | null;
  target_duration_seconds?: number | null;
  target_weight?: number | null;
  actual_sets?: number | null;
  actual_reps?: number | null;
  actual_duration_seconds?: number | null;
  actual_weight?: number | null;
  sort_order?: number;
  status?: ExerciseStatus;
  notes?: string | null;
};

export type ExerciseUpdate = MutableTimestampUpdate &
  Partial<Omit<ExerciseInsert, "id" | "user_id">>;

export type ExerciseAlternative = TimestampColumns & {
  id: string;
  user_id: string;
  exercise_id: string;
  alternative_name: string;
  reason: string | null;
  equipment_needed: string | null;
  difficulty: ExerciseAlternativeDifficulty | null;
  is_selected: boolean;
  selected_at: string | null;
};

export type ExerciseAlternativeInsert = MutableTimestampInsert & {
  id?: string;
  user_id: string;
  exercise_id: string;
  alternative_name: string;
  reason?: string | null;
  equipment_needed?: string | null;
  difficulty?: ExerciseAlternativeDifficulty | null;
  is_selected?: boolean;
  selected_at?: string | null;
};

export type ExerciseAlternativeUpdate = MutableTimestampUpdate &
  Partial<Omit<ExerciseAlternativeInsert, "id" | "user_id">>;

export type WeightLog = TimestampColumns & {
  id: string;
  user_id: string;
  logged_on: string;
  logged_at: string | null;
  weight_value: number;
  weight_unit: WeightUnit;
  source: LogSource;
  notes: string | null;
};

export type WeightLogInsert = MutableTimestampInsert & {
  id?: string;
  user_id: string;
  logged_on: string;
  logged_at?: string | null;
  weight_value: number;
  weight_unit: WeightUnit;
  source?: LogSource;
  notes?: string | null;
};

export type WeightLogUpdate = MutableTimestampUpdate &
  Partial<Omit<WeightLogInsert, "id" | "user_id">>;

export type MoodLog = TimestampColumns & {
  id: string;
  user_id: string;
  daily_plan_id: string | null;
  logged_on: string;
  logged_at: string;
  mood_score: number;
  energy_score: number | null;
  stress_score: number | null;
  tags: Json | null;
  notes: string | null;
};

export type MoodLogInsert = MutableTimestampInsert & {
  id?: string;
  user_id: string;
  daily_plan_id?: string | null;
  logged_on: string;
  logged_at: string;
  mood_score: number;
  energy_score?: number | null;
  stress_score?: number | null;
  tags?: Json | null;
  notes?: string | null;
};

export type MoodLogUpdate = MutableTimestampUpdate &
  Partial<Omit<MoodLogInsert, "id" | "user_id">>;

export type DailyNote = TimestampColumns & {
  id: string;
  user_id: string;
  daily_plan_id: string | null;
  note_date: string;
  title: string | null;
  body: string;
  category: NoteCategory;
  pinned: boolean;
};

export type DailyNoteInsert = MutableTimestampInsert & {
  id?: string;
  user_id: string;
  daily_plan_id?: string | null;
  note_date: string;
  title?: string | null;
  body: string;
  category?: NoteCategory;
  pinned?: boolean;
};

export type DailyNoteUpdate = MutableTimestampUpdate &
  Partial<Omit<DailyNoteInsert, "id" | "user_id">>;

export type Reminder = TimestampColumns & {
  id: string;
  user_id: string;
  daily_plan_id: string | null;
  related_type: ReminderRelatedType | null;
  related_id: string | null;
  category: ReminderCategory;
  scheduled_at: string;
  status: ReminderStatus;
  channel: ReminderChannel;
  snoozed_until: string | null;
  delivered_at: string | null;
};

export type ReminderInsert = MutableTimestampInsert & {
  id?: string;
  user_id: string;
  daily_plan_id?: string | null;
  related_type?: ReminderRelatedType | null;
  related_id?: string | null;
  category: ReminderCategory;
  scheduled_at: string;
  status?: ReminderStatus;
  channel?: ReminderChannel;
  snoozed_until?: string | null;
  delivered_at?: string | null;
};

export type ReminderUpdate = MutableTimestampUpdate &
  Partial<Omit<ReminderInsert, "id" | "user_id">>;

export type MealSuggestion = TimestampColumns & {
  id: string;
  user_id: string;
  daily_plan_id: string | null;
  meal_date: string;
  meal_type: MealType;
  title: string;
  description: string | null;
  ingredients: Json | null;
  nutrition_summary: Json | null;
  status: MealSuggestionStatus;
  source: MealSuggestionSource;
};

export type MealSuggestionInsert = MutableTimestampInsert & {
  id?: string;
  user_id: string;
  daily_plan_id?: string | null;
  meal_date: string;
  meal_type: MealType;
  title: string;
  description?: string | null;
  ingredients?: Json | null;
  nutrition_summary?: Json | null;
  status?: MealSuggestionStatus;
  source?: MealSuggestionSource;
};

export type MealSuggestionUpdate = MutableTimestampUpdate &
  Partial<Omit<MealSuggestionInsert, "id" | "user_id">>;

export interface Database {
  public: {
    Tables: {
      users: DatabaseTable<User, UserInsert, UserUpdate>;
      user_profiles: DatabaseTable<
        UserProfile,
        UserProfileInsert,
        UserProfileUpdate
      >;
      daily_plans: DatabaseTable<DailyPlan, DailyPlanInsert, DailyPlanUpdate>;
      daily_tasks: DatabaseTable<DailyTask, DailyTaskInsert, DailyTaskUpdate>;
      workouts: DatabaseTable<Workout, WorkoutInsert, WorkoutUpdate>;
      exercises: DatabaseTable<Exercise, ExerciseInsert, ExerciseUpdate>;
      exercise_alternatives: DatabaseTable<
        ExerciseAlternative,
        ExerciseAlternativeInsert,
        ExerciseAlternativeUpdate
      >;
      weight_logs: DatabaseTable<WeightLog, WeightLogInsert, WeightLogUpdate>;
      mood_logs: DatabaseTable<MoodLog, MoodLogInsert, MoodLogUpdate>;
      notes: DatabaseTable<DailyNote, DailyNoteInsert, DailyNoteUpdate>;
      reminders: DatabaseTable<Reminder, ReminderInsert, ReminderUpdate>;
      meal_suggestions: DatabaseTable<
        MealSuggestion,
        MealSuggestionInsert,
        MealSuggestionUpdate
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type TableName = keyof Database["public"]["Tables"];
export type TableRow<Table extends TableName> =
  Database["public"]["Tables"][Table]["Row"];
export type TableInsert<Table extends TableName> =
  Database["public"]["Tables"][Table]["Insert"];
export type TableUpdate<Table extends TableName> =
  Database["public"]["Tables"][Table]["Update"];
