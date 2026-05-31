import type { SupabaseClient } from "@supabase/supabase-js";

import { normalizeCompletionTimestamp } from "@/domain/status-timestamp-invariants";

import { requireBrowserSupabaseClient } from "./client";
import type {
  DailyNote,
  DailyNoteInsert,
  DailyNoteUpdate,
  DailyPlan,
  DailyPlanInsert,
  DailyPlanUpdate,
  DailyTask,
  DailyTaskInsert,
  DailyTaskUpdate,
  Database,
  Exercise,
  ExerciseAlternative,
  ExerciseAlternativeInsert,
  ExerciseAlternativeUpdate,
  ExerciseInsert,
  ExerciseUpdate,
  MealSuggestion,
  MealSuggestionInsert,
  MealSuggestionUpdate,
  MoodLog,
  MoodLogInsert,
  MoodLogUpdate,
  Reminder,
  ReminderInsert,
  ReminderRelatedType,
  ReminderUpdate,
  User,
  UserInsert,
  UserUpdate,
  WeightLog,
  WeightLogInsert,
  WeightLogUpdate,
  Workout,
  WorkoutInsert,
  WorkoutUpdate,
} from "./types";

type RiseRootSupabaseClient = SupabaseClient<Database>;

type QueryOptions = {
  client?: RiseRootSupabaseClient;
};

type DateRange = {
  from?: string;
  to?: string;
};

function normalizeDailyTaskMutation<
  T extends DailyTaskInsert | DailyTaskUpdate,
>(input: T): T {
  const normalized = normalizeCompletionTimestamp(
    {
      ...input,
      completedAt: input.completed_at,
    },
    {
      entityName: "daily task",
      defaultStatus: "title" in input ? "todo" : undefined,
    },
  );

  const rest = { ...normalized } as Record<string, unknown>;
  delete rest.completedAt;
  return {
    ...rest,
    completed_at: normalized.completedAt,
  } as T;
}

function normalizeWorkoutMutation<T extends WorkoutInsert | WorkoutUpdate>(
  input: T,
): T {
  const normalized = normalizeCompletionTimestamp(
    {
      ...input,
      completedAt: input.completed_at,
    },
    {
      entityName: "workout",
      defaultStatus: "name" in input ? "planned" : undefined,
    },
  );

  const rest = { ...normalized } as Record<string, unknown>;
  delete rest.completedAt;
  return {
    ...rest,
    completed_at: normalized.completedAt,
  } as T;
}

function getClient(options?: QueryOptions): RiseRootSupabaseClient {
  return options?.client ?? requireBrowserSupabaseClient();
}

export const userQueries = {
  async getById(id: string, options?: QueryOptions): Promise<User | null> {
    const { data, error } = await getClient(options)
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  },

  async getByEmail(
    email: string,
    options?: QueryOptions,
  ): Promise<User | null> {
    const { data, error } = await getClient(options)
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  },

  async create(input: UserInsert, options?: QueryOptions): Promise<User> {
    const { data, error } = await getClient(options)
      .from("users")
      .insert(input)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async update(
    id: string,
    input: UserUpdate,
    options?: QueryOptions,
  ): Promise<User> {
    const { data, error } = await getClient(options)
      .from("users")
      .update(input)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};

export const dailyPlanQueries = {
  async getById(
    id: string,
    userId: string,
    options?: QueryOptions,
  ): Promise<DailyPlan | null> {
    const { data, error } = await getClient(options)
      .from("daily_plans")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  },

  async getByDate(
    userId: string,
    planDate: string,
    options?: QueryOptions,
  ): Promise<DailyPlan | null> {
    const { data, error } = await getClient(options)
      .from("daily_plans")
      .select("*")
      .eq("user_id", userId)
      .eq("plan_date", planDate)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  },

  async list(
    userId: string,
    range?: DateRange,
    options?: QueryOptions,
  ): Promise<DailyPlan[]> {
    let query = getClient(options)
      .from("daily_plans")
      .select("*")
      .eq("user_id", userId)
      .order("plan_date", { ascending: false });

    if (range?.from) {
      query = query.gte("plan_date", range.from);
    }

    if (range?.to) {
      query = query.lte("plan_date", range.to);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  },

  async upsert(
    input: DailyPlanInsert,
    options?: QueryOptions,
  ): Promise<DailyPlan> {
    const { data, error } = await getClient(options)
      .from("daily_plans")
      .upsert(input, { onConflict: "user_id,plan_date" })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async update(
    id: string,
    userId: string,
    input: DailyPlanUpdate,
    options?: QueryOptions,
  ): Promise<DailyPlan> {
    const { data, error } = await getClient(options)
      .from("daily_plans")
      .update(input)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};

export const dailyTaskQueries = {
  async listByDate(
    userId: string,
    planDate: string,
    options?: QueryOptions,
  ): Promise<DailyTask[]> {
    const plan = await dailyPlanQueries.getByDate(userId, planDate, options);

    if (!plan) {
      return [];
    }

    return this.listForPlan(userId, plan.id, options);
  },
  async listForPlan(
    userId: string,
    dailyPlanId: string,
    options?: QueryOptions,
  ): Promise<DailyTask[]> {
    const { data, error } = await getClient(options)
      .from("daily_tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("daily_plan_id", dailyPlanId)
      .order("sort_order", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  },

  async listOpen(userId: string, options?: QueryOptions): Promise<DailyTask[]> {
    const { data, error } = await getClient(options)
      .from("daily_tasks")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["todo", "in_progress"])
      .order("due_at", { ascending: true, nullsFirst: false });

    if (error) {
      throw error;
    }

    return data;
  },

  async create(
    input: DailyTaskInsert,
    options?: QueryOptions,
  ): Promise<DailyTask> {
    const { data, error } = await getClient(options)
      .from("daily_tasks")
      .insert(normalizeDailyTaskMutation(input))
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async upsert(
    input: DailyTaskInsert,
    options?: QueryOptions,
  ): Promise<DailyTask> {
    const { data, error } = await getClient(options)
      .from("daily_tasks")
      .upsert(normalizeDailyTaskMutation(input), { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
  async update(
    id: string,
    userId: string,
    input: DailyTaskUpdate,
    options?: QueryOptions,
  ): Promise<DailyTask> {
    const { data, error } = await getClient(options)
      .from("daily_tasks")
      .update(normalizeDailyTaskMutation(input))
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async remove(
    id: string,
    userId: string,
    options?: QueryOptions,
  ): Promise<void> {
    const { error } = await getClient(options)
      .from("daily_tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }
  },
};

export const workoutQueries = {
  async listByDate(
    userId: string,
    planDate: string,
    options?: QueryOptions,
  ): Promise<Workout[]> {
    const plan = await dailyPlanQueries.getByDate(userId, planDate, options);

    if (!plan) {
      return [];
    }

    return this.listForPlan(userId, plan.id, options);
  },
  async listForPlan(
    userId: string,
    dailyPlanId: string,
    options?: QueryOptions,
  ): Promise<Workout[]> {
    const { data, error } = await getClient(options)
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .eq("daily_plan_id", dailyPlanId)
      .order("scheduled_at", { ascending: true, nullsFirst: false });

    if (error) {
      throw error;
    }

    return data;
  },

  async listUpcoming(
    userId: string,
    options?: QueryOptions,
  ): Promise<Workout[]> {
    const { data, error } = await getClient(options)
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["planned", "in_progress"])
      .order("scheduled_at", { ascending: true, nullsFirst: false });

    if (error) {
      throw error;
    }

    return data;
  },

  async create(input: WorkoutInsert, options?: QueryOptions): Promise<Workout> {
    const { data, error } = await getClient(options)
      .from("workouts")
      .insert(normalizeWorkoutMutation(input))
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async upsert(input: WorkoutInsert, options?: QueryOptions): Promise<Workout> {
    const { data, error } = await getClient(options)
      .from("workouts")
      .upsert(normalizeWorkoutMutation(input), { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
  async update(
    id: string,
    userId: string,
    input: WorkoutUpdate,
    options?: QueryOptions,
  ): Promise<Workout> {
    const { data, error } = await getClient(options)
      .from("workouts")
      .update(normalizeWorkoutMutation(input))
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};

export const exerciseQueries = {
  async listForWorkout(
    userId: string,
    workoutId: string,
    options?: QueryOptions,
  ): Promise<Exercise[]> {
    const { data, error } = await getClient(options)
      .from("exercises")
      .select("*")
      .eq("user_id", userId)
      .eq("workout_id", workoutId)
      .order("sort_order", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  },

  async create(
    input: ExerciseInsert,
    options?: QueryOptions,
  ): Promise<Exercise> {
    const { data, error } = await getClient(options)
      .from("exercises")
      .insert(input)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async update(
    id: string,
    userId: string,
    input: ExerciseUpdate,
    options?: QueryOptions,
  ): Promise<Exercise> {
    const { data, error } = await getClient(options)
      .from("exercises")
      .update(input)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  alternatives: {
    async listForExercise(
      userId: string,
      exerciseId: string,
      options?: QueryOptions,
    ): Promise<ExerciseAlternative[]> {
      const { data, error } = await getClient(options)
        .from("exercise_alternatives")
        .select("*")
        .eq("user_id", userId)
        .eq("exercise_id", exerciseId)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      return data;
    },

    async create(
      input: ExerciseAlternativeInsert,
      options?: QueryOptions,
    ): Promise<ExerciseAlternative> {
      const { data, error } = await getClient(options)
        .from("exercise_alternatives")
        .insert(input)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async update(
      id: string,
      userId: string,
      input: ExerciseAlternativeUpdate,
      options?: QueryOptions,
    ): Promise<ExerciseAlternative> {
      const { data, error } = await getClient(options)
        .from("exercise_alternatives")
        .update(input)
        .eq("id", id)
        .eq("user_id", userId)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
  },
};

export const calendarQueries = {
  async listPlanCompletions(
    userId: string,
    range: Required<DateRange>,
    options?: QueryOptions,
  ): Promise<Array<{ planDate: string; completionPercent: number }>> {
    const plans = await dailyPlanQueries.list(userId, range, options);
    const planRows = await Promise.all(
      plans.map(async (plan) => {
        const tasks = await dailyTaskQueries.listForPlan(
          userId,
          plan.id,
          options,
        );
        const completed = tasks.filter(
          (task) => task.status === "completed",
        ).length;
        const total = tasks.length;
        const completionPercent =
          total === 0 ? 0 : Math.round((completed / total) * 100);

        return { planDate: plan.plan_date, completionPercent };
      }),
    );

    return planRows.sort((a, b) => a.planDate.localeCompare(b.planDate));
  },
};

export const weightLogQueries = {
  async list(
    userId: string,
    range?: DateRange,
    options?: QueryOptions,
  ): Promise<WeightLog[]> {
    let query = getClient(options)
      .from("weight_logs")
      .select("*")
      .eq("user_id", userId)
      .order("logged_on", { ascending: false });

    if (range?.from) {
      query = query.gte("logged_on", range.from);
    }

    if (range?.to) {
      query = query.lte("logged_on", range.to);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  },

  async create(
    input: WeightLogInsert,
    options?: QueryOptions,
  ): Promise<WeightLog> {
    const { data, error } = await getClient(options)
      .from("weight_logs")
      .insert(input)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async update(
    id: string,
    userId: string,
    input: WeightLogUpdate,
    options?: QueryOptions,
  ): Promise<WeightLog> {
    const { data, error } = await getClient(options)
      .from("weight_logs")
      .update(input)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};

export const moodLogQueries = {
  async list(
    userId: string,
    range?: DateRange,
    options?: QueryOptions,
  ): Promise<MoodLog[]> {
    let query = getClient(options)
      .from("mood_logs")
      .select("*")
      .eq("user_id", userId)
      .order("logged_on", { ascending: false });

    if (range?.from) {
      query = query.gte("logged_on", range.from);
    }

    if (range?.to) {
      query = query.lte("logged_on", range.to);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  },

  async listForPlan(
    userId: string,
    dailyPlanId: string,
    options?: QueryOptions,
  ): Promise<MoodLog[]> {
    const { data, error } = await getClient(options)
      .from("mood_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("daily_plan_id", dailyPlanId)
      .order("logged_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  },

  async create(input: MoodLogInsert, options?: QueryOptions): Promise<MoodLog> {
    const { data, error } = await getClient(options)
      .from("mood_logs")
      .insert(input)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async update(
    id: string,
    userId: string,
    input: MoodLogUpdate,
    options?: QueryOptions,
  ): Promise<MoodLog> {
    const { data, error } = await getClient(options)
      .from("mood_logs")
      .update(input)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};

export const dailyNoteQueries = {
  async list(
    userId: string,
    range?: DateRange,
    options?: QueryOptions,
  ): Promise<DailyNote[]> {
    let query = getClient(options)
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("note_date", { ascending: false });

    if (range?.from) {
      query = query.gte("note_date", range.from);
    }

    if (range?.to) {
      query = query.lte("note_date", range.to);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  },

  async listForPlan(
    userId: string,
    dailyPlanId: string,
    options?: QueryOptions,
  ): Promise<DailyNote[]> {
    const { data, error } = await getClient(options)
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .eq("daily_plan_id", dailyPlanId)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  },

  async create(
    input: DailyNoteInsert,
    options?: QueryOptions,
  ): Promise<DailyNote> {
    const { data, error } = await getClient(options)
      .from("notes")
      .insert(input)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async update(
    id: string,
    userId: string,
    input: DailyNoteUpdate,
    options?: QueryOptions,
  ): Promise<DailyNote> {
    const { data, error } = await getClient(options)
      .from("notes")
      .update(input)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};

export const mealSuggestionQueries = {
  async listForDate(
    userId: string,
    mealDate: string,
    options?: QueryOptions,
  ): Promise<MealSuggestion[]> {
    const { data, error } = await getClient(options)
      .from("meal_suggestions")
      .select("*")
      .eq("user_id", userId)
      .eq("meal_date", mealDate)
      .order("meal_type", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  },

  async listForPlan(
    userId: string,
    dailyPlanId: string,
    options?: QueryOptions,
  ): Promise<MealSuggestion[]> {
    const { data, error } = await getClient(options)
      .from("meal_suggestions")
      .select("*")
      .eq("user_id", userId)
      .eq("daily_plan_id", dailyPlanId)
      .order("meal_type", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  },

  async create(
    input: MealSuggestionInsert,
    options?: QueryOptions,
  ): Promise<MealSuggestion> {
    const { data, error } = await getClient(options)
      .from("meal_suggestions")
      .insert(input)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async update(
    id: string,
    userId: string,
    input: MealSuggestionUpdate,
    options?: QueryOptions,
  ): Promise<MealSuggestion> {
    const { data, error } = await getClient(options)
      .from("meal_suggestions")
      .update(input)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};

export const reminderQueries = {
  async listUpcoming(
    userId: string,
    before?: string,
    options?: QueryOptions,
  ): Promise<Reminder[]> {
    let query = getClient(options)
      .from("reminders")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["scheduled", "snoozed"])
      .order("scheduled_at", { ascending: true });

    if (before) {
      query = query.lte("scheduled_at", before);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  },

  async listForPlan(
    userId: string,
    dailyPlanId: string,
    options?: QueryOptions,
  ): Promise<Reminder[]> {
    const { data, error } = await getClient(options)
      .from("reminders")
      .select("*")
      .eq("user_id", userId)
      .eq("daily_plan_id", dailyPlanId)
      .order("scheduled_at", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  },

  async listForRelatedRecord(
    userId: string,
    relatedType: ReminderRelatedType,
    relatedId: string,
    options?: QueryOptions,
  ): Promise<Reminder[]> {
    const { data, error } = await getClient(options)
      .from("reminders")
      .select("*")
      .eq("user_id", userId)
      .eq("related_type", relatedType)
      .eq("related_id", relatedId)
      .order("scheduled_at", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  },

  async create(
    input: ReminderInsert,
    options?: QueryOptions,
  ): Promise<Reminder> {
    const { data, error } = await getClient(options)
      .from("reminders")
      .insert(input)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async update(
    id: string,
    userId: string,
    input: ReminderUpdate,
    options?: QueryOptions,
  ): Promise<Reminder> {
    const { data, error } = await getClient(options)
      .from("reminders")
      .update(input)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};

export const supabaseQueries = {
  users: userQueries,
  dailyPlans: dailyPlanQueries,
  dailyTasks: dailyTaskQueries,
  workouts: workoutQueries,
  exercises: exerciseQueries,
  weightLogs: weightLogQueries,
  moodLogs: moodLogQueries,
  dailyNotes: dailyNoteQueries,
  mealSuggestions: mealSuggestionQueries,
  reminders: reminderQueries,
  calendar: calendarQueries,
};
