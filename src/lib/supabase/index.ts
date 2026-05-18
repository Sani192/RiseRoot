export {
  SupabaseConfigurationError,
  getBrowserSupabaseClient,
  getMissingSupabaseEnvVars,
  getSupabaseConfigurationError,
  getSupabaseProjectConfig,
  isSupabaseConfigured,
  requireBrowserSupabaseClient,
} from "./client";
export type { SupabaseProjectConfig } from "./client";
export {
  dailyNoteQueries,
  dailyPlanQueries,
  dailyTaskQueries,
  exerciseQueries,
  mealSuggestionQueries,
  moodLogQueries,
  reminderQueries,
  supabaseQueries,
  userQueries,
  weightLogQueries,
  workoutQueries,
} from "./queries";
export type * from "./types";
