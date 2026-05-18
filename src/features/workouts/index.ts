import type { FeatureBoundary } from "@/types";

export interface WorkoutExercise {
  id: string;
  name: string;
  targetRepetitions?: number;
  targetDurationSeconds?: number;
  completedSets: number;
}

export interface WorkoutSession {
  id: string;
  title: string;
  startedAt: string;
  completedAt: string | null;
  exercises: WorkoutExercise[];
}

export interface WorkoutSessionSummary {
  totalExercises: number;
  completedExercises: number;
  totalSets: number;
  complete: boolean;
}

export function createWorkoutSession(
  title: string,
  exercises: readonly Omit<WorkoutExercise, "completedSets">[],
  now: Date = new Date(),
): WorkoutSession {
  return {
    id: `${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-${now.getTime()}`,
    title,
    startedAt: now.toISOString(),
    completedAt: null,
    exercises: exercises.map((exercise) => ({ ...exercise, completedSets: 0 })),
  };
}

export function recordExerciseSet(
  session: WorkoutSession,
  exerciseId: string,
): WorkoutSession {
  return {
    ...session,
    exercises: session.exercises.map((exercise) =>
      exercise.id === exerciseId
        ? { ...exercise, completedSets: exercise.completedSets + 1 }
        : exercise,
    ),
  };
}

export function completeWorkoutSession(
  session: WorkoutSession,
  now: Date = new Date(),
): WorkoutSession {
  return {
    ...session,
    completedAt: session.completedAt ?? now.toISOString(),
  };
}

export function summarizeWorkoutSession(
  session: WorkoutSession,
): WorkoutSessionSummary {
  const completedExercises = session.exercises.filter(
    (exercise) => exercise.completedSets > 0,
  ).length;

  return {
    totalExercises: session.exercises.length,
    completedExercises,
    totalSets: session.exercises.reduce(
      (sum, exercise) => sum + exercise.completedSets,
      0,
    ),
    complete: session.completedAt !== null,
  };
}

export const workoutsFeature: FeatureBoundary = {
  name: "Workouts",
  phase: "phase-1",
  status: "ready",
};
