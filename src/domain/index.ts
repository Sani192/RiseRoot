export type UnitSystem = "imperial" | "metric";
export type DailyTaskStatus = "todo" | "in_progress" | "completed" | "skipped";
export type WorkoutType = "strength" | "cardio" | "mobility" | "recovery" | "mixed";
export type WorkoutStatus = "planned" | "in_progress" | "completed" | "skipped";
export type ExerciseCategory = "strength" | "cardio" | "mobility" | "warmup" | "cooldown";
export type ExerciseStatus = "planned" | "completed" | "skipped" | "swapped";
export type WeightUnit = "lb" | "kg";
export type LogSource = "manual" | "imported" | "device";
export type ReminderCategory = "task" | "workout" | "meal" | "hydration" | "wellbeing" | "daily_review";
export type ReminderStatus = "scheduled" | "sent" | "dismissed" | "snoozed" | "cancelled";
export type ReminderChannel = "in_app" | "push" | "email";

export interface User { id: string; displayName: string | null; email: string | null; timezone: string; unitSystem: UnitSystem; createdAt: string; updatedAt: string; }
export interface DailyTask { id: string; userId: string; dailyPlanId: string; title: string; description: string | null; status: DailyTaskStatus; priority: number | null; sortOrder: number; dueAt: string | null; completedAt: string | null; createdAt: string; updatedAt: string; }
export interface Workout { id: string; userId: string; dailyPlanId: string | null; name: string; workoutType: WorkoutType; status: WorkoutStatus; scheduledAt: string | null; startedAt: string | null; completedAt: string | null; notes: string | null; createdAt: string; updatedAt: string; }
export interface Exercise { id: string; userId: string; workoutId: string; name: string; category: ExerciseCategory; targetSets: number | null; targetReps: number | null; targetDurationSeconds: number | null; targetWeight: number | null; actualSets: number | null; actualReps: number | null; actualDurationSeconds: number | null; actualWeight: number | null; sortOrder: number; status: ExerciseStatus; notes: string | null; createdAt: string; updatedAt: string; }
export interface WeightLog { id: string; userId: string; loggedOn: string; loggedAt: string | null; weightValue: number; weightUnit: WeightUnit; source: LogSource; notes: string | null; createdAt: string; updatedAt: string; }
export interface MoodLog { id: string; userId: string; loggedOn: string; moodScore: number; notes: string | null; createdAt: string; updatedAt: string; }
export interface Reminder { id: string; userId: string; dailyPlanId: string | null; relatedType: string | null; relatedId: string | null; category: ReminderCategory; status: ReminderStatus; channel: ReminderChannel; scheduledAt: string; deliveredAt: string | null; snoozedUntil: string | null; createdAt: string; updatedAt: string; }
export interface Schedule { planDate: string; planId: string; generatedTaskIds: string[]; generatedWorkoutId: string; }
