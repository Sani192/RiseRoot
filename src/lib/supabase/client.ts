import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types";

import { envKeys, getOptionalSupabaseAdapterEnv } from "@/lib/env";

const supabaseUrlEnvKey = envKeys.supabaseUrl;
const supabaseAnonKeyEnvKey = envKeys.supabaseAnonKey;

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

  const env = getOptionalSupabaseAdapterEnv();

  if (!env.url) {
    missingEnvVars.push(supabaseUrlEnvKey);
  }

  if (!env.anonKey) {
    missingEnvVars.push(supabaseAnonKeyEnvKey);
  }

  return missingEnvVars;
}

export function getSupabaseProjectConfig(): SupabaseProjectConfig | null {
  const { url, anonKey } = getOptionalSupabaseAdapterEnv();

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
