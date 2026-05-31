import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { ApiError } from "@/lib/api/errors";
import { envKeys, getOptionalSupabaseAdapterEnv } from "@/lib/env";
import { getLocalDevUserId } from "@/lib/supabase/session";
import type { Database } from "@/lib/supabase/types";

export const localDevUserIdEnvKey = envKeys.localDevUserId;

export interface AuthenticatedUser {
  id: string;
}

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get("authorization");
  if (!authorization) return null;

  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;

  return token.trim() || null;
}

async function resolveSupabaseUserId(
  accessToken: string,
): Promise<string | null> {
  const { url, anonKey, serviceRoleKey } = getOptionalSupabaseAdapterEnv();
  const apiKey = serviceRoleKey || anonKey;
  if (!url || !apiKey) return null;

  const client = createClient<Database>(url, apiKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await client.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user.id;
}

export async function resolveAuthenticatedUser(
  request: NextRequest,
): Promise<AuthenticatedUser | null> {
  const bearerToken = getBearerToken(request);
  if (bearerToken) {
    const userId = await resolveSupabaseUserId(bearerToken);
    if (userId) return { id: userId };
  }

  const localDevUserId = getLocalDevUserId();
  if (localDevUserId) return { id: localDevUserId };

  return null;
}

export async function requireAuthenticatedUser(
  request: NextRequest,
): Promise<AuthenticatedUser> {
  const user = await resolveAuthenticatedUser(request);
  if (!user) {
    throw new ApiError(
      "UNAUTHENTICATED",
      `Authentication is required. In local development only, set the server-only ${localDevUserIdEnvKey} variable; never expose it with a NEXT_PUBLIC_ prefix.`,
      401,
    );
  }

  return user;
}

export function assertAuthorizedUserId(
  clientSuppliedUserId: string | null | undefined,
  authenticatedUserId: string,
): void {
  if (clientSuppliedUserId && clientSuppliedUserId !== authenticatedUserId) {
    throw new ApiError(
      "FORBIDDEN",
      "Authenticated user cannot access resources owned by another user.",
      403,
    );
  }
}
