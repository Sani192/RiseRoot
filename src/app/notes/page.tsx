"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StickyActionBar } from "@/components/layout/mobile-safe-area";
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
        setStatus("error");
      });
  }, [selectedDate]);

  const saveNote = async () => {
    if (!value.trim()) {
      setStatus("error");
      return;
    }
    setStatus("saving");
    plannedResourcesService.notes.save(selectedDate, value).then(()=>setStatus("saved")).catch(()=>setStatus("error"));
  };

  return <AppShell><PageContainer><section className="space-y-4"><Card className="space-y-3"><h1 className="text-2xl font-semibold">Daily notes</h1><p className="text-sm text-muted-foreground">Notes for {selectedDate}.</p></Card><Card className="space-y-3"><label className="space-y-2 text-sm font-medium">Note<textarea aria-invalid={status==="error" && !value.trim()} value={value} onChange={(e)=>setValue(e.target.value)} className="min-h-56 w-full rounded-2xl border p-3" placeholder="Write your note..." /></label>{status==="loading" && <p className="text-sm">Loading note...</p>}{status==="error" && <p className="text-sm text-red-600" role="alert">Please enter note text before saving, or retry if loading failed.</p>}<StickyActionBar className="rounded-2xl bg-background/70 p-2 backdrop-blur-sm"><Button className="w-full" onClick={saveNote} disabled={status==="saving" || status==="loading"}>{status==="saving" ? "Saving..." : "Save note"}</Button></StickyActionBar>{status==="saved" && <p className="text-sm text-primary" role="status">Saved.</p>}</Card></section></PageContainer></AppShell>;
}
