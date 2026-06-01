import type {
  CreateWeightLogInput,
  MoodRepository,
  NoteRecord,
  NoteRepository,
  ReminderRepository,
  ScheduleRepository,
  TaskRepository,
  UpsertDailyTaskInput,
  UpsertWorkoutInput,
  UpsertOnboardingProfileInput,
  UserRepository,
  WeightRepository,
  WorkoutRepository,
} from "@/domain/repositories";
import { createRequire } from "node:module";

import type {
  DailyTask,
  MoodLog,
  Reminder,
  User,
  UserProfile,
  WeightLog,
  Workout,
} from "@/domain";
import { normalizeCompletionTimestamp } from "@/domain/status-timestamp-invariants";
import { getDb } from "@/lib/db";

type SqlTag = (strings: TemplateStringsArray, ...params: unknown[]) => unknown;

const requireModule = createRequire(import.meta.url);

function safeSql(strings: TemplateStringsArray, ...params: unknown[]): unknown {
  if (process.env.DRIZZLE_REPOSITORY_FAKE_SQL === "1") {
    return { kind: "drizzle-sql", strings: [...strings], params };
  }

  const drizzleModule = requireModule("drizzle-orm") as { sql: SqlTag };
  return drizzleModule.sql(strings, ...params);
}

type ExecutableDb = {
  execute: (query: unknown) => Promise<unknown[]>;
};

function db(): ExecutableDb {
  return (getDb() as { db: ExecutableDb }).db;
}

function row<T>(v: unknown): T {
  return v as T;
}

function toDailyTask(r: unknown): DailyTask {
  const task = row<Record<string, unknown>>(r);
  return {
    id: task.id,
    userId: task.user_id,
    dailyPlanId: task.daily_plan_id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    sortOrder: task.sort_order,
    dueAt: task.due_at,
    completedAt: task.completed_at,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  } as DailyTask;
}

function toWorkout(r: unknown): Workout {
  const workout = row<Record<string, unknown>>(r);
  return {
    id: workout.id,
    userId: workout.user_id,
    dailyPlanId: workout.daily_plan_id,
    name: workout.name,
    workoutType: workout.workout_type,
    status: workout.status,
    scheduledAt: workout.scheduled_at,
    startedAt: workout.started_at,
    completedAt: workout.completed_at,
    notes: workout.notes,
    createdAt: workout.created_at,
    updatedAt: workout.updated_at,
  } as Workout;
}

function toWeightLog(r: unknown): WeightLog {
  const weightLog = row<Record<string, unknown>>(r);
  return {
    id: weightLog.id,
    userId: weightLog.user_id,
    loggedOn: weightLog.logged_on,
    loggedAt: weightLog.logged_at,
    weightValue: weightLog.weight_value,
    weightUnit: weightLog.weight_unit,
    source: weightLog.source,
    notes: weightLog.notes,
    createdAt: weightLog.created_at,
    updatedAt: weightLog.updated_at,
  } as WeightLog;
}

function toMoodLog(r: unknown): MoodLog {
  const moodLog = row<Record<string, unknown>>(r);
  return {
    id: moodLog.id,
    userId: moodLog.user_id,
    loggedOn: moodLog.logged_on,
    moodScore: moodLog.mood_score,
    notes: moodLog.notes,
    createdAt: moodLog.created_at,
    updatedAt: moodLog.updated_at,
  } as MoodLog;
}

function toReminder(r: unknown): Reminder {
  const reminder = row<Record<string, unknown>>(r);
  return {
    id: reminder.id,
    userId: reminder.user_id,
    dailyPlanId: reminder.daily_plan_id,
    relatedType: reminder.related_type,
    relatedId: reminder.related_id,
    category: reminder.category,
    status: reminder.status,
    channel: reminder.channel,
    scheduledAt: reminder.scheduled_at,
    deliveredAt: reminder.delivered_at,
    snoozedUntil: reminder.snoozed_until,
    createdAt: reminder.created_at,
    updatedAt: reminder.updated_at,
  } as Reminder;
}

function toUser(r: unknown): User {
  const user = row<Record<string, unknown>>(r);
  return {
    id: user.id,
    displayName: user.display_name,
    email: user.email,
    timezone: user.timezone,
    unitSystem: user.unit_system,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  } as User;
}

function toUserProfile(r: unknown): UserProfile {
  const profile = row<Record<string, unknown>>(r);
  return {
    userId: profile.user_id,
    age: profile.age,
    heightText: profile.height_text,
    weightText: profile.weight_text,
    goals: Array.isArray(profile.goals) ? profile.goals : [],
    preferredGymTiming: profile.preferred_gym_timing,
    wakeTime: profile.wake_time,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  } as UserProfile;
}

function toIsoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

function toDailyNote(r: unknown): NoteRecord {
  const note = row<Record<string, unknown>>(r);
  return {
    id: note.id as string,
    userId: note.user_id as string,
    noteDate: toIsoDate(note.note_date),
    body: note.body as string,
    dailyPlanId: (note.daily_plan_id as string | null) ?? null,
    updatedAt: note.updated_at as string,
  };
}

export const drizzleTaskRepository: TaskRepository = {
  async listByDate(userId, planDate) {
    const rows = await db().execute(safeSql`
      select t.*
      from daily_tasks t
      join daily_plans p on p.id = t.daily_plan_id
      where t.user_id = ${userId} and p.plan_date = ${planDate}
      order by t.sort_order asc
    `);
    return rows.map(toDailyTask);
  },
  async upsert(input: UpsertDailyTaskInput) {
    const task = normalizeCompletionTimestamp(input, {
      entityName: "daily task",
      defaultStatus: "todo",
    });
    const [r] = await db().execute(safeSql`
      insert into daily_tasks (
        id, user_id, daily_plan_id, title, description, status, priority,
        sort_order, due_at, completed_at, created_at, updated_at
      )
      values (
        gen_random_uuid(), ${task.userId}, ${task.dailyPlanId}, ${task.title},
        ${task.description ?? null}, ${task.status}, ${task.priority ?? null},
        ${task.sortOrder ?? 0}, ${task.dueAt ?? null}, ${task.completedAt}, now(), now()
      )
      returning *
    `);
    return toDailyTask(r);
  },
};

export const drizzleWorkoutRepository: WorkoutRepository = {
  async listUpcoming(userId) {
    const rows = await db().execute(safeSql`
      select *
      from workouts
      where user_id = ${userId}
      order by scheduled_at asc nulls last, created_at desc
    `);
    return rows.map(toWorkout);
  },
  async upsert(input: UpsertWorkoutInput) {
    const workout = normalizeCompletionTimestamp(input, {
      entityName: "workout",
      defaultStatus: "planned",
    });
    const [r] = await db().execute(safeSql`
      insert into workouts (
        id, user_id, daily_plan_id, name, workout_type, status, scheduled_at,
        started_at, completed_at, notes, created_at, updated_at
      )
      values (
        gen_random_uuid(), ${workout.userId}, ${workout.dailyPlanId ?? null}, ${workout.name},
        ${workout.workoutType ?? "mixed"}, ${workout.status}, ${workout.scheduledAt ?? null},
        ${workout.startedAt ?? null}, ${workout.completedAt}, ${workout.notes ?? null}, now(), now()
      )
      returning *
    `);
    return toWorkout(r);
  },
};

export const drizzleScheduleRepository: ScheduleRepository = {
  async upsertPlan(input) {
    const [r] = await db().execute(safeSql`
      insert into daily_plans (id, user_id, plan_date, status, summary, created_at, updated_at)
      values (gen_random_uuid(), ${input.userId}, ${input.planDate}, ${input.status}, ${input.summary}, now(), now())
      on conflict (user_id, plan_date) do update
      set status = excluded.status, summary = excluded.summary, updated_at = now()
      returning *
    `);
    const plan = row<Record<string, unknown>>(r);
    return {
      id: plan.id as string,
      userId: plan.user_id as string,
      planDate: plan.plan_date as string,
      status: plan.status as string,
      summary: plan.summary as string,
    };
  },
  async listPlanCompletions(userId, range) {
    const rows = await db().execute(safeSql`
      select
        p.plan_date,
        coalesce(round(avg(case when t.status = 'completed' then 100 else 0 end)), 0)::int as completion_percent
      from daily_plans p
      left join daily_tasks t on t.daily_plan_id = p.id and t.user_id = p.user_id
      where p.user_id = ${userId} and p.plan_date between ${range.from} and ${range.to}
      group by p.plan_date
      order by p.plan_date asc
    `);
    return rows.map((r) => {
      const completion = row<Record<string, unknown>>(r);
      return {
        planDate: completion.plan_date as string,
        completionPercent: completion.completion_percent as number,
      };
    });
  },
};

export const drizzleWeightRepository: WeightRepository = {
  async listByDate(userId: string, loggedOn: string) {
    const rows = await db().execute(safeSql`
      select *
      from weight_logs
      where user_id = ${userId} and logged_on = ${loggedOn}
      order by created_at desc
    `);
    return rows.map(toWeightLog);
  },
  async create(input: CreateWeightLogInput) {
    const [r] = await db().execute(safeSql`
      insert into weight_logs (
        id, user_id, logged_on, logged_at, weight_value, weight_unit, source,
        notes, created_at, updated_at
      )
      values (
        gen_random_uuid(), ${input.userId}, ${input.loggedOn}, ${input.loggedAt ?? null},
        ${input.weightValue}, ${input.weightUnit ?? "lb"}, ${input.source ?? "manual"},
        ${input.notes ?? null}, now(), now()
      )
      returning *
    `);
    return toWeightLog(r);
  },
};

export const drizzleNoteRepository: NoteRepository = {
  async upsertByDate(input) {
    const [r] = await db().execute(safeSql`
      with updated as (
        update notes
        set body = ${input.body}, daily_plan_id = ${input.dailyPlanId ?? null}, updated_at = now()
        where user_id = ${input.userId} and note_date = ${input.noteDate} and category = 'daily'
        returning *
      )
      insert into notes (id, user_id, daily_plan_id, note_date, body, category, created_at, updated_at)
      select gen_random_uuid(), ${input.userId}, ${input.dailyPlanId ?? null}, ${input.noteDate}, ${input.body}, 'daily', now(), now()
      where not exists (select 1 from updated)
      returning *
    `);
    if (r) return toDailyNote(r);

    const [updated] = await db().execute(safeSql`
      select *
      from notes
      where user_id = ${input.userId} and note_date = ${input.noteDate} and category = 'daily'
      order by updated_at desc
      limit 1
    `);
    return toDailyNote(updated);
  },
  async findByDate(userId, noteDate) {
    const [r] = await db().execute(safeSql`
      select *
      from notes
      where user_id = ${userId} and note_date = ${noteDate} and category = 'daily'
      order by updated_at desc
      limit 1
    `);
    if (!r) return null;
    return toDailyNote(r);
  },
};

export const drizzleMoodRepository: MoodRepository = {
  async create(input) {
    const [r] = await db().execute(safeSql`
      insert into mood_logs (id, user_id, logged_on, mood_score, notes, created_at, updated_at)
      values (
        gen_random_uuid(), ${input.userId}, ${input.loggedOn}, ${input.moodScore},
        ${input.notes ?? null}, now(), now()
      )
      returning *
    `);
    return toMoodLog(r);
  },
};

export const drizzleReminderRepository: ReminderRepository = {
  async create(input) {
    const [r] = await db().execute(safeSql`
      insert into reminders (
        id, user_id, daily_plan_id, related_type, related_id, category, status,
        channel, scheduled_at, created_at, updated_at
      )
      values (
        gen_random_uuid(), ${input.userId}, ${input.dailyPlanId ?? null}, ${input.relatedType ?? null},
        ${input.relatedId ?? null}, ${input.category}, ${input.status ?? "scheduled"},
        ${input.channel ?? "in_app"}, ${input.scheduledAt}, now(), now()
      )
      returning *
    `);
    return toReminder(r);
  },
};

export const drizzleUserRepository: UserRepository = {
  async getById(id) {
    const [r] = await db().execute(safeSql`
      select *
      from users
      where id = ${id}
      limit 1
    `);
    if (!r) return null;
    return toUser(r);
  },

  async upsertOnboardingProfile(input: UpsertOnboardingProfileInput) {
    const [userRow] = await db().execute(safeSql`
      insert into users (id, display_name, timezone, unit_system, created_at, updated_at)
      values (
        ${input.userId}, ${input.displayName}, ${input.timezone ?? "UTC"},
        ${input.unitSystem ?? "imperial"}, now(), now()
      )
      on conflict (id) do update set
        display_name = excluded.display_name,
        timezone = excluded.timezone,
        unit_system = excluded.unit_system,
        updated_at = now()
      returning *
    `);

    const [profileRow] = await db().execute(safeSql`
      insert into user_profiles (
        user_id, age, height_text, weight_text, goals, preferred_gym_timing,
        wake_time, created_at, updated_at
      )
      values (
        ${input.userId}, ${input.age}, ${input.heightText ?? null},
        ${input.weightText ?? null}, ${JSON.stringify(input.goals)}::jsonb,
        ${input.preferredGymTiming}, ${input.wakeTime}, now(), now()
      )
      on conflict (user_id) do update set
        age = excluded.age,
        height_text = excluded.height_text,
        weight_text = excluded.weight_text,
        goals = excluded.goals,
        preferred_gym_timing = excluded.preferred_gym_timing,
        wake_time = excluded.wake_time,
        updated_at = now()
      returning *
    `);

    return { user: toUser(userRow), profile: toUserProfile(profileRow) };
  },
  async create(input) {
    const idExpression =
      input.id === undefined
        ? safeSql`gen_random_uuid()`
        : safeSql`${input.id}`;
    const [r] = await db().execute(safeSql`
      insert into users (id, display_name, email, timezone, unit_system, created_at, updated_at)
      values (
        ${idExpression}, ${input.displayName ?? null}, ${input.email ?? null},
        ${input.timezone ?? "UTC"}, ${input.unitSystem ?? "imperial"}, now(), now()
      )
      returning *
    `);
    return toUser(r);
  },
};
