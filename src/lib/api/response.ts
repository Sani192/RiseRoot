import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { ApiError, toApiError } from "@/lib/api/errors";

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
    throw new ApiError("VALIDATION_ERROR", `${field} must be YYYY-MM-DD.`, 400, [
      { field, message: "Expected YYYY-MM-DD." },
    ]);
  }
  return input;
}
