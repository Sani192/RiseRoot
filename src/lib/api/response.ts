import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { ApiError, toApiError } from "@/lib/api/errors";
import { z, ZodType } from "zod";

function meta() {
  return {
    requestId: randomUUID(),
    generatedAt: new Date().toISOString(),
  };
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data, meta: meta() }, { status });
}

export function fail(error: unknown) {
  const mapped = toApiError(error);

  return NextResponse.json(
    {
      error: {
        code: mapped.code,
        message: mapped.message,
        details: mapped.details,
      },
      meta: meta(),
    },
    { status: mapped.status },
  );
}

export async function withApiHandler<T>(handler: () => Promise<T>) {
  try {
    return ok(await handler());
  } catch (error) {
    return fail(error);
  }
}

export function assertDate(input: string, field: string): string {
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(input);
  if (!valid) {
    throw new ApiError(
      "VALIDATION_ERROR",
      `${field} must be YYYY-MM-DD.`,
      400,
      [{ field, message: "Expected YYYY-MM-DD." }],
    );
  }
  return input;
}

export async function parseJsonBody<S extends ZodType>(
  request: NextRequest,
  schema: S,
  source = "body",
): Promise<z.infer<S>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new ApiError(
      "VALIDATION_ERROR",
      `${source} must be valid JSON.`,
      400,
    );
  }

  return parseWithSchema(raw, schema, source);
}

export function parseWithSchema<S extends ZodType>(
  value: unknown,
  schema: S,
  source = "request",
): z.infer<S> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new ApiError(
      "VALIDATION_ERROR",
      `${source} validation failed.`,
      400,
      parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || source,
        message: issue.message,
      })),
    );
  }

  return parsed.data;
}
