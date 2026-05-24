export interface ApiMeta {
  generatedAt: string;
  requestId: string;
}

export interface ApiErrorPayload {
  code: "VALIDATION_ERROR" | "NOT_FOUND" | "CONFLICT" | "INTERNAL_ERROR";
  details?: Array<{ field: string; message: string }>;
  message: string;
}

export interface ApiSuccess<T> {
  data: T;
  meta: ApiMeta;
}

export interface ApiFailure {
  error: ApiErrorPayload;
  meta: ApiMeta;
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;
