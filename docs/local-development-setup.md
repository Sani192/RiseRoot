# Local Development Setup

This guide describes how to run RiseRoot locally with a portable PostgreSQL-backed setup.

## Prerequisites

- Node.js 22 or a compatible active LTS runtime.
- npm.
- PostgreSQL 15+ or a Docker runtime capable of running PostgreSQL.
- `psql` is recommended for applying migrations and inspecting data.

## Local app setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local`:

   ```bash
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/riseroot
   LOCAL_DEV_USER_ID=00000000-0000-0000-0000-000000000001
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. Start the Next.js development server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`.

`LOCAL_DEV_USER_ID` is intentionally server-only and local-only. Never use `NEXT_PUBLIC_APP_USER_ID` as an identity mechanism, and never set local development identity variables in production.

## PostgreSQL setup

Create a database and enable required PostgreSQL features:

```bash
createdb riseroot
psql "$DATABASE_URL" -c 'create extension if not exists pgcrypto;'
```

Apply the schema migration:

```bash
psql "$DATABASE_URL" -f supabase/migrations/20260518000000_create_core_schema.sql
```

Create a local user that matches `LOCAL_DEV_USER_ID` if one is not inserted by seed data:

```bash
psql "$DATABASE_URL" <<'SQL'
insert into public.users (id, display_name, email, timezone, unit_system)
values (
  '00000000-0000-0000-0000-000000000001',
  'Local Developer',
  'local@example.test',
  'UTC',
  'imperial'
)
on conflict (id) do nothing;
SQL
```

## Docker setup

If you prefer Docker for local PostgreSQL, run:

```bash
docker run --name riseroot-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=riseroot \
  -p 5432:5432 \
  -d postgres:16
```

Then set:

```bash
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/riseroot
```

Apply the migration after the container is ready:

```bash
psql "$DATABASE_URL" -f supabase/migrations/20260518000000_create_core_schema.sql
```

Stop and start the container with:

```bash
docker stop riseroot-postgres
docker start riseroot-postgres
```

Remove it completely with:

```bash
docker rm -f riseroot-postgres
```

## Migration instructions

The repository currently stores the core schema as SQL under `supabase/migrations/`.

Local migration workflow:

1. Ensure `DATABASE_URL` points to the intended local database.
2. Apply migration files in filename order.
3. Re-run smoke tests.
4. Commit any new migration files with the code that depends on them.

Example:

```bash
for file in supabase/migrations/*.sql; do
  psql "$DATABASE_URL" -f "$file"
done
```

Migrations should remain provider-portable PostgreSQL where possible. If a provider-specific operation becomes necessary, document it in the migration and deployment guide.

## Seed instructions

A minimal local seed only needs a user row matching `LOCAL_DEV_USER_ID`. Additional seed records can be inserted manually for feature testing.

Example daily plan seed:

```bash
psql "$DATABASE_URL" <<'SQL'
insert into public.daily_plans (user_id, plan_date, status, summary)
values (
  '00000000-0000-0000-0000-000000000001',
  current_date,
  'planned',
  'Local development plan'
)
on conflict (user_id, plan_date) do update
set summary = excluded.summary,
    updated_at = now();
SQL
```

Example daily note seed:

```bash
psql "$DATABASE_URL" <<'SQL'
insert into public.notes (user_id, note_date, category, body)
values (
  '00000000-0000-0000-0000-000000000001',
  current_date,
  'daily',
  'Local seed note'
);
SQL
```

## Reset instructions

For a disposable local database:

```bash
dropdb --if-exists riseroot
createdb riseroot
psql "$DATABASE_URL" -f supabase/migrations/20260518000000_create_core_schema.sql
```

For Docker:

```bash
docker rm -f riseroot-postgres
docker run --name riseroot-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=riseroot \
  -p 5432:5432 \
  -d postgres:16
psql "$DATABASE_URL" -f supabase/migrations/20260518000000_create_core_schema.sql
```

After reset, reinsert the local development user and any test data needed for the workflow you are validating.

## Validation commands

Run these before opening a pull request or deploying:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run db:smoke
DB_SMOKE_CONNECT=1 npm run db:smoke
```

`npm run db:smoke` can run without a database connection to verify dependencies load. `DB_SMOKE_CONNECT=1 npm run db:smoke` requires a reachable `DATABASE_URL` and executes `select 1`.

## Troubleshooting

### `DATABASE_URL is required`

Create `.env.local` or export `DATABASE_URL` in the shell running the command. Restart `npm run dev` after changing environment variables.

### `Authentication is required`

For local development, set `LOCAL_DEV_USER_ID` in `.env.local` and make sure a matching row exists in `public.users`. Do not use public environment variables for identity.

### `function gen_random_uuid() does not exist`

Enable `pgcrypto`:

```bash
psql "$DATABASE_URL" -c 'create extension if not exists pgcrypto;'
```

### Connection refused

Confirm PostgreSQL is running and the port in `DATABASE_URL` is correct. For Docker, run:

```bash
docker ps --filter name=riseroot-postgres
```

### SSL errors against a managed provider

Use the provider's recommended connection string parameters. Prefer changing `DATABASE_URL` over adding provider-specific application branches.

### Schema errors after pulling changes

Reapply migrations to a fresh local database if migration order or constraints changed. Local disposable data should be reset rather than manually patched unless you are debugging a migration.
