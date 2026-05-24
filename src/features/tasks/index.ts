import type { FeatureBoundary } from "@/types";

export interface TaskCompletionState {
  taskId: string;
  completed: boolean;
  completedAt: string | null;
}

export interface TaskProgressSummary {
  total: number;
  completed: number;
  remaining: number;
  percentComplete: number;
}

export function createTaskCompletionState(
  taskId: string,
  completed = false,
  now: Date = new Date(),
): TaskCompletionState {
  return {
    taskId,
    completed,
    completedAt: completed ? now.toISOString() : null,
  };
}

export function markTaskComplete(
  state: TaskCompletionState,
  now: Date = new Date(),
): TaskCompletionState {
  return {
    ...state,
    completed: true,
    completedAt: state.completedAt ?? now.toISOString(),
  };
}

export function markTaskIncomplete(
  state: TaskCompletionState,
): TaskCompletionState {
  return {
    ...state,
    completed: false,
    completedAt: null,
  };
}

export function toggleTaskCompletion(
  state: TaskCompletionState,
  now: Date = new Date(),
): TaskCompletionState {
  return state.completed
    ? markTaskIncomplete(state)
    : markTaskComplete(state, now);
}

export function summarizeTaskProgress(
  states: readonly TaskCompletionState[],
): TaskProgressSummary {
  const completed = states.filter((state) => state.completed).length;
  const total = states.length;

  return {
    total,
    completed,
    remaining: total - completed,
    percentComplete: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export type WorkoutSplit = {
  day: string;
  focus: string;
  recovery: boolean;
};

const workoutSplitByWeekday: Record<string, WorkoutSplit> = {
  Monday: { day: "Monday", focus: "Upper body strength", recovery: false },
  Tuesday: { day: "Tuesday", focus: "Cardio and core", recovery: false },
  Wednesday: { day: "Wednesday", focus: "Lower body strength", recovery: false },
  Thursday: { day: "Thursday", focus: "Mobility and posture", recovery: false },
  Friday: { day: "Friday", focus: "Full body compound", recovery: false },
  Saturday: { day: "Saturday", focus: "Active recovery", recovery: true },
  Sunday: { day: "Sunday", focus: "Rest and reset", recovery: true },
};

export function getDailyWorkoutSplit(weekday: string): WorkoutSplit {
  return workoutSplitByWeekday[weekday] ?? workoutSplitByWeekday.Monday!;
}


export const tasksFeature: FeatureBoundary = {
  name: "Tasks",
  phase: "phase-1",
  status: "ready",
};
