# Deployment Guide

RiseRoot is deployable to any platform that can run a Next.js application and connect to PostgreSQL through `DATABASE_URL`. This guide covers Render, Railway, Docker VPS, and generic providers without requiring vendor lock-in.

## Deployment principles

- Build one application artifact and configure environments with secrets.
- Use `DATABASE_URL` as the only required database contract.
- Keep migrations as provider-portable PostgreSQL SQL.
- Do not set local development identity variables in production.
- Verify authentication, migrations, backups, and smoke tests before traffic.

## Required environment variables

| Variable                        |         Required | Scope  | Notes                                                            |
| ------------------------------- | ---------------: | ------ | ---------------------------------------------------------------- |
| `DATABASE_URL`                  |              Yes | Server | PostgreSQL connection string.                                    |
| `NEXT_PUBLIC_APP_URL`           |      Recommended | Public | Canonical app URL for the deployed environment.                  |
| `NEXT_PUBLIC_SUPABASE_URL`      |         Optional | Public | Required only when using Supabase auth/client features.          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` |         Optional | Public | Required only when using Supabase auth/client features.          |
| `SUPABASE_SERVICE_ROLE_KEY`     |         Optional | Server | Use only when server-side Supabase admin verification is needed. |
| `LOCAL_DEV_USER_ID`             | No in production | Server | Local development only; production startup rejects it.           |
| `RISEROOT_DEV_USER_ID`          | No in production | Server | Legacy local development only.                                   |
| `NEXT_PUBLIC_APP_USER_ID`       | No in production | Public | Legacy value; must never grant production identity.              |

## Pre-deployment checklist

1. Provision PostgreSQL.
2. Enable required PostgreSQL extensions such as `pgcrypto`.
3. Apply migrations in order.
4. Configure secrets on the application platform.
5. Run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`.
6. Run `DB_SMOKE_CONNECT=1 npm run db:smoke` from an environment that can reach the database.
7. Confirm production does not include any development identity variables.
8. Configure backups, logging, monitoring, and rollback.

## Render

Render can host the Next.js web service and a managed PostgreSQL instance.

Recommended shape:

- **Service type:** Web Service.
- **Runtime:** Node.
- **Build command:** `npm install && npm run build`.
- **Start command:** `npm run start`.
- **Database:** Render PostgreSQL or any external PostgreSQL provider.

Render steps:

1. Create or connect a PostgreSQL database.
2. Copy the internal or external PostgreSQL connection string into the web service as `DATABASE_URL`.
3. Add `NEXT_PUBLIC_APP_URL` with the Render service URL or custom domain.
4. Add optional Supabase variables only if using Supabase auth.
5. Apply migrations from a one-off job, local trusted machine, or CI job:

   ```bash
   psql "$DATABASE_URL" -f supabase/migrations/20260518000000_create_core_schema.sql
   ```

6. Deploy the web service.
7. Check logs for environment validation errors.
8. Run post-deploy smoke tests.

Portability note: Render-specific configuration should stay in platform settings. Application code should not branch on Render environment variables.

## Railway

Railway can host both the Next.js service and PostgreSQL.

Recommended shape:

- **Service:** Node/Next.js application.
- **Build command:** `npm install && npm run build`.
- **Start command:** `npm run start`.
- **Database:** Railway PostgreSQL plugin or external PostgreSQL.

Railway steps:

1. Add a PostgreSQL service.
2. Reference the Railway-provided connection string as `DATABASE_URL` in the app service.
3. Set `NEXT_PUBLIC_APP_URL` to the Railway domain or custom domain.
4. Apply migrations with Railway shell, CI, or a trusted local network path.
5. Deploy the app service.
6. Verify logs, health, and API authentication.

Portability note: Railway variable interpolation is convenient, but the app should still see a normal PostgreSQL `DATABASE_URL`.

## Docker VPS

A Docker VPS deployment is provider-neutral and works on any VM with Docker or Docker Compose.

Example `Dockerfile`:

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
EXPOSE 3000
CMD ["npm", "run", "start"]
```

Example `docker-compose.yml`:

```yaml
services:
  app:
    build: .
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://postgres:postgres@db:5432/riseroot
      NEXT_PUBLIC_APP_URL: https://example.com
    ports:
      - "3000:3000"
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: riseroot
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

VPS steps:

1. Build and start services.
2. Apply migrations inside a one-off container or from the host:

   ```bash
   docker compose exec -T db psql -U postgres -d riseroot < supabase/migrations/20260518000000_create_core_schema.sql
   ```

3. Put a reverse proxy such as Caddy, Nginx, or Traefik in front of the app for TLS.
4. Configure backups for the PostgreSQL volume.
5. Configure log rotation and process monitoring.

## Generic providers

For any provider, map the deployment to this neutral contract:

| Capability | Requirement                                                     |
| ---------- | --------------------------------------------------------------- |
| Runtime    | Node.js capable of `npm run build` and `npm run start`.         |
| Database   | PostgreSQL with standard SQL features used by migrations.       |
| Secrets    | Ability to inject `DATABASE_URL` and auth variables at runtime. |
| Migrations | Ability to run SQL before or during release.                    |
| Networking | App can reach PostgreSQL securely.                              |
| TLS        | Platform or reverse proxy terminates HTTPS.                     |
| Logs       | Access to app and database logs.                                |
| Backups    | Automated PostgreSQL backups and tested restore.                |

Generic deployment sequence:

1. Provision database.
2. Apply migrations.
3. Configure environment variables.
4. Build application.
5. Start application.
6. Run smoke tests.
7. Enable monitoring and backups.
8. Promote traffic.

## Migration strategy

The safest release flow is:

1. Apply backward-compatible migrations.
2. Deploy application code.
3. Run smoke tests.
4. Remove deprecated schema only in later releases after confirming no running code uses it.

Avoid migrations that require provider-specific SQL unless documented and isolated. Keep destructive migrations separate and reversible when possible.

## Post-deploy smoke tests

After every deployment:

- Load the home page.
- Verify unauthenticated API requests fail with `401`.
- Verify authenticated requests cannot access another user's records.
- Verify `/api/days` returns the expected local date for a supplied timezone.
- Verify notes can be saved and reloaded.
- Verify application logs have no startup environment errors.
- Verify database logs have no repeated connection or permission errors.

## Rollback

Rollback should be platform-neutral:

1. Keep the previous application build available.
2. Prefer backward-compatible migrations so the previous build can run against the current schema.
3. If a database rollback is required, restore from a verified backup or run a documented down migration.
4. Re-run smoke tests after rollback.

## Avoiding vendor lock-in

- Keep provider-specific settings outside application code.
- Use `DATABASE_URL`, not provider SDKs, for primary persistence.
- Use standard PostgreSQL migrations.
- Keep auth verification behind a server boundary so the token provider can be changed later.
- Document provider-specific operational steps without coupling domain logic to them.
