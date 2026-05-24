"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { loadTasksForDate } from "@/lib/services/persisted-records";

export function TodayOverview() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [tasks, setTasks] = useState<Array<{ id: string; title: string; status: string }>>([]);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setStatus("loading");
      try {
        const taskRows = await loadTasksForDate(today);
        if (!cancelled) {
          setTasks(taskRows.map((x) => ({ id: x.id, title: x.title, status: x.status })));
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [today]);

  const progress = useMemo(() => {
    const total = tasks.length;
    const complete = tasks.filter((x) => x.status === "completed").length;
    return { total, complete, percent: total === 0 ? 0 : Math.round((complete / total) * 100) };
  }, [tasks]);

  return (
    <section className="space-y-5 pb-6">
      <Card className="space-y-3 border-white/60 bg-white/75 backdrop-blur-xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Today&apos;s routine</h1>
        <p className="text-sm text-muted-foreground">Task completion is computed from persisted records for {today}.</p>
      </Card>
      <Card className="space-y-4 border-white/60 bg-white/75 backdrop-blur-xl">
        {status === "loading" && <p className="text-sm text-muted-foreground">Loading today&apos;s records…</p>}
        {status === "error" && <p className="text-sm text-red-600">Could not load today data. Ensure NEXT_PUBLIC_APP_USER_ID is set.</p>}
        {status === "ready" && tasks.length === 0 && <p className="text-sm text-muted-foreground">No tasks found for today.</p>}
        {status === "ready" && tasks.length > 0 && (
          <>
            <p className="text-sm">{progress.complete} of {progress.total} complete ({progress.percent}%).</p>
            <ul className="space-y-2">{tasks.map((task)=><li className="rounded-2xl bg-muted/70 p-3 text-sm" key={task.id}>{task.title} · {task.status}</li>)}</ul>
          </>
        )}
      </Card>
    </section>
  );
}
