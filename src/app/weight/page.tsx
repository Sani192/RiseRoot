"use client";

import { parseISO } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StickyActionBar } from "@/components/layout/mobile-safe-area";
import {
  buildWeightTrendData,
  createSundayWeightLog,
  type WeightLogEntry,
} from "@/features/weight";
import { useSelectedDate } from "@/features/selected-date-context";
import {
  createWeightLogForDate,
  loadWeightLogsForDate,
} from "@/lib/services/persisted-records";

export default function WeightPage() {
  const { selectedDate } = useSelectedDate();
  const [unit, setUnit] = useState<"lb" | "kg">("lb");
  const [weight, setWeight] = useState("");
  const [entries, setEntries] = useState<WeightLogEntry[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const trend = useMemo(() => buildWeightTrendData(entries), [entries]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setStatus("loading");
      setError(null);
      try {
        const rows = await loadWeightLogsForDate(selectedDate);
        if (!cancelled) {
          setEntries(
            rows.map((row) => ({
              date: row.loggedOn,
              weight: row.weightValue,
              unit: row.weightUnit,
            })),
          );
          setStatus("ready");
        }
      } catch (e) {
        if (!cancelled) {
          setStatus("error");
          setError((e as Error).message);
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  return (
    <AppShell>
      <PageContainer>
        <section className="space-y-4">
          <Card>
            <h1 className="text-2xl font-semibold">Weight</h1>
          </Card>
          <Card className="space-y-3">
            <p className="text-sm">Selected date: {selectedDate}</p>
            <input
              className="min-h-11 w-full rounded-xl border px-3"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="166.4"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as "lb" | "kg")}
              className="min-h-11 w-full rounded-xl border px-3"
            >
              <option value="lb">lb</option>
              <option value="kg">kg</option>
            </select>
            <StickyActionBar className="rounded-2xl bg-background/70 p-2 backdrop-blur-sm">
              <Button
                className="w-full"
                onClick={async () => {
                  setError(null);
                  try {
                    const entry = createSundayWeightLog(
                      Number(weight),
                      unit,
                      parseISO(`${selectedDate}T12:00:00`),
                    );
                    await createWeightLogForDate(
                      entry.date,
                      entry.weight,
                      entry.unit,
                    );
                    const rows = await loadWeightLogsForDate(selectedDate);
                    setEntries(
                      rows.map((row) => ({
                        date: row.loggedOn,
                        weight: row.weightValue,
                        unit: row.weightUnit,
                      })),
                    );
                    setWeight("");
                    setStatus("ready");
                  } catch (e) {
                    setStatus("error");
                    setError((e as Error).message);
                  }
                }}
              >
                Save weekly log
              </Button>
            </StickyActionBar>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </Card>
          <Card>
            <h2 className="text-xl font-semibold">Recent logs</h2>
            {status === "loading" && (
              <p className="text-sm text-muted-foreground">
                Loading weight logs…
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-red-600">
                Failed to load persisted logs for this date/user.
              </p>
            )}
            {status === "ready" && trend.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No logs yet for this selected date.
              </p>
            ) : null}
            {status === "ready" && trend.length > 0 ? (
              <div className="space-y-2 mt-2">
                {trend.map((x) => (
                  <div
                    key={x.date}
                    className="rounded-xl bg-muted/50 p-2 text-sm"
                  >
                    {x.date}: {x.weight}
                    {x.unit} (
                    {x.changeFromPrevious === null
                      ? "baseline"
                      : x.changeFromPrevious.toFixed(1)}
                    )
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        </section>
      </PageContainer>
    </AppShell>
  );
}
