import type { FeatureBoundary } from "@/types";

export type MoodValue = "grounded" | "tender" | "bright";
export type StressValue = "low" | "medium" | "high";
export type EnergyValue = "low" | "steady" | "high";

export interface CheckInState {
  mood: MoodValue;
  stress: StressValue;
  energy: EnergyValue;
}

export interface SelectOption<TValue extends string> {
  value: TValue;
  label: string;
}

export const moodOptions: readonly SelectOption<MoodValue>[] = [
  { value: "grounded", label: "Grounded" },
  { value: "tender", label: "Tender" },
  { value: "bright", label: "Bright" },
];

export const stressOptions: readonly SelectOption<StressValue>[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const energyOptions: readonly SelectOption<EnergyValue>[] = [
  { value: "low", label: "Low" },
  { value: "steady", label: "Steady" },
  { value: "high", label: "High" },
];

function selectOptionLabel<TValue extends string>(
  options: readonly SelectOption<TValue>[],
  value: TValue,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function selectMoodLabel(state: CheckInState): string {
  return selectOptionLabel(moodOptions, state.mood);
}

export function selectStressLabel(state: CheckInState): string {
  return selectOptionLabel(stressOptions, state.stress);
}

export function selectEnergyLabel(state: CheckInState): string {
  return selectOptionLabel(energyOptions, state.energy);
}

export function selectCheckInSummary(state: CheckInState): string {
  return `${selectMoodLabel(state)} mood · ${selectStressLabel(state)} stress · ${selectEnergyLabel(state)} energy`;
}

export const moodFeature: FeatureBoundary = {
  name: "Mood",
  phase: "phase-1",
  status: "ready",
};
