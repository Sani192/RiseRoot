import { NextRequest } from "next/server";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/lib/api/identity";
import { parseJsonBody, withApiHandler } from "@/lib/api/response";
import { ianaTimezoneSchema, nonEmptyStringSchema } from "@/lib/api/validation";
import { userRepository } from "@/repositories";

const gymWindows = [
  "Early morning",
  "Lunch break",
  "After work",
  "Flexible",
] as const;
const supportedGoals = [
  "Build strength",
  "Lose fat",
  "Feel energized",
  "Move daily",
] as const;

const optionalTrimmedString = z
  .string()
  .trim()
  .max(80)
  .optional()
  .transform((value) => (value ? value : null));

const onboardingProfileSchema = z
  .object({
    name: nonEmptyStringSchema.max(80),
    age: z.coerce.number().int().min(13).max(100),
    height: optionalTrimmedString,
    weight: optionalTrimmedString,
    goals: z.array(z.enum(supportedGoals)).min(1).max(supportedGoals.length),
    gymTiming: z.enum(gymWindows),
    wakeTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Expected HH:mm."),
    timezone: ianaTimezoneSchema.optional(),
  })
  .strict();

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await requireAuthenticatedUser(request);
    const body = await parseJsonBody(request, onboardingProfileSchema);
    const result = await userRepository.upsertOnboardingProfile({
      userId: user.id,
      displayName: body.name.trim(),
      age: body.age,
      heightText: body.height,
      weightText: body.weight,
      goals: body.goals,
      preferredGymTiming: body.gymTiming,
      wakeTime: body.wakeTime,
      ...(body.timezone ? { timezone: body.timezone } : {}),
    });

    return {
      user: {
        id: result.user.id,
        displayName: result.user.displayName,
        timezone: result.user.timezone,
        unitSystem: result.user.unitSystem,
      },
      profile: {
        age: result.profile.age,
        height: result.profile.heightText,
        weight: result.profile.weightText,
        goals: result.profile.goals,
        gymTiming: result.profile.preferredGymTiming,
        wakeTime: result.profile.wakeTime,
        updatedAt: result.profile.updatedAt,
      },
      message: "Profile setup saved. You can update this any time in Settings.",
    };
  });
}
