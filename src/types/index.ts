export type ISODateString = string;

export type ModuleStatus = "placeholder" | "planned" | "ready";

export interface FeatureBoundary {
  name: string;
  status: ModuleStatus;
  phase: "phase-1";
}
