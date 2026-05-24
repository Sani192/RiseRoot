import { describe, expect, it } from "vitest";

import { dailyNoteQueries, dailyPlanQueries, dailyTaskQueries, moodLogQueries, weightLogQueries, workoutQueries } from "@/lib/supabase/queries";

type TableState = Record<string, any[]>;

function createClient(state: TableState) {
  return {
    from(table: string) {
      let rows = [...(state[table] ?? [])];
      const chain: any = {
        select: () => chain,
        order: () => chain,
        maybeSingle: async () => ({ data: rows[0] ?? null, error: null }),
        single: async () => ({ data: rows[0] ?? null, error: null }),
        eq: (_k: string, v: string) => {
          rows = rows.filter((r) => Object.values(r).includes(v));
          return chain;
        },
        gte: () => chain,
        lte: () => chain,
        in: () => chain,
        insert: (input: any) => {
          const row = { id: input.id ?? `${table}-${rows.length + 1}`, ...input };
          state[table] = [...(state[table] ?? []), row];
          rows = [row];
          return chain;
        },
        upsert: (input: any) => chain.insert(input),
        update: (input: any) => {
          rows = rows.map((r) => ({ ...r, ...input }));
          return chain;
        },
        delete: () => chain,
        then: (resolve: (v: any) => void) => resolve({ data: rows, error: null }),
      };
      return chain;
    },
  } as any;
}

describe("supabase persistence integration flows", () => {
  it("persists and fetches tasks/notes/weight/mood/workout flow data", async () => {
    const state: TableState = {
      daily_plans: [{ id: "plan-1", user_id: "u1", plan_date: "2026-05-24" }],
      daily_tasks: [], notes: [], weight_logs: [], mood_logs: [], workouts: [],
    };
    const client = createClient(state);

    await dailyTaskQueries.create({ user_id: "u1", daily_plan_id: "plan-1", title: "Hydrate" }, { client });
    await dailyNoteQueries.create({ user_id: "u1", note_date: "2026-05-24", content: "Steady day" } as any, { client });
    await weightLogQueries.create({ user_id: "u1", logged_on: "2026-05-24", weight_value: 166.4, weight_unit: "lb", source: "manual" }, { client });
    await moodLogQueries.create({ user_id: "u1", logged_on: "2026-05-24", mood_score: 8, energy_score: 7, source: "manual" } as any, { client });
    await workoutQueries.create({ user_id: "u1", daily_plan_id: "plan-1", name: "Upper", workout_type: "strength" }, { client });

    const [tasks, notes, weights, moods, workouts] = await Promise.all([
      dailyTaskQueries.listForPlan("u1", "plan-1", { client }),
      dailyNoteQueries.list("u1", undefined, { client }),
      weightLogQueries.list("u1", undefined, { client }),
      moodLogQueries.list("u1", undefined, { client }),
      workoutQueries.listForPlan("u1", "plan-1", { client }),
    ]);

    expect(tasks).toHaveLength(1);
    expect(notes).toHaveLength(1);
    expect(weights).toHaveLength(1);
    expect(moods).toHaveLength(1);
    expect(workouts).toHaveLength(1);
  });

  it("returns empty tasks when plan lookup misses by date", async () => {
    const client = createClient({ daily_plans: [], daily_tasks: [] });
    const tasks = await dailyTaskQueries.listByDate("u1", "2026-05-24", { client });
    expect(tasks).toEqual([]);
    const plan = await dailyPlanQueries.getByDate("u1", "2026-05-24", { client });
    expect(plan).toBeNull();
  });
});
