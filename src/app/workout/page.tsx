import { CheckCircle2, Repeat2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const exercises = [
  {
    name: "Goblet squat",
    sets: 3,
    reps: "8–10",
    weight: "35 lb",
    alternatives: ["Bodyweight squat", "Leg press"],
  },
  {
    name: "Incline push-up",
    sets: 3,
    reps: "10–12",
    weight: "Bodyweight",
    alternatives: ["Wall push-up", "Dumbbell chest press"],
  },
  {
    name: "Dumbbell row",
    sets: 3,
    reps: "10 each",
    weight: "20 lb",
    alternatives: ["Band row", "Cable row"],
  },
];

export default function WorkoutPage() {
  return (
    <AppShell>
      <PageContainer>
        <section className="space-y-5 pb-6" aria-labelledby="workout-heading">
          <Card className="space-y-3 border-white/60 bg-white/75 backdrop-blur-xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
              Workout
            </p>
            <h1
              className="text-3xl font-semibold tracking-tight text-foreground"
              id="workout-heading"
            >
              Strength session with flexible swaps.
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Track exercises, sets, reps, working weights, completion, and
              alternatives without leaving the workout flow.
            </p>
          </Card>

          <Card className="space-y-4 border-white/60 bg-white/75 backdrop-blur-xl">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-muted/70 p-3">
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold text-foreground">38 min</p>
              </div>
              <div className="rounded-2xl bg-muted/70 p-3">
                <p className="text-xs text-muted-foreground">Sets</p>
                <p className="text-lg font-semibold text-foreground">9</p>
              </div>
              <div className="rounded-2xl bg-muted/70 p-3">
                <p className="text-xs text-muted-foreground">Effort</p>
                <p className="text-lg font-semibold text-foreground">Steady</p>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {exercises.map((exercise) => (
              <Card
                className="space-y-4 border-white/60 bg-white/75 backdrop-blur-xl"
                key={exercise.name}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {exercise.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {exercise.sets} sets · {exercise.reps} reps ·{" "}
                      {exercise.weight}
                    </p>
                  </div>
                  <label className="flex min-h-11 items-center gap-2 rounded-full bg-primary/10 px-3 text-sm font-medium text-primary">
                    <input className="accent-primary" type="checkbox" />
                    Done
                  </label>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {Array.from({ length: exercise.sets }, (_, index) => (
                    <label
                      className="space-y-2 rounded-2xl border border-white/70 bg-white/65 p-3 text-sm font-medium text-foreground"
                      key={index}
                    >
                      Set {index + 1}
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          aria-label={`${exercise.name} set ${index + 1} reps`}
                          className="min-h-11 rounded-xl border border-white/70 bg-white/70 px-3 outline-none focus:border-primary"
                          defaultValue={exercise.reps.replace(/[^0-9].*/, "")}
                          inputMode="numeric"
                        />
                        <input
                          aria-label={`${exercise.name} set ${index + 1} weight`}
                          className="min-h-11 rounded-xl border border-white/70 bg-white/70 px-3 outline-none focus:border-primary"
                          defaultValue={exercise.weight}
                        />
                      </div>
                    </label>
                  ))}
                </div>

                <div className="space-y-2 rounded-2xl bg-muted/70 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Repeat2
                      className="h-4 w-4 text-primary"
                      aria-hidden="true"
                    />
                    Alternatives
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {exercise.alternatives.map((alternative) => (
                      <button
                        className="min-h-10 rounded-full border border-primary/15 bg-primary/5 px-3 text-sm text-primary"
                        key={alternative}
                        type="button"
                      >
                        {alternative}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="sticky bottom-24 flex gap-2 rounded-3xl border border-white/60 bg-background/80 p-3 shadow-2xl shadow-black/10 backdrop-blur-xl lg:bottom-4">
            <Button className="min-h-12 flex-1 bg-white/80 text-foreground hover:bg-white">
              Save draft
            </Button>
            <Button className="min-h-12 flex-1">
              <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Complete
            </Button>
          </div>
        </section>
      </PageContainer>
    </AppShell>
  );
}
