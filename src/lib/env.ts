export const envKeys = {
  databaseUrl: "DATABASE_URL",
  appUrl: "NEXT_PUBLIC_APP_URL",
  supabaseUrl: "NEXT_PUBLIC_SUPABASE_URL",
  supabaseAnonKey: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  supabaseServiceRoleKey: "SUPABASE_SERVICE_ROLE_KEY",
} as const;

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

export function getMissingRequiredServerEnvVars(): string[] {
  return [envKeys.databaseUrl].filter((key) => !process.env[key]);
}

export function validateRequiredServerEnvVars(): void {
  const missing = getMissingRequiredServerEnvVars();

  if (missing.length === 0) {
    return;
  }

  throw new MissingServerEnvError(missing);
}

export function warnIfRequiredServerEnvVarsAreMissing(): void {
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
  url?: string;
  anonKey?: string;
  serviceRoleKey?: string;
}

export function getOptionalSupabaseAdapterEnv(): SupabaseAdapterEnv {
  return {
    url: process.env[envKeys.supabaseUrl],
    anonKey: process.env[envKeys.supabaseAnonKey],
    serviceRoleKey: process.env[envKeys.supabaseServiceRoleKey],
  };
}
