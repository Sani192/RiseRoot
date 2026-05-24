import type { ApiEnvelope } from "@/lib/api/contracts";

export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || "error" in payload) {
    const message = "error" in payload ? payload.error.message : "Request failed.";
    throw new Error(message);
  }

  return payload.data;
}
