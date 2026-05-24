import { describe, expect, it } from 'vitest';

import { generateDailyPlan, getWeekdayName } from '@/features/daily-plans';
import { getDailyWorkoutSplit } from '@/features/tasks';
import { getDailyMealPlan, getMealSuggestions } from '@/features/meals';
import { createSundayWeightLog, isSundayWeightLogDate } from '@/features/weight';

describe('daily schedule and selection logic', () => {
  it('generates a plan that matches the date weekday', () => {
    const date = new Date('2026-05-25T12:00:00.000Z'); // Monday
    const plan = generateDailyPlan(date);

    expect(plan.date).toBe('2026-05-25');
    expect(plan.weekday).toBe('Monday');
    expect(plan.weekday).toBe(getWeekdayName(date));
    expect(plan.tasks.length).toBeGreaterThan(0);
  });

  it('returns stable weekday workout split mappings', () => {
    expect(getDailyWorkoutSplit('Monday')).toMatchObject({
      focus: expect.stringContaining('Upper'),
      recovery: false,
    });
    expect(getDailyWorkoutSplit('Wednesday')).toMatchObject({
      focus: expect.stringContaining('Lower'),
      recovery: false,
    });
    expect(getDailyWorkoutSplit('Sunday')).toMatchObject({
      recovery: true,
    });
  });

  it('enforces Sunday-only weekly weight log creation', () => {
    const sunday = new Date('2026-05-24T09:00:00.000Z');
    const monday = new Date('2026-05-25T09:00:00.000Z');

    expect(isSundayWeightLogDate(sunday)).toBe(true);
    expect(isSundayWeightLogDate(monday)).toBe(false);
    expect(createSundayWeightLog(180, 'lb', sunday)).toMatchObject({
      date: '2026-05-24',
      weight: 180,
      unit: 'lb',
    });
    expect(() => createSundayWeightLog(180, 'lb', monday)).toThrow(
      /reserved for Sundays/i,
    );
  });

  it('selects meal suggestions by type and falls back for unsupported context', () => {
    expect(getMealSuggestions('breakfast', 'quick')[0]?.mealType).toBe('breakfast');

    const postWorkoutPlan = getDailyMealPlan('post-workout');
    expect(postWorkoutPlan).toHaveLength(3);
    expect(postWorkoutPlan.map((meal) => meal.mealType)).toEqual([
      'breakfast',
      'lunch',
      'dinner',
    ]);
  });
});
