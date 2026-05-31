import { envKeys } from "@/lib/env";

export const localDevUserIdEnvKey = envKeys.localDevUserId;

export function getLocalDevUserId(): string | null {
  if (process.env.NODE_ENV === "production") return null;
  return process.env[localDevUserIdEnvKey]?.trim() || null;
}

export function getActiveUserId(): string | null {
  return getLocalDevUserId();
}
