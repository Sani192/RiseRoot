import { NextRequest } from "next/server";

import { ApiError } from "@/lib/api/errors";
import {
  localDevUserIdEnvKey,
  getLocalDevUserId,
} from "@/lib/identity/session";

export { localDevUserIdEnvKey } from "@/lib/identity/session";

export interface AuthenticatedUser {
  id: string;
}

export interface BearerIdentityProvider {
  resolveUserId(accessToken: string): Promise<string | null>;
}

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get("authorization");
  if (!authorization) return null;

  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;

  return token.trim() || null;
}

export async function resolveAuthenticatedUser(
  request: NextRequest,
  identityProviders?:
    | BearerIdentityProvider[]
    | Promise<BearerIdentityProvider[]>,
): Promise<AuthenticatedUser | null> {
  const bearerToken = getBearerToken(request);
  if (bearerToken) {
    const providers = identityProviders ?? [];
    for (const provider of await providers) {
      const userId = await provider.resolveUserId(bearerToken);
      if (userId) return { id: userId };
    }
  }

  const localDevUserId = getLocalDevUserId();
  if (localDevUserId) return { id: localDevUserId };

  return null;
}

export async function requireAuthenticatedUser(
  request: NextRequest,
  identityProviders?:
    | BearerIdentityProvider[]
    | Promise<BearerIdentityProvider[]>,
): Promise<AuthenticatedUser> {
  const user = identityProviders
    ? await resolveAuthenticatedUser(request, identityProviders)
    : await resolveAuthenticatedUser(request);
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
