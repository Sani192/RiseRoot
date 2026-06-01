import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

import { closeDb, getDb } from "@/lib/db";
import {
  drizzleMoodRepository,
  drizzleNoteRepository,
  drizzleReminderRepository,
  drizzleScheduleRepository,
  drizzleTaskRepository,
  drizzleUserRepository,
  drizzleWeightRepository,
  drizzleWorkoutRepository,
} from "../drizzle-repositories";

const databaseUrl = process.env.DRIZZLE_REPOSITORY_DATABASE_URL;
const hasDrizzleOrm = existsSync(
  join(process.cwd(), "node_modules/drizzle-orm"),
);
const describeIfPostgres =
  databaseUrl && hasDrizzleOrm ? describe : describe.skip;
const maliciousText = "O'Hara'); drop table users; -- /* $1 */";
const updatedMaliciousText = 'updated: "quote"; select * from reminders; --';
const userId = "11111111-1111-4111-8111-111111111111";
const relatedId = "22222222-2222-4222-8222-222222222222";

type SqlTag = (strings: TemplateStringsArray, ...params: unknown[]) => unknown;
type ExecutableDb = { execute: (query: unknown) => Promise<unknown[]> };

const requireModule = createRequire(import.meta.url);

function sql(strings: TemplateStringsArray, ...params: unknown[]): unknown {
  const drizzleModule = requireModule("drizzle-orm") as { sql: SqlTag };
  return drizzleModule.sql(strings, ...params);
}

function db(): ExecutableDb {
  return (getDb() as { db: ExecutableDb }).db;
}

async function resetSchema() {
  await db().execute(sql`create extension if not exists pgcrypto`);
  await db().execute(
    sql`drop table if exists reminders, mood_logs, notes, weight_logs, workouts, daily_tasks, daily_plans, user_profiles, users cascade`,
  );
  await db().execute(sql`
    create table users (
      id uuid primary key default gen_random_uuid(),
      display_name text,
      email text,
      timezone text not null default 'UTC',
      unit_system text not null default 'imperial',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
  await db().execute(sql`
    create table user_profiles (
      user_id uuid primary key references users(id) on delete cascade,
      age integer not null,
      height_text text,
      weight_text text,
      goals jsonb not null default '[]'::jsonb,
      preferred_gym_timing text not null,
      wake_time time not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
  await db().execute(sql`
    create table daily_plans (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id) on delete cascade,
      plan_date date not null,
      status text not null default 'draft',
      summary text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (user_id, plan_date),
      unique (user_id, id)
    )
  `);
  await db().execute(sql`
    create table daily_tasks (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id) on delete cascade,
      daily_plan_id uuid not null,
      title text not null,
      description text,
      status text not null default 'todo',
      priority integer,
      sort_order integer not null default 0,
      due_at timestamptz,
      completed_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      foreign key (user_id, daily_plan_id) references daily_plans(user_id, id) on delete cascade
    )
  `);
  await db().execute(sql`
    create table workouts (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id) on delete cascade,
      daily_plan_id uuid,
      name text not null,
      workout_type text not null default 'mixed',
      status text not null default 'planned',
      scheduled_at timestamptz,
      started_at timestamptz,
      completed_at timestamptz,
      notes text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      foreign key (user_id, daily_plan_id) references daily_plans(user_id, id) on delete set null
    )
  `);
  await db().execute(sql`
    create table weight_logs (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id) on delete cascade,
      logged_on date not null,
      logged_at timestamptz,
      weight_value numeric(6,2) not null,
      weight_unit text not null default 'lb',
      source text not null default 'manual',
      notes text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (user_id, logged_on, source)
    )
  `);
  await db().execute(sql`
    create table notes (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id) on delete cascade,
      daily_plan_id uuid,
      note_date date not null,
      body text not null,
      category text not null default 'daily',
      pinned boolean not null default false,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      foreign key (user_id, daily_plan_id) references daily_plans(user_id, id) on delete set null
    )
  `);
  await db().execute(sql`
    create table mood_logs (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id) on delete cascade,
      logged_on date not null,
      mood_score integer not null,
      notes text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
  await db().execute(sql`
    create table reminders (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id) on delete cascade,
      daily_plan_id uuid,
      related_type text,
      related_id uuid,
      category text not null,
      status text not null default 'scheduled',
      channel text not null default 'in_app',
      scheduled_at timestamptz not null,
      delivered_at timestamptz,
      snoozed_until timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      foreign key (user_id, daily_plan_id) references daily_plans(user_id, id) on delete set null
    )
  `);
}

describeIfPostgres("drizzle repositories against PostgreSQL", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = databaseUrl;
    await resetSchema();
  });

  afterAll(async () => {
    await db().execute(
      sql`drop table if exists reminders, mood_logs, notes, weight_logs, workouts, daily_tasks, daily_plans, user_profiles, users cascade`,
    );
    await closeDb();
  });

  it("safely inserts, updates, and filters rows containing quotes and SQL metacharacters", async () => {
    const user = await drizzleUserRepository.create({
      id: userId,
      displayName: maliciousText,
      email: "ohara.sql@example.com",
      timezone: "America/New_York'; select 1; --",
    });
    expect(user.displayName).toBe(maliciousText);
    await expect(drizzleUserRepository.getById(userId)).resolves.toMatchObject({
      displayName: maliciousText,
    });

    const profile = await drizzleUserRepository.upsertOnboardingProfile({
      userId,
      displayName: updatedMaliciousText,
      age: 35,
      heightText: maliciousText,
      weightText: updatedMaliciousText,
      goals: ["Build strength", "Move daily"],
      preferredGymTiming: "Flexible",
      wakeTime: "07:15",
      timezone: "America/Los_Angeles",
    });
    expect(profile.user.displayName).toBe(updatedMaliciousText);
    expect(profile.profile.goals).toEqual(["Build strength", "Move daily"]);

    const plan = await drizzleScheduleRepository.upsertPlan({
      userId,
      planDate: "2026-05-31",
      status: "active",
      summary: maliciousText,
    });
    expect(plan.summary).toBe(maliciousText);

    const updatedPlan = await drizzleScheduleRepository.upsertPlan({
      userId,
      planDate: "2026-05-31",
      status: "completed",
      summary: updatedMaliciousText,
    });
    expect(updatedPlan.summary).toBe(updatedMaliciousText);

    const task = await drizzleTaskRepository.upsert({
      userId,
      dailyPlanId: plan.id,
      title: maliciousText,
      description: updatedMaliciousText,
      sortOrder: 7,
    });
    expect(task.title).toBe(maliciousText);
    const tasks = await drizzleTaskRepository.listByDate(userId, "2026-05-31");
    expect(tasks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ description: updatedMaliciousText }),
      ]),
    );

    const workout = await drizzleWorkoutRepository.upsert({
      userId,
      dailyPlanId: plan.id,
      name: maliciousText,
      notes: updatedMaliciousText,
      scheduledAt: "2026-05-31T15:00:00.000Z",
    });
    expect(workout.notes).toBe(updatedMaliciousText);
    await expect(
      drizzleWorkoutRepository.listUpcoming(userId),
    ).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: maliciousText }),
      ]),
    );

    const weight = await drizzleWeightRepository.create({
      userId,
      loggedOn: "2026-05-31",
      weightValue: 180.25,
      notes: maliciousText,
    });
    expect(weight.notes).toBe(maliciousText);
    await expect(
      drizzleWeightRepository.listByDate(userId, "2026-05-31"),
    ).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ notes: maliciousText }),
      ]),
    );

    const note = await drizzleNoteRepository.upsertByDate({
      userId,
      noteDate: "2026-05-31",
      body: maliciousText,
      dailyPlanId: plan.id,
    });
    expect(note.body).toBe(maliciousText);
    expect(note.dailyPlanId).toBe(plan.id);
    const updatedNote = await drizzleNoteRepository.upsertByDate({
      userId,
      noteDate: "2026-05-31",
      body: updatedMaliciousText,
    });
    expect(updatedNote.body).toBe(updatedMaliciousText);
    expect(updatedNote.dailyPlanId).toBeNull();
    await expect(
      drizzleNoteRepository.findByDate(userId, "2026-05-31"),
    ).resolves.toMatchObject({
      body: updatedMaliciousText,
      noteDate: "2026-05-31",
    });

    const mood = await drizzleMoodRepository.create({
      userId,
      loggedOn: "2026-05-31",
      moodScore: 8,
      notes: maliciousText,
    });
    expect(mood.notes).toBe(maliciousText);

    const reminder = await drizzleReminderRepository.create({
      userId,
      dailyPlanId: plan.id,
      relatedType: "daily_task",
      relatedId,
      category: "task",
      scheduledAt: "2026-05-31T16:00:00.000Z",
    });
    expect(reminder.relatedType).toBe("daily_task");

    await expect(
      drizzleScheduleRepository.listPlanCompletions(userId, {
        from: "2026-05-01",
        to: "2026-06-30",
      }),
    ).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ completionPercent: 0 }),
      ]),
    );
  });
});
