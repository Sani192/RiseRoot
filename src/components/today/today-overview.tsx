"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Circle,
  Dumbbell,
  Moon,
  NotebookText,
  Sparkles,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type RoutineTask = {
  id: string;
  title: string;
  time: string;
  description: string;
  complete: boolean;
};

type GeneratedRoutine = {
  dateLabel: string;
  focus: string;
  tasks: RoutineTask[];
  workout: {
    title: string;
    duration: string;
    intensity: string;
    details: string[];
  };
  meals: Array<{
    name: string;
    suggestion: string;
  }>;
  notes: string[];
};

const moodOptions = ["Grounded", "Tender", "Bright"] as const;
const energyOptions = ["Low", "Steady", "High"] as const;

function buildTodayRoutine(): GeneratedRoutine {
  const today = new Date();
  const dateLabel = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(today);

  return {
    dateLabel,
    focus:
      "A steady reset with small wins, nourishing meals, and room to breathe.",
    tasks: [
      {
        id: "hydrate",
        title: "Hydrate before coffee",
        time: "Morning",
        description: "Drink a full glass of water and take three slow breaths.",
        complete: true,
      },
      {
        id: "walk",
        title: "Ten-minute outside walk",
        time: "Midday",
        description:
          "Keep it easy. Notice the light, your pace, and your shoulders.",
        complete: false,
      },
      {
        id: "reset",
        title: "Evening room reset",
        time: "Evening",
        description: "Clear one surface so tomorrow starts with less friction.",
        complete: false,
      },
    ],
    workout: {
      title: "Mobility + gentle strength",
      duration: "24 min",
      intensity: "Low impact",
      details: [
        "Hip openers",
        "Incline push-ups",
        "Glute bridges",
        "Long cooldown",
      ],
    },
    meals: [
      {
        name: "Breakfast",
        suggestion: "Greek yogurt bowl with berries, walnuts, and honey.",
      },
      {
        name: "Lunch",
        suggestion:
          "Warm grain bowl with greens, roasted chickpeas, and tahini.",
      },
      {
        name: "Dinner",
        suggestion: "Sheet-pan salmon or tofu with sweet potato and broccoli.",
      },
    ],
    notes: [
      "What would make today feel lighter?",
      "One thing I can finish in under five minutes is…",
    ],
  };
}

export function TodayOverview() {
  const routine = useMemo(() => buildTodayRoutine(), []);
  const [tasks, setTasks] = useState(routine.tasks);
  const [selectedMood, setSelectedMood] = useState<
    (typeof moodOptions)[number]
  >(moodOptions[0]);
  const [selectedEnergy, setSelectedEnergy] = useState<
    (typeof energyOptions)[number]
  >(energyOptions[1]);

  const completedTaskCount = tasks.filter((task) => task.complete).length;
  const progressPercent = Math.round((completedTaskCount / tasks.length) * 100);

  function toggleTask(taskId: string) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, complete: !task.complete } : task,
      ),
    );
  }

  return (
    <section className="space-y-5 pb-6" aria-labelledby="today-heading">
      <Card className="overflow-hidden border-white/25 bg-foreground/90 p-0 text-primary-foreground shadow-2xl shadow-primary/10 backdrop-blur-xl">
        <div className="relative space-y-5 p-5 sm:p-6">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary-foreground/60">
              {routine.dateLabel}
            </p>
            <div className="space-y-2">
              <h1
                className="text-3xl font-semibold tracking-tight sm:text-4xl"
                id="today-heading"
              >
                Today&apos;s routine
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-primary-foreground/75 sm:text-base">
                {routine.focus}
              </p>
            </div>
          </div>

          <div className="relative rounded-2xl border border-white/15 bg-white/10 p-4 shadow-inner shadow-white/5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary-foreground">
                  Daily progress
                </p>
                <p className="text-sm text-primary-foreground/65">
                  {completedTaskCount} of {tasks.length} tasks complete
                </p>
              </div>
              <span className="text-2xl font-semibold tabular-nums">
                {progressPercent}%
              </span>
            </div>
            <div
              className="mt-4 h-2 rounded-full bg-white/15"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-primary-foreground transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <Card className="space-y-4 border-white/60 bg-white/75 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                  Next steps
                </p>
                <h2 className="text-xl font-semibold text-foreground">
                  Task cards
                </h2>
              </div>
              <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>

            <div className="space-y-3">
              {tasks.map((task) => (
                <button
                  aria-pressed={task.complete}
                  className={cn(
                    "flex min-h-24 w-full items-start gap-3 rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    task.complete
                      ? "border-primary/30 bg-primary/10"
                      : "border-white/70 bg-white/65 hover:bg-white/85",
                  )}
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  type="button"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors",
                      task.complete
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-primary/30 bg-white/70 text-primary",
                    )}
                  >
                    {task.complete ? (
                      <Check className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Circle className="h-5 w-5" aria-hidden="true" />
                    )}
                    <span className="sr-only">
                      {task.complete ? "Mark incomplete" : "Mark complete"}
                    </span>
                  </span>
                  <span className="space-y-1">
                    <span className="block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {task.time}
                    </span>
                    <span
                      className={cn(
                        "block text-base font-semibold text-foreground",
                        task.complete && "line-through decoration-primary/50",
                      )}
                    >
                      {task.title}
                    </span>
                    <span className="block text-sm leading-6 text-muted-foreground">
                      {task.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="space-y-4 border-white/60 bg-white/75 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Dumbbell className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                  Workout
                </p>
                <h2 className="text-xl font-semibold text-foreground">
                  {routine.workout.title}
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-muted/70 p-3">
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold text-foreground">
                  {routine.workout.duration}
                </p>
              </div>
              <div className="rounded-2xl bg-muted/70 p-3">
                <p className="text-xs text-muted-foreground">Intensity</p>
                <p className="text-lg font-semibold text-foreground">
                  {routine.workout.intensity}
                </p>
              </div>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {routine.workout.details.map((detail) => (
                <li
                  className="rounded-full border border-primary/15 bg-primary/5 px-3 py-2 text-sm text-foreground"
                  key={detail}
                >
                  {detail}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="space-y-4 border-white/60 bg-white/75 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Moon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                  Check-in
                </p>
                <h2 className="text-xl font-semibold text-foreground">
                  Mood & energy
                </h2>
              </div>
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-foreground">
                Mood
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {moodOptions.map((mood) => (
                  <Button
                    aria-pressed={selectedMood === mood}
                    className={cn(
                      "min-h-11 bg-white/70 px-3 text-foreground hover:bg-white",
                      selectedMood === mood &&
                        "bg-primary text-primary-foreground",
                    )}
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                  >
                    {mood}
                  </Button>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-foreground">
                Energy
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {energyOptions.map((energy) => (
                  <Button
                    aria-pressed={selectedEnergy === energy}
                    className={cn(
                      "min-h-11 bg-white/70 px-3 text-foreground hover:bg-white",
                      selectedEnergy === energy &&
                        "bg-primary text-primary-foreground",
                    )}
                    key={energy}
                    onClick={() => setSelectedEnergy(energy)}
                  >
                    {energy}
                  </Button>
                ))}
              </div>
            </fieldset>

            <p className="rounded-2xl bg-muted/70 p-3 text-sm leading-6 text-muted-foreground">
              Logged as {selectedMood.toLowerCase()} with{" "}
              {selectedEnergy.toLowerCase()} energy.
            </p>
          </Card>

          <Card className="space-y-4 border-white/60 bg-white/75 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Utensils className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                  Meals
                </p>
                <h2 className="text-xl font-semibold text-foreground">
                  Gentle fuel
                </h2>
              </div>
            </div>
            <div className="space-y-3">
              {routine.meals.map((meal) => (
                <div
                  className="rounded-2xl border border-white/70 bg-white/60 p-3"
                  key={meal.name}
                >
                  <p className="text-sm font-semibold text-foreground">
                    {meal.name}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {meal.suggestion}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4 border-white/60 bg-white/75 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <NotebookText className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                  Notes
                </p>
                <h2 className="text-xl font-semibold text-foreground">
                  Preview prompts
                </h2>
              </div>
            </div>
            <ul className="space-y-2">
              {routine.notes.map((note) => (
                <li
                  className="rounded-2xl bg-muted/70 p-3 text-sm leading-6 text-muted-foreground"
                  key={note}
                >
                  {note}
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </section>
  );
}
