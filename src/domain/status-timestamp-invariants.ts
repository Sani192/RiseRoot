import type { DailyTaskStatus, WorkoutStatus } from "@/domain";

export class StatusTimestampValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StatusTimestampValidationError";
  }
}

type CompletionStatus = DailyTaskStatus | WorkoutStatus;

type CompletionFields = {
  status?: CompletionStatus | undefined;
  completedAt?: string | null | undefined;
};

type CompletionTimestampOptions = {
  entityName: string;
  defaultStatus?: CompletionStatus | undefined;
  now?: (() => Date) | undefined;
};

export function normalizeCompletionTimestamp<T extends CompletionFields>(
  input: T,
  options: CompletionTimestampOptions,
): T & { completedAt: string | null; status?: CompletionStatus | undefined } {
  const status = input.status ?? options.defaultStatus;
  const completedAt = input.completedAt;

  if (completedAt && status !== "completed") {
    throw new StatusTimestampValidationError(
      `${options.entityName} completedAt can only be set when status is completed.`,
    );
  }

  if (status === "completed") {
    return {
      ...input,
      ...(input.status === undefined && options.defaultStatus === undefined
        ? {}
        : { status }),
      completedAt:
        completedAt ?? (options.now ?? (() => new Date()))().toISOString(),
    };
  }

  if (status !== undefined) {
    return {
      ...input,
      status,
      completedAt: null,
    };
  }

  return {
    ...input,
    completedAt: completedAt ?? null,
  };
}
