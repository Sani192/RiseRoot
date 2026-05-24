"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { Card } from "@/components/ui/card";
import { getActiveUserId } from "@/lib/supabase/session";

export default function WorkoutPage() {
  const userId = getActiveUserId();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [rows, setRows] = useState<Array<{ id: string; name: string; status: string }>>([]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!userId) return setStatus("error");
      setStatus("loading");
      try {
        const response = await fetch(`/api/workouts?userId=${userId}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load workouts");
        const workouts = (await response.json()) as Array<{ id: string; title?: string; name?: string; status: string }>;
        if (!cancelled) {
          setRows(workouts.map((x) => ({ id: x.id, name: x.name ?? x.title ?? "Workout", status: x.status })));
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

  return <AppShell><PageContainer><section className="space-y-5 pb-6" aria-labelledby="workout-heading"><Card className="space-y-3 border-white/60 bg-white/75 backdrop-blur-xl"><h1 className="text-3xl font-semibold tracking-tight text-foreground" id="workout-heading">Workout queue</h1><p className="text-sm leading-6 text-muted-foreground">Workout cards are rendered from persisted records.</p></Card><Card className="space-y-4 border-white/60 bg-white/75 backdrop-blur-xl">{status==="loading" && <p className="text-sm text-muted-foreground">Loading workouts…</p>}{status==="error" && <p className="text-sm text-red-600">Could not load workouts. Ensure NEXT_PUBLIC_APP_USER_ID is set.</p>}{status==="ready" && rows.length===0 && <p className="text-sm text-muted-foreground">No workouts found.</p>}{status==="ready" && rows.length>0 && <ul className="space-y-2">{rows.map((r)=><li key={r.id} className="rounded-2xl bg-muted/70 p-3 text-sm"><span className="font-semibold">{r.name}</span> · {r.status}</li>)}</ul>}</Card></section></PageContainer></AppShell>;
}
