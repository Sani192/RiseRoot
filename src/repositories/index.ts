import {
  drizzleMoodRepository,
  drizzleNoteRepository,
  drizzleReminderRepository,
  drizzleScheduleRepository,
  drizzleTaskRepository,
  drizzleUserRepository,
  drizzleWeightRepository,
  drizzleWorkoutRepository,
} from "@/infrastructure/orm/drizzle-repositories";

export {
  type CreateWeightLogInput,
  type MoodRepository,
  type NoteRepository,
  type ReminderRepository,
  type ScheduleRepository,
  type TaskRepository,
  type UpsertDailyTaskInput,
  type UpsertWorkoutInput,
  type UpsertOnboardingProfileInput,
  type OnboardingProfileResult,
  type UserRepository,
  type WeightRepository,
  type WorkoutRepository,
} from "@/domain/repositories";

export const taskRepository = drizzleTaskRepository;
export const scheduleRepository = drizzleScheduleRepository;
export const workoutRepository = drizzleWorkoutRepository;
export const weightRepository = drizzleWeightRepository;
export const noteRepository = drizzleNoteRepository;
export const moodRepository = drizzleMoodRepository;
export const reminderRepository = drizzleReminderRepository;
export const userRepository = drizzleUserRepository;
