import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const trendPoints = [40, 55, 48, 62, 70, 66, 78, 74];
const logs = [
  { date: "Apr 5", weight: "168.4 lb", trend: "Baseline" },
  { date: "Apr 12", weight: "167.8 lb", trend: "-0.6" },
  { date: "Apr 19", weight: "167.1 lb", trend: "-0.7" },
  { date: "Apr 26", weight: "166.9 lb", trend: "-0.2" },
];

export default function WeightPage() {
  return (
    <AppShell>
      <PageContainer>
        <section className="space-y-5 pb-6" aria-labelledby="weight-heading">
          <Card className="space-y-3 border-white/60 bg-white/75 backdrop-blur-xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
              Weight
            </p>
            <h1
              className="text-3xl font-semibold tracking-tight text-foreground"
              id="weight-heading"
            >
              Log weekly and watch the trend.
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              The weight screen supports weekly check-ins and a future trend
              graph that emphasizes patterns over daily fluctuations.
            </p>
          </Card>

          <Card className="space-y-4 border-white/60 bg-white/75 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-foreground">
              Weekly log
            </h2>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <label className="block space-y-2 text-sm font-medium text-foreground">
                Week of
                <input
                  className="min-h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-base outline-none focus:border-primary"
                  type="date"
                />
              </label>
              <label className="block space-y-2 text-sm font-medium text-foreground">
                Weight
                <input
                  className="min-h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-base outline-none focus:border-primary"
                  inputMode="decimal"
                  placeholder="166.4"
                  type="text"
                />
              </label>
              <label className="block space-y-2 text-sm font-medium text-foreground">
                Unit
                <select className="min-h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-base outline-none focus:border-primary">
                  <option>lb</option>
                  <option>kg</option>
                </select>
              </label>
            </div>
            <Button className="min-h-12 w-full sm:w-auto">
              Save weekly log
            </Button>
          </Card>

          <Card className="space-y-4 border-white/60 bg-white/75 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                  Trend graph support
                </p>
                <h2 className="text-xl font-semibold text-foreground">
                  Rolling 8-week preview
                </h2>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                -1.5 lb
              </span>
            </div>
            <div className="flex h-40 items-end gap-2 rounded-3xl bg-muted/70 p-4">
              {trendPoints.map((point, index) => (
                <span
                  aria-label={`Week ${index + 1} trend point`}
                  className="flex-1 rounded-t-full bg-primary/70"
                  key={index}
                  style={{ height: `${point}%` }}
                />
              ))}
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Placeholder bars reserve the data shape for chart integration,
              rolling averages, and unit-aware trend labels.
            </p>
          </Card>

          <Card className="space-y-3 border-white/60 bg-white/75 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-foreground">
              Recent logs
            </h2>
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  className="flex items-center justify-between rounded-2xl bg-white/65 p-3"
                  key={log.date}
                >
                  <div>
                    <p className="font-medium text-foreground">{log.date}</p>
                    <p className="text-sm text-muted-foreground">{log.trend}</p>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {log.weight}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </PageContainer>
    </AppShell>
  );
}
