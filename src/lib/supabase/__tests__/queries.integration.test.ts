import { describe, expect, it } from "vitest";

import {
  dailyNoteQueries,
  dailyPlanQueries,
  dailyTaskQueries,
  moodLogQueries,
  weightLogQueries,
  workoutQueries,
} from "@/lib/supabase/queries";

type TableRow = Record<string, unknown>;
type TableState = Record<string, TableRow[]>;

type QueryChain = {
  select: () => QueryChain;
  order: () => QueryChain;
  maybeSingle: () => Promise<{ data: TableRow | null; error: null }>;
  single: () => Promise<{ data: TableRow | null; error: null }>;
  eq: (_k: string, v: string) => QueryChain;
  gte: () => QueryChain;
  lte: () => QueryChain;
  in: () => QueryChain;
  insert: (input: TableRow) => QueryChain;
  upsert: (input: TableRow) => QueryChain;
  update: (input: TableRow) => QueryChain;
  delete: () => QueryChain;
  then: (resolve: (v: { data: TableRow[]; error: null }) => void) => void;
};

function createClient(state: TableState): never {
  return {
    from(table: string) {
      let rows = [...(state[table] ?? [])];
      const chain: QueryChain = {
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
        insert: (input: TableRow) => {
          const row = {
            id: input.id ?? `${table}-${rows.length + 1}`,
            ...input,
          };
          state[table] = [...(state[table] ?? []), row];
          rows = [row];
          return chain;
        },
        upsert: (input: TableRow) => chain.insert(input),
        update: (input: TableRow) => {
          rows = rows.map((r) => ({ ...r, ...input }));
          return chain;
        },
        delete: () => chain,
        then: (resolve: (v: { data: TableRow[]; error: null }) => void) =>
          resolve({ data: rows, error: null }),
      };
      return chain;
    },
  } as never;
}

describe("supabase persistence integration flows", () => {
  it("persists and fetches tasks/notes/weight/mood/workout flow data", async () => {
    const state: TableState = {
      daily_plans: [{ id: "plan-1", user_id: "u1", plan_date: "2026-05-24" }],
      daily_tasks: [],
      notes: [],
      weight_logs: [],
      mood_logs: [],
      workouts: [],
    };
    const client = createClient(state);

    await dailyTaskQueries.create(
      { user_id: "u1", daily_plan_id: "plan-1", title: "Hydrate" },
      { client },
    );
    await dailyNoteQueries.create(
      { user_id: "u1", note_date: "2026-05-24", body: "Steady day" },
      { client },
    );
    await weightLogQueries.create(
      {
        user_id: "u1",
        logged_on: "2026-05-24",
        weight_value: 166.4,
        weight_unit: "lb",
        source: "manual",
      },
      { client },
    );
    await moodLogQueries.create(
      {
        user_id: "u1",
        logged_on: "2026-05-24",
        mood_score: 8,
        energy_score: 7,
        source: "manual",
      } as never,
      { client },
    );
    await workoutQueries.create(
      {
        user_id: "u1",
        daily_plan_id: "plan-1",
        name: "Upper",
        workout_type: "strength",
      },
      { client },
    );

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

  it("normalizes completed and non-completed daily task transitions", async () => {
    const state: TableState = {
      daily_tasks: [
        {
          id: "task-1",
          user_id: "u1",
          daily_plan_id: "plan-1",
          title: "Hydrate",
          status: "completed",
          completed_at: "2026-05-24T10:00:00.000Z",
        },
      ],
    };
    const client = createClient(state);

    const completed = await dailyTaskQueries.create(
      {
        user_id: "u1",
        daily_plan_id: "plan-1",
        title: "Done",
        status: "completed",
      },
      { client },
    );
    expect(completed.status).toBe("completed");
    expect(completed.completed_at).toEqual(expect.any(String));

    const reopened = await dailyTaskQueries.update(
      "task-1",
      "u1",
      { status: "todo" },
      { client },
    );
    expect(reopened.status).toBe("todo");
    expect(reopened.completed_at).toBeNull();

    await expect(
      dailyTaskQueries.upsert(
        {
          user_id: "u1",
          daily_plan_id: "plan-1",
          title: "Invalid",
          status: "todo",
          completed_at: "2026-05-24T10:00:00.000Z",
        },
        { client },
      ),
    ).rejects.toThrow(
      "daily task completedAt can only be set when status is completed",
    );
  });

  it("normalizes completed and non-completed workout transitions", async () => {
    const state: TableState = {
      workouts: [
        {
          id: "workout-1",
          user_id: "u1",
          daily_plan_id: "plan-1",
          name: "Upper",
          workout_type: "strength",
          status: "completed",
          completed_at: "2026-05-24T10:00:00.000Z",
        },
      ],
    };
    const client = createClient(state);

    const completed = await workoutQueries.create(
      {
        user_id: "u1",
        daily_plan_id: "plan-1",
        name: "Done",
        workout_type: "strength",
        status: "completed",
      },
      { client },
    );
    expect(completed.status).toBe("completed");
    expect(completed.completed_at).toEqual(expect.any(String));

    const skipped = await workoutQueries.update(
      "workout-1",
      "u1",
      { status: "skipped" },
      { client },
    );
    expect(skipped.status).toBe("skipped");
    expect(skipped.completed_at).toBeNull();

    await expect(
      workoutQueries.upsert(
        {
          user_id: "u1",
          daily_plan_id: "plan-1",
          name: "Invalid",
          workout_type: "strength",
          status: "planned",
          completed_at: "2026-05-24T10:00:00.000Z",
        },
        { client },
      ),
    ).rejects.toThrow(
      "workout completedAt can only be set when status is completed",
    );
  });

  it("returns empty tasks when plan lookup misses by date", async () => {
    const client = createClient({ daily_plans: [], daily_tasks: [] });
    const tasks = await dailyTaskQueries.listByDate("u1", "2026-05-24", {
      client,
    });
    expect(tasks).toEqual([]);
    const plan = await dailyPlanQueries.getByDate("u1", "2026-05-24", {
      client,
    });
    expect(plan).toBeNull();
  });
});
