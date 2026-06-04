import { NextRequest } from "next/server";
import {
  withApiHandler,
  parseJsonBody,
  parseWithSchema,
} from "@/lib/api/response";
import { weightRepository } from "@/repositories";
import { z } from "zod";
import { isoDateSchema, nonEmptyStringSchema } from "@/lib/api/validation";
import {
  assertAuthorizedUserId,
  requireAuthenticatedUser,
} from "@/lib/identity/authentication";

const querySchema = z
  .object({ date: isoDateSchema, userId: nonEmptyStringSchema.optional() })
  .strict();
const createSchema = z
  .object({
    userId: nonEmptyStringSchema.optional(),
    date: isoDateSchema,
    weight: z.number().positive(),
    unit: z.enum(["lb", "kg"]),
  })
  .strict();

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await requireAuthenticatedUser(request);
    const query = parseWithSchema(
      {
        date: request.nextUrl.searchParams.get("date") ?? "",
        userId: request.nextUrl.searchParams.get("userId") ?? undefined,
      },
      querySchema,
      "query",
    );
    assertAuthorizedUserId(query.userId, user.id);
    const rows = await weightRepository.listByDate(user.id, query.date);
    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      loggedOn: row.loggedOn,
      weightValue: row.weightValue,
      weightUnit: row.weightUnit,
      source: row.source,
    }));
  });
}

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await requireAuthenticatedUser(request);
    const body = await parseJsonBody(request, createSchema);
    assertAuthorizedUserId(body.userId, user.id);
    const row = await weightRepository.create({
      userId: user.id,
      loggedOn: body.date,
      weightValue: body.weight,
      weightUnit: body.unit,
      source: "manual",
    });
    return {
      id: row.id,
      userId: row.userId,
      loggedOn: row.loggedOn,
      weightValue: row.weightValue,
      weightUnit: row.weightUnit,
      source: row.source,
    };
  });
}
