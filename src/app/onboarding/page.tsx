import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const goals = ["Build strength", "Lose fat", "Feel energized", "Move daily"];
const gymWindows = ["Early morning", "Lunch break", "After work", "Flexible"];

export default function OnboardingPage() {
  return (
    <AppShell>
      <PageContainer>
        <section
          className="space-y-5 pb-6"
          aria-labelledby="onboarding-heading"
        >
          <Card className="space-y-3 border-white/60 bg-white/75 backdrop-blur-xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
              Profile setup
            </p>
            <h1
              className="text-3xl font-semibold tracking-tight text-foreground"
              id="onboarding-heading"
            >
              Tell RiseRoot how to pace your plan.
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              These starter details shape workout timing, recovery reminders,
              and gentle progress targets. You can revise everything later.
            </p>
          </Card>

          <form className="space-y-4">
            <Card className="space-y-4 border-white/60 bg-white/75 backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-foreground">
                Body profile
              </h2>
              <label className="block space-y-2 text-sm font-medium text-foreground">
                Name
                <input
                  className="min-h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-base outline-none transition focus:border-primary focus:bg-white"
                  name="name"
                  placeholder="Maya"
                  type="text"
                />
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="block space-y-2 text-sm font-medium text-foreground">
                  Age
                  <input
                    className="min-h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-base outline-none transition focus:border-primary focus:bg-white"
                    inputMode="numeric"
                    name="age"
                    placeholder="32"
                    type="number"
                  />
                </label>
                <label className="block space-y-2 text-sm font-medium text-foreground">
                  Height
                  <input
                    className="min-h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-base outline-none transition focus:border-primary focus:bg-white"
                    name="height"
                    placeholder={"5'8\""}
                    type="text"
                  />
                </label>
                <label className="block space-y-2 text-sm font-medium text-foreground">
                  Weight
                  <input
                    className="min-h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-base outline-none transition focus:border-primary focus:bg-white"
                    inputMode="decimal"
                    name="weight"
                    placeholder="165 lb"
                    type="text"
                  />
                </label>
              </div>
            </Card>

            <Card className="space-y-4 border-white/60 bg-white/75 backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-foreground">
                Goals and rhythm
              </h2>
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-foreground">
                  Goals
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {goals.map((goal) => (
                    <label
                      className="flex min-h-12 items-center gap-2 rounded-2xl border border-primary/15 bg-primary/5 px-3 text-sm text-foreground"
                      key={goal}
                    >
                      <input
                        className="accent-primary"
                        name="goals"
                        type="checkbox"
                      />
                      {goal}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-foreground">
                  Preferred gym timing
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {gymWindows.map((window) => (
                    <label
                      className="flex min-h-12 items-center gap-2 rounded-2xl border border-white/70 bg-white/65 px-3 text-sm text-foreground"
                      key={window}
                    >
                      <input
                        className="accent-primary"
                        name="gymTiming"
                        type="radio"
                      />
                      {window}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="block space-y-2 text-sm font-medium text-foreground">
                Usual wake time
                <input
                  className="min-h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-base outline-none transition focus:border-primary focus:bg-white"
                  name="wakeTime"
                  type="time"
                />
              </label>
            </Card>

            <div className="sticky bottom-24 rounded-3xl border border-white/60 bg-background/80 p-3 shadow-2xl shadow-black/10 backdrop-blur-xl lg:bottom-4">
              <Button className="min-h-12 w-full" type="submit">
                Save profile setup
              </Button>
            </div>
          </form>
        </section>
      </PageContainer>
    </AppShell>
  );
}
