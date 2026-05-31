import { describe, expect, it } from "vitest";

import { dailyNoteQueries, dailyTaskQueries, moodLogQueries, reminderQueries, weightLogQueries, workoutQueries } from "@/lib/supabase/queries";

function createPolicyRecorder() {
  const records: Array<{ table: string; filters: string[] }> = [];
  return {
    records,
    client: {
      from(table: string) {
        const entry = { table, filters: [] as string[] };
        records.push(entry);
        const chain: any = {
          select: () => chain,
          order: () => chain,
          in: () => chain,
          gte: () => chain,
          lte: () => chain,
          insert: () => chain,
          upsert: () => chain,
          update: () => chain,
          delete: () => chain,
          maybeSingle: async () => ({ data: null, error: null }),
          single: async () => ({ data: {}, error: null }),
          eq: (column: string) => {
            entry.filters.push(column);
            return chain;
          },
          then: (resolve: (v: any) => void) => resolve({ data: [], error: null }),
        };
        return chain;
      },
    } as any,
  };
}

describe("schema/policy ownership boundaries", () => {
  it("applies user ownership filters across mutable tables", async () => {
    const recorder = createPolicyRecorder();
    const { client, records } = recorder;

    await dailyTaskQueries.update("t1", "u1", { title: "x" }, { client });
    await workoutQueries.update("w1", "u1", { name: "Leg day" }, { client });
    await weightLogQueries.update("wl1", "u1", { notes: "updated" }, { client });
    await moodLogQueries.update("ml1", "u1", { notes: "updated" } as any, { client });
    await dailyNoteQueries.update("n1", "u1", { body: "updated" }, { client });
    await reminderQueries.update("r1", "u1", { status: "dismissed" }, { client });

    const userScoped = records.every((r) => !["daily_tasks", "workouts", "weight_logs", "mood_logs", "notes", "reminders"].includes(r.table) || r.filters.includes("user_id"));
    expect(userScoped).toBe(true);
  });
});
