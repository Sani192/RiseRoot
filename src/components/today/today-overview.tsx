import { Card } from "@/components/ui/card";

const placeholderModules = [
  "Daily plans",
  "Tasks",
  "Workouts",
  "Weight",
  "Mood",
  "Notes",
  "Meals",
  "Reminders",
];

export function TodayOverview() {
  return (
    <Card className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Today</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Placeholder module boundaries are present for Phase 1. Scheduling,
          persistence, and completion behavior will be added in later phases.
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {placeholderModules.map((moduleName) => (
          <li
            className="rounded-xl border bg-white/60 px-3 py-2 text-sm text-muted-foreground"
            key={moduleName}
          >
            {moduleName}
          </li>
        ))}
      </ul>
    </Card>
  );
}
