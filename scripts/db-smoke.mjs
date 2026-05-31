#!/usr/bin/env node

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const databaseUrl = process.env.DATABASE_URL;
const shouldConnect = process.env.DB_SMOKE_CONNECT === "1";

function loadDependency(specifier) {
  try {
    return require(specifier);
  } catch (error) {
    throw new Error(
      `Unable to load ${specifier}. Run npm install before retrying the DB smoke check.`,
      {
        cause: error,
      },
    );
  }
}

const postgresModule = loadDependency("postgres");
const drizzleModule = loadDependency("drizzle-orm/postgres-js");

const postgres = postgresModule.default ?? postgresModule;
const drizzle = drizzleModule.drizzle;

if (typeof postgres !== "function") {
  throw new Error(
    "The postgres package did not expose the expected client factory.",
  );
}

if (typeof drizzle !== "function") {
  throw new Error(
    "drizzle-orm/postgres-js did not expose the expected drizzle factory.",
  );
}

if (!databaseUrl) {
  console.log("Loaded postgres and drizzle-orm/postgres-js successfully.");
  console.log(
    "Set DATABASE_URL and run DB_SMOKE_CONNECT=1 npm run db:smoke to verify a live database connection.",
  );
  process.exit(0);
}

const sql = postgres(databaseUrl, { prepare: false, max: 1 });
const db = drizzle(sql);

if (!shouldConnect) {
  await sql.end();
  console.log(
    "Loaded postgres and drizzle-orm/postgres-js successfully and created a Drizzle client.",
  );
  console.log(
    "Run DB_SMOKE_CONNECT=1 npm run db:smoke to execute SELECT 1 against DATABASE_URL.",
  );
  process.exit(0);
}

try {
  await sql`select 1 as ok`;
  console.log("DATABASE_URL connection smoke test passed with SELECT 1.");
} finally {
  await sql.end();
}

void db;
