"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildWeightTrendData, createSundayWeightLog, upsertWeightLog, type WeightLogEntry } from "@/features/weight";
import { useSelectedDate } from "@/features/selected-date-context";

export default function WeightPage() {
  const { selectedDate } = useSelectedDate();
  const [unit, setUnit] = useState<"lb"|"kg">("lb");
  const [weight, setWeight] = useState("");
  const [entries, setEntries] = useState<WeightLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const trend = useMemo(() => buildWeightTrendData(entries), [entries]);

  return <AppShell><PageContainer><section className="space-y-4"><Card><h1 className="text-2xl font-semibold">Weight</h1></Card><Card className="space-y-3"><p className="text-sm">Selected date: {selectedDate}</p><input className="min-h-11 w-full rounded-xl border px-3" value={weight} onChange={(e)=>setWeight(e.target.value)} placeholder="166.4" /><select value={unit} onChange={(e)=>setUnit(e.target.value as "lb"|"kg")} className="min-h-11 w-full rounded-xl border px-3"><option value="lb">lb</option><option value="kg">kg</option></select><Button onClick={()=>{setError(null); try {const entry=createSundayWeightLog(Number(weight),unit,new Date(selectedDate)); setEntries((prev)=>upsertWeightLog(prev,entry)); setWeight("");} catch (e){setError((e as Error).message);}}}>Save weekly log</Button>{error && <p className="text-sm text-red-600">{error}</p>}</Card><Card><h2 className="text-xl font-semibold">Recent logs</h2>{trend.length===0 ? <p className="text-sm text-muted-foreground">No logs yet.</p> : <div className="space-y-2 mt-2">{trend.map((x)=><div key={x.date} className="rounded-xl bg-muted/50 p-2 text-sm">{x.date}: {x.weight}{x.unit} ({x.changeFromPrevious===null?"baseline":x.changeFromPrevious.toFixed(1)})</div>)}</div>}</Card></section></PageContainer></AppShell>;
}
