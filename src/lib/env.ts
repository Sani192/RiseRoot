export const envKeys = {
  databaseUrl: "DATABASE_URL",
  appUrl: "NEXT_PUBLIC_APP_URL",
  supabaseUrl: "NEXT_PUBLIC_SUPABASE_URL",
  supabaseAnonKey: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  supabaseServiceRoleKey: "SUPABASE_SERVICE_ROLE_KEY",
  localDevUserId: "LOCAL_DEV_USER_ID",
  legacyDevelopmentUserId: "RISEROOT_DEV_USER_ID",
  legacyPublicAppUserId: "NEXT_PUBLIC_APP_USER_ID",
} as const;

export class InvalidProductionEnvError extends Error {
  readonly invalidEnvVars: string[];

  constructor(invalidEnvVars: string[]) {
    super(
      `Invalid production environment variables: ${invalidEnvVars.join(
        ", ",
      )}. Remove development-only identity settings from production and use authenticated server-side identity instead.`,
    );
    this.name = "InvalidProductionEnvError";
    this.invalidEnvVars = invalidEnvVars;
  }
}

export class MissingServerEnvError extends Error {
  readonly missingEnvVars: string[];

  constructor(missingEnvVars: string[]) {
    super(
      `Missing required server environment variables: ${missingEnvVars.join(
        ", ",
      )}. Add them to .env.local (or your deploy environment) and restart the Next.js server.`,
    );
    this.name = "MissingServerEnvError";
    this.missingEnvVars = missingEnvVars;
  }
}

export function getEnabledDevOnlyIdentityEnvVars(): string[] {
  return [
    envKeys.localDevUserId,
    envKeys.legacyDevelopmentUserId,
    envKeys.legacyPublicAppUserId,
  ].filter((key) => Boolean(process.env[key]?.trim()));
}

export function validateProductionStartupEnv(): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const devOnlyIdentityEnvVars = getEnabledDevOnlyIdentityEnvVars();
  if (devOnlyIdentityEnvVars.length > 0) {
    throw new InvalidProductionEnvError(devOnlyIdentityEnvVars);
  }
}

export function getMissingRequiredServerEnvVars(): string[] {
  return [envKeys.databaseUrl].filter((key) => !process.env[key]);
}

export function validateRequiredServerEnvVars(): void {
  validateProductionStartupEnv();

  const missing = getMissingRequiredServerEnvVars();

  if (missing.length === 0) {
    return;
  }

  throw new MissingServerEnvError(missing);
}

export function warnIfRequiredServerEnvVarsAreMissing(): void {
  validateProductionStartupEnv();

  if (process.env.NODE_ENV === "production") {
    return;
  }

  const missing = getMissingRequiredServerEnvVars();

  if (missing.length === 0) {
    return;
  }

  console.error(new MissingServerEnvError(missing).message);
}

export interface SupabaseAdapterEnv {
  url?: string | undefined;
  anonKey?: string | undefined;
  serviceRoleKey?: string | undefined;
}

export function getOptionalSupabaseAdapterEnv(): SupabaseAdapterEnv {
  return {
    url: process.env[envKeys.supabaseUrl],
    anonKey: process.env[envKeys.supabaseAnonKey],
    serviceRoleKey: process.env[envKeys.supabaseServiceRoleKey],
  };
}
