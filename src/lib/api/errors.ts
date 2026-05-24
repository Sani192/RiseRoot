export class ApiError extends Error {
  constructor(
    public readonly code: "VALIDATION_ERROR" | "NOT_FOUND" | "CONFLICT" | "INTERNAL_ERROR",
    message: string,
    public readonly status: number,
    public readonly details?: Array<{ field: string; message: string }>,
  ) {
    super(message);
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  return new ApiError("INTERNAL_ERROR", "An unexpected error occurred.", 500);
}
