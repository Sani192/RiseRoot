import { NextRequest } from "next/server";
import { getDailyMealPlan, type MealContext } from "@/features/meals";
import {
  withApiHandler,
  parseJsonBody,
  parseWithSchema,
} from "@/lib/api/response";
import { toLocalIsoDate } from "@/lib/date";
import {
  ianaTimezoneSchema,
  isoDateSchema,
  nonEmptyStringSchema,
} from "@/lib/api/validation";
import {
  assertAuthorizedUserId,
  requireAuthenticatedUser,
} from "@/lib/identity/authentication";
import { mealSuggestionRepository } from "@/repositories";
import { ApiError } from "@/lib/api/errors";
import { z } from "zod";

const mealTypeSchema = z.enum(["breakfast", "lunch", "dinner", "snack"]);
const mealContextSchema = z.enum([
  "quick",
  "steady-energy",
  "comfort",
  "post-workout",
]);

const querySchema = z
  .object({
    userId: nonEmptyStringSchema.optional(),
    date: isoDateSchema.optional(),
    timezone: ianaTimezoneSchema.default("UTC"),
    mealType: mealTypeSchema.optional(),
    context: mealContextSchema.default("steady-energy"),
  })
  .strict();

const statusSchema = z.enum(["accepted", "skipped", "replaced", "completed"]);
const updateBodySchema = z
  .object({
    userId: nonEmptyStringSchema.optional(),
    id: nonEmptyStringSchema,
    date: isoDateSchema.optional(),
    timezone: ianaTimezoneSchema.default("UTC"),
    status: statusSchema,
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(1000).nullable().optional(),
  })
  .strict();

type MealSuggestionResponse = {
  id: string;
  date: string;
  mealType: string;
  title: string;
  description: string | null;
  ingredients: unknown[];
  nutritionSummary: Record<string, unknown>;
  status: string;
  source: string;
  updatedAt: string;
};

function toResponse(suggestion: {
  id: string;
  mealDate: string;
  mealType: string;
  title: string;
  description: string | null;
  ingredients: unknown[];
  nutritionSummary: Record<string, unknown>;
  status: string;
  source: string;
  updatedAt: string;
}): MealSuggestionResponse {
  return {
    id: suggestion.id,
    date: suggestion.mealDate,
    mealType: suggestion.mealType,
    title: suggestion.title,
    description: suggestion.description,
    ingredients: suggestion.ingredients,
    nutritionSummary: suggestion.nutritionSummary,
    status: suggestion.status,
    source: suggestion.source,
    updatedAt: suggestion.updatedAt,
  };
}

function templateSeeds(userId: string, mealDate: string, context: MealContext) {
  return getDailyMealPlan(context).map((suggestion) => ({
    userId,
    mealDate,
    mealType: suggestion.mealType,
    title: suggestion.title,
    description: suggestion.description,
    ingredients: [],
    nutritionSummary: {
      context: suggestion.context,
      prepMinutes: suggestion.prepMinutes,
      tags: suggestion.tags,
    },
    source: "template" as const,
  }));
}

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await requireAuthenticatedUser(request);
    const query = parseWithSchema(
      {
        userId: request.nextUrl.searchParams.get("userId") ?? undefined,
        date: request.nextUrl.searchParams.get("date") ?? undefined,
        timezone: request.nextUrl.searchParams.get("timezone") ?? "UTC",
        mealType: request.nextUrl.searchParams.get("mealType") || undefined,
        context: request.nextUrl.searchParams.get("context") || "steady-energy",
      },
      querySchema,
      "query",
    );
    assertAuthorizedUserId(query.userId, user.id);

    const date = query.date ?? toLocalIsoDate(new Date(), query.timezone);
    const existingForDate = await mealSuggestionRepository.listByDate({
      userId: user.id,
      mealDate: date,
    });

    if (existingForDate.length === 0) {
      await mealSuggestionRepository.seedForDate({
        userId: user.id,
        mealDate: date,
        suggestions: templateSeeds(user.id, date, query.context),
      });
    }

    const listInput = {
      userId: user.id,
      mealDate: date,
      ...(query.mealType ? { mealType: query.mealType } : {}),
    };
    const persistedSuggestions =
      await mealSuggestionRepository.listByDate(listInput);

    return persistedSuggestions.map(toResponse);
  });
}

export async function PUT(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await requireAuthenticatedUser(request);
    const body = await parseJsonBody(request, updateBodySchema);
    assertAuthorizedUserId(body.userId, user.id);

    const date = body.date ?? toLocalIsoDate(new Date(), body.timezone);
    const updated = await mealSuggestionRepository.update({
      userId: user.id,
      id: body.id,
      mealDate: date,
      status: body.status,
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined
        ? { description: body.description }
        : {}),
    });

    if (!updated) {
      throw new ApiError("NOT_FOUND", "Meal suggestion not found.", 404);
    }

    return toResponse(updated);
  });
}
