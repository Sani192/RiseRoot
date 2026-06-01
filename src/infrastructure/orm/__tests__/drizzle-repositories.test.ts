import { afterEach, describe, expect, it, vi } from "vitest";

process.env.DRIZZLE_REPOSITORY_FAKE_SQL = "1";

const executeMock = vi.fn<(query: unknown) => Promise<unknown[]>>();

vi.mock("@/lib/db", () => ({
  getDb: () => ({ db: { execute: executeMock } }),
}));

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

const maliciousText = "O'Hara'); drop table users; -- /* $1 */";
const updatedMaliciousText = 'updated: "quote"; select * from reminders; --';
const userId = "00000000-0000-0000-0000-000000000001";
const planId = "00000000-0000-0000-0000-000000000002";
const relatedId = "00000000-0000-0000-0000-000000000003";

const row = {
  id: "00000000-0000-0000-0000-000000000004",
  user_id: userId,
  daily_plan_id: planId,
  plan_date: "2026-05-31",
  title: maliciousText,
  description: maliciousText,
  status: "active",
  priority: 1,
  sort_order: 1,
  due_at: "2026-05-31T12:00:00.000Z",
  completed_at: null,
  name: maliciousText,
  workout_type: "mixed",
  scheduled_at: "2026-05-31T12:00:00.000Z",
  started_at: null,
  notes: maliciousText,
  logged_on: "2026-05-31",
  logged_at: "2026-05-31T12:00:00.000Z",
  weight_value: "180.25",
  weight_unit: "lb",
  source: "manual",
  mood_score: 7,
  category: "task",
  channel: "in_app",
  related_type: "daily_task",
  related_id: relatedId,
  delivered_at: null,
  snoozed_until: null,
  display_name: maliciousText,
  age: 29,
  height_text: maliciousText,
  weight_text: updatedMaliciousText,
  goals: ["Build strength"],
  preferred_gym_timing: "Early morning",
  wake_time: "06:30",
  email: "o'hara+sql@example.com",
  timezone: maliciousText,
  unit_system: "imperial",
  summary: maliciousText,
  completion_percent: 50,
  note_date: "2026-05-31",
  body: maliciousText,
  updated_at: "2026-05-31T12:00:00.000Z",
  created_at: "2026-05-31T12:00:00.000Z",
};

function lastQueryParams() {
  const query = executeMock.mock.calls.at(-1)?.[0] as
    | { params?: unknown[] }
    | undefined;
  expect(query).toBeDefined();
  expect(typeof query).not.toBe("string");
  return query?.params ?? [];
}

function expectSafeQueryWith(value: string) {
  expect(lastQueryParams()).toContain(value);
}

describe("drizzle repositories", () => {
  afterEach(() => {
    executeMock.mockReset();
  });

  it("sets task completion timestamps for completed inserts and clears them for non-completed inserts", async () => {
    executeMock.mockResolvedValue([row]);

    await drizzleTaskRepository.upsert({
      userId,
      dailyPlanId: planId,
      title: "Done",
      status: "completed",
    });
    const completedParams = lastQueryParams();
    expect(completedParams).toContain("completed");
    expect(
      completedParams.find(
        (param) => typeof param === "string" && /T.*Z$/.test(param),
      ),
    ).toBeDefined();

    await drizzleTaskRepository.upsert({
      userId,
      dailyPlanId: planId,
      title: "Skipped",
      status: "skipped",
    });
    const skippedParams = lastQueryParams();
    expect(skippedParams).toContain("skipped");
    expect(skippedParams).toContain(null);
  });

  it("sets workout completion timestamps for completed inserts and clears them for non-completed inserts", async () => {
    executeMock.mockResolvedValue([row]);

    await drizzleWorkoutRepository.upsert({
      userId,
      name: "Done",
      status: "completed",
    });
    const completedParams = lastQueryParams();
    expect(completedParams).toContain("completed");
    expect(
      completedParams.find(
        (param) => typeof param === "string" && /T.*Z$/.test(param),
      ),
    ).toBeDefined();

    await drizzleWorkoutRepository.upsert({
      userId,
      name: "Skipped",
      status: "skipped",
    });
    const skippedParams = lastQueryParams();
    expect(skippedParams).toContain("skipped");
    expect(skippedParams).toContain(null);
  });

  it("rejects task and workout completedAt values for non-completed statuses before querying", async () => {
    await expect(
      drizzleTaskRepository.upsert({
        userId,
        dailyPlanId: planId,
        title: "Invalid",
        status: "todo",
        completedAt: "2026-05-31T12:00:00.000Z",
      }),
    ).rejects.toThrow(
      "daily task completedAt can only be set when status is completed",
    );
    expect(executeMock).not.toHaveBeenCalled();

    await expect(
      drizzleWorkoutRepository.upsert({
        userId,
        name: "Invalid",
        status: "planned",
        completedAt: "2026-05-31T12:00:00.000Z",
      }),
    ).rejects.toThrow(
      "workout completedAt can only be set when status is completed",
    );
    expect(executeMock).not.toHaveBeenCalled();
  });

  it("binds user-controlled task values without interpolating SQL strings", async () => {
    executeMock.mockResolvedValue([row]);

    await drizzleTaskRepository.upsert({
      userId,
      dailyPlanId: planId,
      title: maliciousText,
      description: maliciousText,
    });
    expectSafeQueryWith(maliciousText);

    await drizzleTaskRepository.listByDate(userId, maliciousText);
    expectSafeQueryWith(maliciousText);
  });

  it("binds user-controlled workout values without interpolating SQL strings", async () => {
    executeMock.mockResolvedValue([row]);

    await drizzleWorkoutRepository.upsert({
      userId,
      name: maliciousText,
      notes: maliciousText,
    });
    expectSafeQueryWith(maliciousText);

    await drizzleWorkoutRepository.listUpcoming(maliciousText);
    expectSafeQueryWith(maliciousText);
  });

  it("binds user-controlled schedule values without interpolating SQL strings", async () => {
    executeMock.mockResolvedValue([row]);

    await drizzleScheduleRepository.upsertPlan({
      userId,
      planDate: "2026-05-31",
      status: "active",
      summary: maliciousText,
    });
    expectSafeQueryWith(maliciousText);

    await drizzleScheduleRepository.listPlanCompletions(userId, {
      from: maliciousText,
      to: "2026-06-01",
    });
    expectSafeQueryWith(maliciousText);
  });

  it("binds user-controlled weight, note, mood, reminder, and user values", async () => {
    executeMock.mockResolvedValue([row]);

    await drizzleWeightRepository.create({
      userId,
      loggedOn: "2026-05-31",
      weightValue: 180.25,
      notes: maliciousText,
    });
    expectSafeQueryWith(maliciousText);

    await drizzleWeightRepository.listByDate(userId, maliciousText);
    expectSafeQueryWith(maliciousText);

    await drizzleNoteRepository.upsertByDate({
      userId,
      noteDate: "2026-05-31",
      body: maliciousText,
      dailyPlanId: planId,
    });
    expectSafeQueryWith(maliciousText);

    await drizzleNoteRepository.findByDate(userId, maliciousText);
    expectSafeQueryWith(maliciousText);

    await drizzleMoodRepository.create({
      userId,
      loggedOn: "2026-05-31",
      moodScore: 7,
      notes: maliciousText,
    });
    expectSafeQueryWith(maliciousText);

    await drizzleReminderRepository.create({
      userId,
      dailyPlanId: planId,
      relatedType: "daily_task",
      relatedId,
      category: "task",
      scheduledAt: maliciousText,
    });
    expectSafeQueryWith(maliciousText);

    await drizzleUserRepository.create({
      id: userId,
      displayName: maliciousText,
      email: "o'hara+sql@example.com",
      timezone: maliciousText,
    });
    expectSafeQueryWith(maliciousText);

    executeMock.mockResolvedValue([row]);
    await drizzleUserRepository.upsertOnboardingProfile({
      userId,
      displayName: maliciousText,
      age: 29,
      heightText: maliciousText,
      weightText: updatedMaliciousText,
      goals: ["Build strength"],
      preferredGymTiming: "Early morning",
      wakeTime: "06:30",
      timezone: maliciousText,
    });
    expectSafeQueryWith(updatedMaliciousText);

    await drizzleUserRepository.getById(maliciousText);
    expectSafeQueryWith(maliciousText);
  });
});
