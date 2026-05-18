import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const prompts = [
  "What helped today feel possible?",
  "Any symptoms, blockers, or wins to remember?",
  "What should tomorrow's plan respect?",
];

export default function NotesPage() {
  return (
    <AppShell>
      <PageContainer>
        <section className="space-y-5 pb-6" aria-labelledby="notes-heading">
          <Card className="space-y-3 border-white/60 bg-white/75 backdrop-blur-xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
              Daily notes
            </p>
            <h1
              className="text-3xl font-semibold tracking-tight text-foreground"
              id="notes-heading"
            >
              Capture context for any day.
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Freeform notes stay tied to a selected date so reviews can explain
              what the numbers and checkmarks cannot.
            </p>
          </Card>

          <Card className="space-y-4 border-white/60 bg-white/75 backdrop-blur-xl">
            <div className="flex flex-wrap items-end gap-3">
              <label className="block flex-1 space-y-2 text-sm font-medium text-foreground">
                Note date
                <input
                  className="min-h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-base outline-none focus:border-primary"
                  type="date"
                />
              </label>
              <Button className="min-h-12">Load day</Button>
            </div>
            <label className="block space-y-2 text-sm font-medium text-foreground">
              Freeform note
              <textarea
                className="min-h-56 w-full resize-y rounded-3xl border border-white/70 bg-white/70 p-4 text-base leading-7 outline-none focus:border-primary focus:bg-white"
                placeholder="Write anything that should stay with this day..."
              />
            </label>
            <p className="rounded-2xl bg-muted/70 p-3 text-sm text-muted-foreground">
              Save state placeholder: autosave support can surface here once
              persistence is connected.
            </p>
          </Card>

          <Card className="space-y-3 border-white/60 bg-white/75 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-foreground">
              Gentle prompts
            </h2>
            <div className="space-y-2">
              {prompts.map((prompt) => (
                <button
                  className="min-h-12 w-full rounded-2xl border border-primary/15 bg-primary/5 px-4 text-left text-sm text-primary"
                  key={prompt}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </Card>

          <div className="sticky bottom-24 rounded-3xl border border-white/60 bg-background/80 p-3 shadow-2xl shadow-black/10 backdrop-blur-xl lg:bottom-4">
            <Button className="min-h-12 w-full">Save note</Button>
          </div>
        </section>
      </PageContainer>
    </AppShell>
  );
}
