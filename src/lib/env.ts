export const envKeys = {
  appUrl: "NEXT_PUBLIC_APP_URL",
  supabaseUrl: "NEXT_PUBLIC_SUPABASE_URL",
  supabaseAnonKey: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
} as const;

export class MissingPublicEnvError extends Error {
  readonly missingEnvVars: string[];

  constructor(missingEnvVars: string[]) {
    super(
      `Missing required public environment variables: ${missingEnvVars.join(
        ", ",
      )}. Add them to .env.local and restart the Next.js dev server.`,
    );
    this.name = "MissingPublicEnvError";
    this.missingEnvVars = missingEnvVars;
  }
}

export function getMissingRequiredPublicEnvVars(): string[] {
  return Object.values(envKeys).filter((key) => !process.env[key]);
}

export function validateRequiredPublicEnvVars(): void {
  const missing = getMissingRequiredPublicEnvVars();

  if (missing.length === 0) {
    return;
  }

  throw new MissingPublicEnvError(missing);
}

export function warnIfRequiredPublicEnvVarsAreMissing(): void {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const missing = getMissingRequiredPublicEnvVars();

  if (missing.length === 0) {
    return;
  }

  console.error(new MissingPublicEnvError(missing).message);
}
