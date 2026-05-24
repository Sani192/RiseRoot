"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { Card } from "@/components/ui/card";
import { getActiveUserId } from "@/lib/supabase/session";
import { supabaseQueries } from "@/lib/supabase/queries";

export default function CalendarPage() {
  const userId = getActiveUserId();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [history, setHistory] = useState<Array<{ planDate: string; completionPercent: number }>>([]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!userId) {
        setStatus("error");
        return;
      }
      setStatus("loading");
      try {
        const today = new Date();
        const from = new Date(today);
        from.setDate(today.getDate() - 29);
        const rows = await supabaseQueries.calendar.listPlanCompletions(userId, {
          from: from.toISOString().slice(0, 10),
          to: today.toISOString().slice(0, 10),
        });
        if (!cancelled) {
          setHistory(rows);
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
  }, [userId]);

  const averageCompletion = useMemo(() => {
    if (history.length === 0) return 0;
    return Math.round(history.reduce((sum, x) => sum + x.completionPercent, 0) / history.length);
  }, [history]);

  return <AppShell><PageContainer><section className="space-y-5 pb-6" aria-labelledby="calendar-heading"><Card className="space-y-3 border-white/60 bg-white/75 backdrop-blur-xl"><h1 className="text-3xl font-semibold tracking-tight text-foreground" id="calendar-heading">Historical completion review</h1><p className="text-sm leading-6 text-muted-foreground">Completion percentages are now calculated from persisted task records.</p></Card>
  <Card className="space-y-4 border-white/60 bg-white/75 backdrop-blur-xl">
    {status==="loading" && <p className="text-sm text-muted-foreground">Loading completion history…</p>}
    {status==="error" && <p className="text-sm text-red-600">Could not load calendar history. Ensure NEXT_PUBLIC_APP_USER_ID is set.</p>}
    {status==="ready" && history.length===0 && <p className="text-sm text-muted-foreground">No historical records yet.</p>}
    {status==="ready" && history.length>0 && <>
      <p className="text-sm">30-day average completion: <span className="font-semibold">{averageCompletion}%</span></p>
      <ul className="space-y-2">{history.map((item)=><li className="rounded-2xl bg-muted/70 p-3 text-sm" key={item.planDate}>{item.planDate}: {item.completionPercent}% complete</li>)}</ul>
    </>}
  </Card></section></PageContainer></AppShell>;
}
