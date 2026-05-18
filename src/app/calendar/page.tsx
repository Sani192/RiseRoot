import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const weekDays = [
  { day: "Mon", date: "18", complete: 82 },
  { day: "Tue", date: "19", complete: 60 },
  { day: "Wed", date: "20", complete: 100 },
  { day: "Thu", date: "21", complete: 45 },
  { day: "Fri", date: "22", complete: 0 },
  { day: "Sat", date: "23", complete: 0 },
  { day: "Sun", date: "24", complete: 0 },
];

const monthCells = Array.from({ length: 30 }, (_, index) => ({
  date: index + 1,
  complete: [0, 20, 45, 60, 80, 100][index % 6] ?? 0,
}));

const history = [
  "Completed 4 of 5 daily tasks yesterday",
  "Logged strength workout on Wednesday",
  "Added notes on 5 of the last 7 days",
];

export default function CalendarPage() {
  return (
    <AppShell>
      <PageContainer>
        <section className="space-y-5 pb-6" aria-labelledby="calendar-heading">
          <Card className="space-y-3 border-white/60 bg-white/75 backdrop-blur-xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
              Calendar
            </p>
            <h1
              className="text-3xl font-semibold tracking-tight text-foreground"
              id="calendar-heading"
            >
              Review your routine over time.
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Move between day, week, and month views while keeping completion
              history calm and readable.
            </p>
          </Card>

          <Card className="space-y-4 border-white/60 bg-white/75 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                  Day view
                </p>
                <h2 className="text-xl font-semibold text-foreground">
                  Monday, May 18
                </h2>
              </div>
              <div className="flex gap-2">
                <Button className="bg-white/70 text-foreground hover:bg-white">
                  Prev
                </Button>
                <Button>Today</Button>
                <Button className="bg-white/70 text-foreground hover:bg-white">
                  Next
                </Button>
              </div>
            </div>
            <div className="rounded-2xl bg-muted/70 p-4">
              <p className="text-sm text-muted-foreground">Completion</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">82%</p>
              <div className="mt-3 h-2 rounded-full bg-white/70">
                <div className="h-full w-[82%] rounded-full bg-primary" />
              </div>
            </div>
          </Card>

          <Card className="space-y-4 border-white/60 bg-white/75 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                  Week view
                </p>
                <h2 className="text-xl font-semibold text-foreground">
                  May 18–24
                </h2>
              </div>
              <div className="flex gap-2 text-sm text-muted-foreground">
                <span>‹ Week</span>
                <span>Week ›</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <button
                  className="min-h-24 rounded-2xl border border-white/70 bg-white/65 p-2 text-center transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  key={day.day}
                  type="button"
                >
                  <span className="block text-xs font-medium text-muted-foreground">
                    {day.day}
                  </span>
                  <span className="block text-lg font-semibold text-foreground">
                    {day.date}
                  </span>
                  <span className="mt-2 block rounded-full bg-primary/10 px-1 py-1 text-xs font-medium text-primary">
                    {day.complete}%
                  </span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="space-y-4 border-white/60 bg-white/75 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                  Month view
                </p>
                <h2 className="text-xl font-semibold text-foreground">
                  May 2026
                </h2>
              </div>
              <div className="flex gap-2 text-sm text-muted-foreground">
                <span>‹ Month</span>
                <span>Month ›</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {monthCells.map((cell) => (
                <span
                  className="flex aspect-square items-center justify-center rounded-2xl border border-white/70 bg-white/65 text-sm font-medium text-foreground"
                  key={cell.date}
                  style={{ opacity: 0.45 + cell.complete / 200 }}
                >
                  {cell.date}
                </span>
              ))}
            </div>
          </Card>

          <Card className="space-y-3 border-white/60 bg-white/75 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-foreground">
              Historical completion review
            </h2>
            <ul className="space-y-2">
              {history.map((item) => (
                <li
                  className="rounded-2xl bg-muted/70 p-3 text-sm leading-6 text-muted-foreground"
                  key={item}
                >
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </PageContainer>
    </AppShell>
  );
}
