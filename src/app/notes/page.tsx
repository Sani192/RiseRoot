"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSelectedDate } from "@/features/selected-date-context";
import { plannedResourcesService } from "@/lib/services/planned-resources";

export default function NotesPage() {
  const { selectedDate } = useSelectedDate();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    setStatus("loading");
    plannedResourcesService.notes
      .get(selectedDate)
      .then((note) => {
        setValue((note as { body?: string }).body ?? "");
        setStatus("idle");
      })
      .catch(() => {
        setValue("");
        setStatus("idle");
      });
  }, [selectedDate]);

  return <AppShell><PageContainer><section className="space-y-4"><Card className="space-y-3"><h1 className="text-2xl font-semibold">Daily notes</h1><p className="text-sm text-muted-foreground">Notes for {selectedDate}.</p></Card><Card className="space-y-3"><textarea value={value} onChange={(e)=>setValue(e.target.value)} className="min-h-56 w-full rounded-2xl border p-3" placeholder="Write your note..." />{status==="loading" && <p className="text-sm">Loading…</p>}{status==="error" && <p className="text-sm text-red-600">Could not load note.</p>}<Button onClick={()=>{setStatus("saving"); plannedResourcesService.notes.save(selectedDate, value).then(()=>setStatus("saved")).catch(()=>setStatus("error"));}}>Save note</Button>{status==="saved" && <p className="text-sm text-primary">Saved.</p>}</Card></section></PageContainer></AppShell>;
}
