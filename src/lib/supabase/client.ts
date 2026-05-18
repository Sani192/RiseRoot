import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types";

const supabaseUrlEnvKey = "NEXT_PUBLIC_SUPABASE_URL";
const supabaseAnonKeyEnvKey = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

export interface SupabaseProjectConfig {
  url: string;
  anonKey: string;
}

export class SupabaseConfigurationError extends Error {
  readonly missingEnvVars: string[];

  constructor(missingEnvVars: string[]) {
    super(
      `Supabase is not configured. Missing ${missingEnvVars.join(
        ", ",
      )}. Add these environment variables to .env.local to enable the data layer.`,
    );
    this.name = "SupabaseConfigurationError";
    this.missingEnvVars = missingEnvVars;
  }
}

let browserClient: SupabaseClient<Database> | null = null;
let hasWarnedAboutMissingConfig = false;

export function getMissingSupabaseEnvVars(): string[] {
  const missingEnvVars: string[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missingEnvVars.push(supabaseUrlEnvKey);
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missingEnvVars.push(supabaseAnonKeyEnvKey);
  }

  return missingEnvVars;
}

export function getSupabaseProjectConfig(): SupabaseProjectConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseProjectConfig() !== null;
}

export function getSupabaseConfigurationError(): SupabaseConfigurationError | null {
  const missingEnvVars = getMissingSupabaseEnvVars();

  if (missingEnvVars.length === 0) {
    return null;
  }

  return new SupabaseConfigurationError(missingEnvVars);
}

export function getBrowserSupabaseClient(): SupabaseClient<Database> | null {
  if (browserClient) {
    return browserClient;
  }

  const config = getSupabaseProjectConfig();

  if (!config) {
    warnAboutMissingSupabaseConfig();
    return null;
  }

  browserClient = createClient<Database>(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}

export function requireBrowserSupabaseClient(): SupabaseClient<Database> {
  const client = getBrowserSupabaseClient();

  if (!client) {
    const error = getSupabaseConfigurationError();
    throw (
      error ??
      new SupabaseConfigurationError([supabaseUrlEnvKey, supabaseAnonKeyEnvKey])
    );
  }

  return client;
}

function warnAboutMissingSupabaseConfig(): void {
  if (hasWarnedAboutMissingConfig || process.env.NODE_ENV === "production") {
    return;
  }

  hasWarnedAboutMissingConfig = true;

  const error = getSupabaseConfigurationError();

  if (error) {
    console.warn(error.message);
  }
}
