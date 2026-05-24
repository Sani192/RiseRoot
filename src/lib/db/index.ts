export type DrizzleDbInstance = {
  client: unknown;
  db: unknown;
};

let instance: DrizzleDbInstance | null = null;

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required.");
  return url;
}

export function getDb(): DrizzleDbInstance {
  if (instance) return instance;

  const postgresModule = require("postgres") as (url: string, options?: Record<string, unknown>) => unknown;
  const drizzleModule = require("drizzle-orm/postgres-js") as { drizzle: (client: unknown) => unknown };

  const client = postgresModule(getDatabaseUrl(), { prepare: false, max: 1 });
  const db = drizzleModule.drizzle(client);
  instance = { client, db };
  return instance;
}

export async function closeDb(): Promise<void> {
  if (!instance) return;
  const maybeClient = instance.client as { end?: () => Promise<void> };
  await maybeClient.end?.();
  instance = null;
}
